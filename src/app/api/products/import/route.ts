import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "products.write");
  if (!auth.ok) return auth.response;

  const body = await req.text();
  const lines = body.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: "Invalid CSV" }, { status: 400 });

  const rows = lines.slice(1).map((line, idx) => {
    const [name, sku, unit, stock, sellingPrice] = line.split(",").map((x) => x.replaceAll('"', "").trim());
    return {
      name: name || `Imported Product ${idx + 1}`,
      sku: sku || `SKU-IMP-${Date.now()}-${idx}`,
      unit: unit || "pcs",
      stock: Number(stock || 0),
      sellingPrice: String(Number(sellingPrice || 0)),
    };
  });

  await db.insert(products).values(rows);
  return NextResponse.json({ ok: true, imported: rows.length });
}
