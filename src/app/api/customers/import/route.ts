import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "customers.write");
  if (!auth.ok) return auth.response;

  const body = await req.text();
  const lines = body.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: "Invalid CSV" }, { status: 400 });

  const rows = lines.slice(1).map((line, idx) => {
    const [customerName, email, phone, city, country] = line.split(",").map((x) => x.replaceAll('"', "").trim());
    return {
      customerCode: `CUST-IMP-${Date.now()}-${idx}`,
      customerName: customerName || "Unknown",
      email: email || null,
      phone: phone || null,
      city: city || null,
      country: country || null,
    };
  });

  await db.insert(customers).values(rows);
  return NextResponse.json({ ok: true, imported: rows.length });
}
