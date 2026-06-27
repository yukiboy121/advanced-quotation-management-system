import { count, desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, products, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "dashboard.read");
  if (!auth.ok) return auth.response;

  const [total] = await db.select({ value: count() }).from(quotations);
  const [accepted] = await db.select({ value: count() }).from(quotations).where(eq(quotations.status, "accepted"));
  const [pending] = await db
    .select({ value: count() })
    .from(quotations)
    .where(sql`${quotations.status} in ('draft','sent','viewed')`);
  const [rejected] = await db.select({ value: count() }).from(quotations).where(eq(quotations.status, "rejected"));
  const [expired] = await db.select({ value: count() }).from(quotations).where(eq(quotations.status, "expired"));
  const [customerCount] = await db.select({ value: count() }).from(customers);
  const [productCount] = await db.select({ value: count() }).from(products);

  const monthlyRevenueRaw = await db.execute(sql`
    SELECT TO_CHAR(issue_date, 'YYYY-MM') AS month, SUM(grand_total::numeric)::float AS revenue
    FROM quotations
    WHERE status IN ('accepted', 'sent', 'viewed')
    GROUP BY 1
    ORDER BY 1 ASC
    LIMIT 12
  `);

  const latest = await db.query.quotations.findMany({ orderBy: [desc(quotations.createdAt)], limit: 5 });

  return NextResponse.json({
    data: {
      totals: {
        totalQuotations: total?.value ?? 0,
        accepted: accepted?.value ?? 0,
        pending: pending?.value ?? 0,
        rejected: rejected?.value ?? 0,
        expired: expired?.value ?? 0,
        customers: customerCount?.value ?? 0,
        products: productCount?.value ?? 0,
      },
      monthlyRevenue: monthlyRevenueRaw.rows,
      latestQuotations: latest,
    },
  });
}
