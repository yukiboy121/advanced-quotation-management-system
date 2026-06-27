"use client";

import { RevenueChart } from "@/components/revenue-chart";

type Props = {
  totals: {
    totalQuotations: number;
    accepted: number;
    pending: number;
    rejected: number;
    expired: number;
    customers: number;
    products: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
};

export function DashboardOverview({ totals, monthlyRevenue }: Props) {
  const cards = [
    ["Total Quotations", totals.totalQuotations],
    ["Accepted", totals.accepted],
    ["Pending", totals.pending],
    ["Rejected", totals.rejected],
    ["Expired", totals.expired],
    ["Customers", totals.customers],
    ["Products", totals.products],
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">Revenue Trend</h3>
        <RevenueChart points={monthlyRevenue} />
      </section>
    </div>
  );
}
