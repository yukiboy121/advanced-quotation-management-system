import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "users.write");
  if (!auth.ok) return auth.response;

  const rows = await db.query.roles.findMany({ orderBy: [asc(roles.name)] });
  return NextResponse.json({ data: rows });
}
