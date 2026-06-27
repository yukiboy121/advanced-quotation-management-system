import { count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "dashboard.read");
  if (!auth.ok) return auth.response;

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(100, Number(req.nextUrl.searchParams.get("pageSize") ?? "15"));
  const offset = (Math.max(1, page) - 1) * pageSize;
  const entityType = req.nextUrl.searchParams.get("entityType");

  const rows = await db.query.activityLogs.findMany({
    where: entityType ? eq(activityLogs.entityType, entityType) : undefined,
    orderBy: [desc(activityLogs.createdAt)],
    limit: pageSize,
    offset,
  });

  const totalRows = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(entityType ? eq(activityLogs.entityType, entityType) : undefined);

  return NextResponse.json({ data: rows, pagination: { page, pageSize, total: totalRows[0]?.count ?? 0 } });
}
