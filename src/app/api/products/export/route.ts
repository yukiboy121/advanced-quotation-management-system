import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "products.read");
  if (!auth.ok) return auth.response;

  const rows = await db.query.products.findMany();
  const header = ["name", "sku", "unit", "stock", "sellingPrice"];
  const body = rows
    .map((r) => [r.name, r.sku, r.unit, String(r.stock), String(r.sellingPrice)])
    .map((cols) => cols.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(`${header.join(",")}\n${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=products.csv",
    },
  });
}
