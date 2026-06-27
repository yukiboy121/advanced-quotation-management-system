import { count, desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { productSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "products.read");
  if (!auth.ok) return auth.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(100, Number(req.nextUrl.searchParams.get("pageSize") ?? "10"));
  const offset = (Math.max(1, page) - 1) * pageSize;

  const filter = q ? or(ilike(products.name, `%${q}%`), ilike(products.sku, `%${q}%`)) : undefined;

  const rows = await db.query.products.findMany({
    where: filter,
    orderBy: [desc(products.createdAt)],
    limit: pageSize,
    offset,
  });

  const totalRows = await db.select({ count: count() }).from(products).where(filter);
  const total = totalRows[0]?.count ?? 0;

  return NextResponse.json({ data: rows, pagination: { page, pageSize, total } });
}

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "products.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [created] = await db
    .insert(products)
    .values({
      name: parsed.data.name,
      sku: parsed.data.sku,
      unit: parsed.data.unit,
      stock: parsed.data.stock,
      sellingPrice: String(parsed.data.sellingPrice),
      description: parsed.data.description || null,
    })
    .returning();

  await logActivity({ userId: auth.user.userId, action: "product.create", entityType: "product", entityId: created.id });
  return NextResponse.json({ data: created }, { status: 201 });
}
