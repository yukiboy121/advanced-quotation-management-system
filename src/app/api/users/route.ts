import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "users.write");
  if (!auth.ok) return auth.response;

  const userRows = await db.query.users.findMany({ orderBy: [asc(users.fullName)] });
  const assignments = await db.query.userRoles.findMany();
  const roleRows = await db.query.roles.findMany();

  const roleMap = new Map(roleRows.map((r) => [r.id, r.name]));
  const byUser = new Map<string, string[]>();

  for (const a of assignments) {
    const roleName = roleMap.get(a.roleId);
    if (!roleName) continue;
    byUser.set(a.userId, [...(byUser.get(a.userId) ?? []), roleName]);
  }

  return NextResponse.json({
    data: userRows.map((u) => ({
      ...u,
      roles: byUser.get(u.id) ?? [],
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission(req, "users.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const userId = body?.userId as string;
  const roleIds = body?.roleIds as string[];

  if (!userId || !Array.isArray(roleIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  await db.insert(userRoles).values(roleIds.map((roleId) => ({ userId, roleId }))).onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
