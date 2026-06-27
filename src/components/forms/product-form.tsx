"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/validation";

type FormValue = z.input<typeof productSchema>;

export function ProductForm({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValue>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", sku: "", stock: 0, sellingPrice: 0, unit: "pcs" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      reset();
      onCreated();
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Add Product</h3>
      <input placeholder="Product Name" {...register("name")} className="rounded-lg border bg-transparent p-2 text-sm" />
      {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
      <input placeholder="SKU" {...register("sku")} className="rounded-lg border bg-transparent p-2 text-sm" />
      <div className="grid grid-cols-3 gap-2">
        <input type="number" placeholder="Stock" {...register("stock")} className="rounded-lg border bg-transparent p-2 text-sm" />
        <input type="number" step="0.01" placeholder="Price" {...register("sellingPrice")} className="rounded-lg border bg-transparent p-2 text-sm" />
        <input placeholder="Unit" {...register("unit")} className="rounded-lg border bg-transparent p-2 text-sm" />
      </div>
      <button disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
        {isSubmitting ? "Saving..." : "Create Product"}
      </button>
    </form>
  );
}
