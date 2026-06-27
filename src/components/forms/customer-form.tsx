"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { customerSchema } from "@/lib/validation";

type FormValue = z.infer<typeof customerSchema>;

export function CustomerForm({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValue>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/customers", {
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
      <h3 className="text-sm font-semibold">Add Customer</h3>
      <input placeholder="Customer Name" {...register("customerName")} className="rounded-lg border bg-transparent p-2 text-sm" />
      {errors.customerName && <p className="text-xs text-rose-500">{errors.customerName.message}</p>}
      <input placeholder="Company Name" {...register("companyName")} className="rounded-lg border bg-transparent p-2 text-sm" />
      <input placeholder="Email" {...register("email")} className="rounded-lg border bg-transparent p-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Phone" {...register("phone")} className="rounded-lg border bg-transparent p-2 text-sm" />
        <input placeholder="City" {...register("city")} className="rounded-lg border bg-transparent p-2 text-sm" />
      </div>
      <button disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
        {isSubmitting ? "Saving..." : "Create Customer"}
      </button>
    </form>
  );
}
