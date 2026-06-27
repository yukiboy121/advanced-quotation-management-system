import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { signAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { rateLimit } from "@/lib/security";
import { registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [created] = await db
    .insert(users)
    .values({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
    })
    .returning({ id: users.id, email: users.email });

  const defaultRole = await db.query.roles.findFirst({ where: eq(roles.name, "admin") });
  if (defaultRole) {
    await db.insert(userRoles).values({ userId: created.id, roleId: defaultRole.id }).onConflictDoNothing();
  }

  const token = await signAuthToken({
    userId: created.id,
    email: created.email,
    roles: defaultRole ? ["admin"] : ["viewer"],
  });

  await logActivity({
    userId: created.id,
    action: "register",
    entityType: "user",
    entityId: created.id,
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
