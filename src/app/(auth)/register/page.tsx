"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Admin User");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Registration failed");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Advanced Quote Suite</p>
        <h1 className="mt-2 text-2xl font-semibold">Create account</h1>

        <div className="mt-6 space-y-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Full Name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border bg-transparent p-2 text-sm" placeholder="Password" />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 p-2 text-sm font-medium text-white">Create Account</button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Have an account? <Link href="/login" className="text-indigo-500">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
