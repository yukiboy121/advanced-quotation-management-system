import { NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true as const, user };
}

export async function requirePermission(req: NextRequest, permission: string) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth;

  if (!hasPermission(auth.user.roles, permission)) {
    return { ok: false as const, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, user: auth.user };
}
