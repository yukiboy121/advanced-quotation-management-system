import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { currencies, quotationItems, quotationStatusHistory, quotationVersions, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { calculateLineTotal, calculateQuoteTotals } from "@/lib/quote-calculator";
import { quotationSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "quotations.read");
  if (!auth.ok) return auth.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const status = req.nextUrl.searchParams.get("status")?.trim();
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(100, Number(req.nextUrl.searchParams.get("pageSize") ?? "10"));
  const offset = (Math.max(1, page) - 1) * pageSize;

  const where = and(
    q ? or(ilike(quotations.quoteNumber, `%${q}%`), ilike(quotations.notes, `%${q}%`)) : undefined,
    status ? eq(quotations.status, status as never) : undefined
  );

  const rows = await db.query.quotations.findMany({
    where,
    orderBy: [desc(quotations.createdAt)],
    limit: pageSize,
    offset,
  });

  const totalRows = await db.select({ count: count() }).from(quotations).where(where);
  const total = totalRows[0]?.count ?? 0;

  return NextResponse.json({ data: rows, pagination: { page, pageSize, total } });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "quotations.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const currency = await db.query.currencies.findFirst({ where: eq(currencies.code, parsed.data.currencyCode) });

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

  const nextNoRows = await db.execute(sql`SELECT COALESCE(MAX((regexp_replace(quote_number, '\\D', '', 'g'))::int), 0) + 1 AS next FROM quotations`);
  const nextNo = Number((nextNoRows.rows[0] as { next?: number }).next ?? 1);
  const quoteNumber = `QT-${String(nextNo).padStart(5, "0")}`;

  const [created] = await db
    .insert(quotations)
    .values({
      quoteNumber,
      customerId: parsed.data.customerId,
      salesPersonId: auth.user.userId,
      currencyId: currency?.id,
      issueDate: new Date(),
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
      publicToken: randomUUID(),
    })
    .returning();

  await db.insert(quotationItems).values(
    lines.map((item, i) => ({
      quotationId: created.id,
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

  await db.insert(quotationStatusHistory).values({
    quotationId: created.id,
    previousStatus: null,
    newStatus: "draft",
    changedBy: auth.user.userId,
  });

  await db.insert(quotationVersions).values({
    quotationId: created.id,
    versionNumber: 1,
    createdBy: auth.user.userId,
    snapshot: { quotation: created, items: lines },
  });

  await logActivity({
    userId: auth.user.userId,
    action: "quotation.create",
    entityType: "quotation",
    entityId: created.id,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
