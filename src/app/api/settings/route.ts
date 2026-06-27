import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { requirePermission } from "@/lib/api";

const SETTINGS_KEY = "company";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "dashboard.read");
  if (!auth.ok) return auth.response;

  const row = await db.query.appSettings.findFirst({ where: eq(appSettings.key, SETTINGS_KEY) });
  return NextResponse.json({ data: row?.value ?? {} });
}

export async function PUT(req: NextRequest) {
  const auth = await requirePermission(req, "settings.write");
  if (!auth.ok) return auth.response;

  const value = (await req.json()) as Record<string, unknown>;
  await db
    .insert(appSettings)
    .values({ key: SETTINGS_KEY, value, updatedBy: auth.user.userId })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date(), updatedBy: auth.user.userId },
    });

  return NextResponse.json({ ok: true });
}
