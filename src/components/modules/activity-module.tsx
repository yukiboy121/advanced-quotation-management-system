"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

export function ActivityModule() {
  const [rows, setRows] = useState<Activity[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/activity-logs?page=1&pageSize=30");
      if (!res.ok) return;
      const body = await res.json();
      setRows(body.data ?? []);
    };

    void load();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold">Activity Timeline</h2>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="font-medium">{row.action}</p>
            <p className="text-xs text-slate-500">
              {row.entityType} #{row.entityId} • {new Date(row.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
