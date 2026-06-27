"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/forms/product-form";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
  sellingPrice: string;
};

export function ProductsModule() {
  const [rows, setRows] = useState<Product[]>([]);

  const load = async () => {
    const res = await fetch("/api/products?page=1&pageSize=20");
    if (!res.ok) return;
    const body = await res.json();
    setRows(body.data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-4 lg:grid-cols-[360px,1fr]">
      <ProductForm onCreated={load} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Products</h2>
          <a href="/api/products/export" className="text-xs text-indigo-500">Export CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2">SKU</th>
                <th>Name</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{row.sku}</td>
                  <td>{row.name}</td>
                  <td>{row.stock}</td>
                  <td>{row.unit}</td>
                  <td>{row.sellingPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
