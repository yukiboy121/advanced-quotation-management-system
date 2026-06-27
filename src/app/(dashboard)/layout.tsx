import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserFromCookies();
  if (!user) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
