import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requirePermission } from "@/lib/api";
import { logActivity } from "@/lib/audit";
import { productSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "products.read");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const row = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: row });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "products.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id } = await params;
  const [updated] = await db
    .update(products)
    .set({
      name: parsed.data.name,
      sku: parsed.data.sku,
      unit: parsed.data.unit,
      stock: parsed.data.stock,
      sellingPrice: String(parsed.data.sellingPrice),
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await logActivity({ userId: auth.user.userId, action: "product.update", entityType: "product", entityId: id });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "products.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logActivity({ userId: auth.user.userId, action: "product.delete", entityType: "product", entityId: id });
  return NextResponse.json({ ok: true });
}
