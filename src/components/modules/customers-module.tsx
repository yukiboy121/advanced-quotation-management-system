"use client";

import { useEffect, useState } from "react";
import { CustomerForm } from "@/components/forms/customer-form";

type Customer = {
  id: string;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
};

export function CustomersModule() {
  const [rows, setRows] = useState<Customer[]>([]);

  const load = async () => {
    const res = await fetch("/api/customers?page=1&pageSize=20");
    if (!res.ok) return;
    const body = await res.json();
    setRows(body.data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <CustomerForm onCreated={load} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Customers</h2>
          <a href="/api/customers/export" className="text-xs text-indigo-500">Export CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{row.customerCode}</td>
                  <td>{row.customerName}</td>
                  <td>{row.companyName ?? "-"}</td>
                  <td>{row.email ?? "-"}</td>
                  <td>{row.phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
