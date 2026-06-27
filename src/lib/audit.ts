import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function logActivity(input: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(activityLogs).values({
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details ?? {},
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
