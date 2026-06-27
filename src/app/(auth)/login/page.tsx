"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Login failed");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Advanced Quote Suite</p>
        <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage enterprise quotations</p>

        <div className="mt-6 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Password" />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 p-2 text-sm font-medium text-white">Sign In</button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          New account? <Link href="/register" className="text-indigo-500">Register</Link>
        </p>
      </form>
    </main>
  );
}
