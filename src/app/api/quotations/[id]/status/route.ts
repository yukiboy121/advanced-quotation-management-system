import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotationStatusHistory, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.write");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const status = body?.status as
    | "draft"
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected"
    | "expired"
    | "cancelled";

  if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 });

  const { id } = await params;
  const existing = await db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(quotations).set({ status, updatedAt: new Date() }).where(eq(quotations.id, id));
  await db.insert(quotationStatusHistory).values({
    quotationId: id,
    previousStatus: existing.status,
    newStatus: status,
    changedBy: auth.user.userId,
    reason: body?.reason,
  });

  return NextResponse.json({ ok: true });
}
