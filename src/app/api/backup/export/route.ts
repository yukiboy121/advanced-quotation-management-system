import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { backups, customers, products, quotationItems, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "settings.write");
  if (!auth.ok) return auth.response;

  const payload = {
    customers: await db.query.customers.findMany(),
    products: await db.query.products.findMany(),
    quotations: await db.query.quotations.findMany(),
    quotationItems: await db.query.quotationItems.findMany(),
    exportedAt: new Date().toISOString(),
  };

  const [record] = await db
    .insert(backups)
    .values({ name: `backup-${Date.now()}`, payload, createdBy: auth.user.userId })
    .returning({ id: backups.id, name: backups.name, createdAt: backups.createdAt });

  return NextResponse.json({ data: payload, backup: record });
}
