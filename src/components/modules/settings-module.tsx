"use client";

import { useEffect, useState } from "react";

export function SettingsModule() {
  const [payload, setPayload] = useState<Record<string, string>>({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    quotePrefix: "QT",
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const body = await res.json();
      setPayload((prev) => ({ ...prev, ...(body.data ?? {}) }));
    };
    void load();
  }, []);

  const save = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold">Company Settings</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <input
          placeholder="Company Name"
          value={payload.companyName ?? ""}
          onChange={(e) => setPayload((s) => ({ ...s, companyName: e.target.value }))}
          className="rounded-lg border bg-transparent p-2 text-sm"
        />
        <input
          placeholder="Email"
          value={payload.email ?? ""}
          onChange={(e) => setPayload((s) => ({ ...s, email: e.target.value }))}
          className="rounded-lg border bg-transparent p-2 text-sm"
        />
        <input
          placeholder="Phone"
          value={payload.phone ?? ""}
          onChange={(e) => setPayload((s) => ({ ...s, phone: e.target.value }))}
          className="rounded-lg border bg-transparent p-2 text-sm"
        />
        <input
          placeholder="Website"
          value={payload.website ?? ""}
          onChange={(e) => setPayload((s) => ({ ...s, website: e.target.value }))}
          className="rounded-lg border bg-transparent p-2 text-sm"
        />
      </div>
      <button onClick={save} className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white">
        Save Settings
      </button>
    </section>
  );
}
