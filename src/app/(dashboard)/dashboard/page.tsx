import { count, desc, eq, sql } from "drizzle-orm";
import { DashboardOverview } from "@/components/modules/dashboard-overview";
import { db } from "@/db";
import { customers, products, quotations } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getStats() {
  const [total] = await db.select({ value: count() }).from(quotations);
  const [accepted] = await db.select({ value: count() }).from(quotations).where(eq(quotations.status, "accepted"));
  const [pending] = await db.select({ value: count() }).from(quotations).where(sql`${quotations.status} in ('draft','sent','viewed')`);
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

  return {
    totals: {
      totalQuotations: total?.value ?? 0,
      accepted: accepted?.value ?? 0,
      pending: pending?.value ?? 0,
      rejected: rejected?.value ?? 0,
      expired: expired?.value ?? 0,
      customers: customerCount?.value ?? 0,
      products: productCount?.value ?? 0,
    },
    monthlyRevenue: (monthlyRevenueRaw.rows as Array<{ month: string; revenue: number }>).map((r) => ({
      month: r.month,
      revenue: Number(r.revenue ?? 0),
    })),
    latest,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <h2 className="text-2xl font-semibold">Enterprise Quotation Command Center</h2>
        <p className="mt-1 text-sm text-indigo-100">Track pipeline, conversion, and revenue in real-time.</p>
      </div>
      <DashboardOverview totals={stats.totals} monthlyRevenue={stats.monthlyRevenue} />
    </div>
  );
}
