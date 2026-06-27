import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "customers.read");
  if (!auth.ok) return auth.response;

  const rows = await db.query.customers.findMany();
  const header = ["customerCode", "customerName", "companyName", "email", "phone", "city", "country"];
  const body = rows
    .map((r) => [r.customerCode, r.customerName, r.companyName ?? "", r.email ?? "", r.phone ?? "", r.city ?? "", r.country ?? ""])
    .map((cols) => cols.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(`${header.join(",")}\n${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=customers.csv",
    },
  });
}
