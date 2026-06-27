import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeSync } from "@/components/theme-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Advanced Quotation Generator",
  description: "Enterprise-level quotation SaaS built with Next.js and PostgreSQL.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
