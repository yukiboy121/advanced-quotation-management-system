import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { signAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { rateLimit } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email.toLowerCase()) });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const assigned = await db.query.userRoles.findMany({ where: eq(userRoles.userId, user.id) });
  const roleIds = assigned.map((r) => r.roleId);
  const roleRows = roleIds.length ? await db.query.roles.findMany({ where: inArray(roles.id, roleIds) }) : [];

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const token = await signAuthToken({
    userId: user.id,
    email: user.email,
    roles: roleRows.map((r) => r.name),
  });

  await logActivity({
    userId: user.id,
    action: "login",
    entityType: "user",
    entityId: user.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
