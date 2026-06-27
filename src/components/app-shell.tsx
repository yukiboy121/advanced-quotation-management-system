"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, FileText, LayoutDashboard, LogOut, Moon, Settings, Sun, Users, Boxes, Activity, BarChart3 } from "lucide-react";
import { ReactNode } from "react";
import { useUiStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/products", icon: Boxes, label: "Products" },
  { href: "/quotations", icon: FileText, label: "Quotations" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-slate-200/70 bg-white/80 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Advanced Quote Suite</p>
            <h1 className="mt-2 text-2xl font-semibold">Enterprise SaaS</h1>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quotation Generator</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Premium enterprise workflow</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border p-2 dark:border-slate-700" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button className="rounded-lg border p-2 dark:border-slate-700">
                <Bell className="h-4 w-4" />
              </button>
              <button className="rounded-lg border p-2 dark:border-slate-700" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
