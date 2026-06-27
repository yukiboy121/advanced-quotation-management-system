import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireAuth } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const rows = await db.query.notifications.findMany({
    where: eq(notifications.userId, auth.user.userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 25,
  });

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const [created] = await db
    .insert(notifications)
    .values({
      userId: auth.user.userId,
      title: body?.title ?? "Notification",
      message: body?.message ?? "",
      type: body?.type ?? "info",
      actionUrl: body?.actionUrl ?? null,
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
