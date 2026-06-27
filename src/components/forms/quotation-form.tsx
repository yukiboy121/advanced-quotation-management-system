"use client";

import { useState } from "react";

type Props = {
  customers: Array<{ id: string; customerName: string }>;
  onCreated: () => void;
};

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  taxRate: number;
};

export function QuotationForm({ customers, onCreated }: Props) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, unitPrice: 0, discountType: "fixed", discountValue: 0, taxRate: 0 }]);

  const addItem = () => setItems((prev) => [...prev, { name: "", quantity: 1, unitPrice: 0, discountType: "fixed", discountValue: 0, taxRate: 0 }]);
  const duplicateItem = (idx: number) => setItems((prev) => [...prev, { ...prev[idx] }]);

  const save = async () => {
    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerId,
        currencyCode: "USD",
        discountType: "fixed",
        discountValue: 0,
        vatAmount: 0,
        nbtAmount: 0,
        shippingAmount: 0,
        additionalCharges: 0,
        roundOff: 0,
        items,
      }),
    });

    if (res.ok) onCreated();
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Generate Quotation</h3>
      <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm">
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.customerName}
          </option>
        ))}
      </select>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-2 rounded-lg border p-2">
            <input
              placeholder="Description"
              value={item.name}
              onChange={(e) => setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))}
              className="col-span-2 rounded border bg-transparent p-1 text-xs"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: Number(e.target.value) } : p)))}
              className="rounded border bg-transparent p-1 text-xs"
            />
            <input
              type="number"
              value={item.unitPrice}
              onChange={(e) => setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, unitPrice: Number(e.target.value) } : p)))}
              className="rounded border bg-transparent p-1 text-xs"
            />
            <input
              type="number"
              value={item.taxRate}
              onChange={(e) => setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, taxRate: Number(e.target.value) } : p)))}
              className="rounded border bg-transparent p-1 text-xs"
            />
            <button onClick={() => duplicateItem(idx)} className="rounded bg-slate-100 px-2 text-xs dark:bg-slate-800">
              Duplicate
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={addItem} className="rounded-lg border px-3 py-2 text-xs">Add Item</button>
        <button onClick={save} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Save Quote</button>
      </div>
    </section>
  );
}
