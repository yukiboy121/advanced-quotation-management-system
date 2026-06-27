"use client";

import { useEffect, useState } from "react";
import { QuotationForm } from "@/components/forms/quotation-form";

type CustomerOption = { id: string; customerName: string };
type Quote = { id: string; quoteNumber: string; status: string; grandTotal: string; createdAt: string };

export function QuotationsModule() {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const load = async () => {
    const [cRes, qRes] = await Promise.all([
      fetch("/api/customers?page=1&pageSize=100"),
      fetch("/api/quotations?page=1&pageSize=20"),
    ]);

    if (cRes.ok) {
      const cBody = await cRes.json();
      setCustomers(
        (cBody.data ?? []).map((c: { id: string; customerName: string }) => ({
          id: c.id,
          customerName: c.customerName,
        }))
      );
    }

    if (qRes.ok) {
      const qBody = await qRes.json();
      setQuotes(qBody.data ?? []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-4 lg:grid-cols-[420px,1fr]">
      <QuotationForm customers={customers} onCreated={load} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Latest Quotations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2">Quote #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{q.quoteNumber}</td>
                  <td className="capitalize">{q.status}</td>
                  <td>{q.grandTotal}</td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <a href={`/api/quotations/${q.id}/pdf`} className="text-xs text-indigo-500">PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
