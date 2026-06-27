import { and, desc, eq, max } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotationItems, quotationVersions, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { calculateLineTotal, calculateQuoteTotals } from "@/lib/quote-calculator";
import { quotationSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.read");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const quotation = await db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await db.query.quotationItems.findMany({ where: eq(quotationItems.quotationId, id), orderBy: [desc(quotationItems.sortOrder)] });
  const versions = await db.query.quotationVersions.findMany({ where: eq(quotationVersions.quotationId, id), orderBy: [desc(quotationVersions.versionNumber)] });

  return NextResponse.json({ data: { quotation, items, versions } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines = parsed.data.items.map((item) => ({ ...item, lineTotal: calculateLineTotal(item) }));
  const totals = calculateQuoteTotals({
    items: parsed.data.items,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    vatAmount: parsed.data.vatAmount,
    nbtAmount: parsed.data.nbtAmount,
    shippingAmount: parsed.data.shippingAmount,
    additionalCharges: parsed.data.additionalCharges,
    roundOff: parsed.data.roundOff,
  });

  const [updated] = await db
    .update(quotations)
    .set({
      customerId: parsed.data.customerId,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      paymentTerms: parsed.data.paymentTerms,
      deliveryTerms: parsed.data.deliveryTerms,
      notes: parsed.data.notes,
      discountType: parsed.data.discountType,
      discountValue: String(parsed.data.discountValue),
      vatAmount: String(parsed.data.vatAmount),
      nbtAmount: String(parsed.data.nbtAmount),
      shippingAmount: String(parsed.data.shippingAmount),
      additionalCharges: String(parsed.data.additionalCharges),
      roundOff: String(parsed.data.roundOff),
      subTotal: String(totals.subTotal),
      grandTotal: String(totals.grandTotal),
      updatedAt: new Date(),
    })
    .where(eq(quotations.id, id))
    .returning();

  await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
  await db.insert(quotationItems).values(
    lines.map((item, i) => ({
      quotationId: id,
      sortOrder: i + 1,
      name: item.name,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      discountType: item.discountType,
      discountValue: String(item.discountValue),
      taxRate: String(item.taxRate),
      lineTotal: String(item.lineTotal),
    }))
  );

  const maxVersionRows = await db
    .select({ maxVersion: max(quotationVersions.versionNumber) })
    .from(quotationVersions)
    .where(eq(quotationVersions.quotationId, id));
  const nextVersion = Number(maxVersionRows[0]?.maxVersion ?? 0) + 1;

  await db.insert(quotationVersions).values({
    quotationId: id,
    versionNumber: nextVersion,
    createdBy: auth.user.userId,
    snapshot: { quotation: updated, items: lines },
  });

  await logActivity({ userId: auth.user.userId, action: "quotation.update", entityType: "quotation", entityId: id });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const [deleted] = await db.delete(quotations).where(eq(quotations.id, id)).returning({ id: quotations.id });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logActivity({ userId: auth.user.userId, action: "quotation.delete", entityType: "quotation", entityId: id });
  return NextResponse.json({ ok: true });
}
