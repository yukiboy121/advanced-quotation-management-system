import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { customerSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "customers.read");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const row = await db.query.customers.findFirst({ where: eq(customers.id, id) });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: row });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "customers.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(customers)
    .set({
      companyName: parsed.data.companyName || null,
      customerName: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logActivity({ userId: auth.user.userId, action: "customer.update", entityType: "customer", entityId: id });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "customers.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const [deleted] = await db.delete(customers).where(eq(customers.id, id)).returning({ id: customers.id });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logActivity({ userId: auth.user.userId, action: "customer.delete", entityType: "customer", entityId: id });
  return NextResponse.json({ ok: true });
}
