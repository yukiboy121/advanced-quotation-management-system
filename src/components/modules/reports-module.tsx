"use client";

import { useEffect, useState } from "react";

type Point = { month: string; total: number };

export function ReportsModule() {
  const [rows, setRows] = useState<Point[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/reports/revenue?year=${new Date().getFullYear()}`);
      if (!res.ok) return;
      const body = await res.json();
      setRows((body.data ?? []) as Point[]);
    };

    void load();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Revenue Report</h2>
        <div className="flex gap-2 text-xs">
          <a href="/api/backup/export" className="text-indigo-500">Export JSON</a>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2">Month</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={`${r.month}-${idx}`} className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2">{r.month}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
