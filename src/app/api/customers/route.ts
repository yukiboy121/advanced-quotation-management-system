import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { customerSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "customers.read");
  if (!auth.ok) return auth.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(100, Number(req.nextUrl.searchParams.get("pageSize") ?? "10"));
  const offset = (Math.max(1, page) - 1) * pageSize;

  const filter = q
    ? or(ilike(customers.customerName, `%${q}%`), ilike(customers.companyName, `%${q}%`), ilike(customers.email, `%${q}%`))
    : undefined;

  const rows = await db.query.customers.findMany({
    where: filter,
    orderBy: [desc(customers.createdAt)],
    limit: pageSize,
    offset,
  });

  const totalRows = await db.select({ count: count() }).from(customers).where(filter);
  const total = totalRows[0]?.count ?? 0;

  return NextResponse.json({ data: rows, pagination: { page, pageSize, total } });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "customers.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const nextCodeRows = await db.execute(sql`SELECT COALESCE(MAX((regexp_replace(customer_code, '\\D', '', 'g'))::int), 0) + 1 AS next FROM customers`);
  const nextCode = Number((nextCodeRows.rows[0] as { next?: number }).next ?? 1);
  const customerCode = `CUST-${String(nextCode).padStart(4, "0")}`;

  const [created] = await db
    .insert(customers)
    .values({
      customerCode,
      companyName: parsed.data.companyName || null,
      customerName: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      notes: parsed.data.notes || null,
    })
    .returning();

  await logActivity({
    userId: auth.user.userId,
    action: "customer.create",
    entityType: "customer",
    entityId: created.id,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
