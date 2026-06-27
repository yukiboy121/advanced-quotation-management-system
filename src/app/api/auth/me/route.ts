import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  return Response.json({ user: auth.user });
}
