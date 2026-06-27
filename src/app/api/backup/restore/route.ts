import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, products } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "settings.write");
  if (!auth.ok) return auth.response;

  const payload = (await req.json()) as {
    customers?: Array<{ customerCode: string; customerName: string }>;
    products?: Array<{ name: string; sku: string; sellingPrice: string | number }>;
  };

  if (payload.customers?.length) {
    await db.insert(customers).values(
      payload.customers.map((c) => ({
        customerCode: c.customerCode,
        customerName: c.customerName,
      }))
    ).onConflictDoNothing();
  }

  if (payload.products?.length) {
    await db.insert(products).values(
      payload.products.map((p) => ({
        name: p.name,
        sku: p.sku,
        sellingPrice: String(p.sellingPrice),
      }))
    ).onConflictDoNothing();
  }

  return NextResponse.json({ ok: true });
}
