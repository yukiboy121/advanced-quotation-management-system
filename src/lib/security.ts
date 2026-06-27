import { NextRequest } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, limit = 80, windowMs = 60_000) {
  const key =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";

  const now = Date.now();
  const prev = rateMap.get(key);

  if (!prev || prev.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  prev.count += 1;
  rateMap.set(key, prev);

  if (prev.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((prev.resetAt - now) / 1000) };
  }

  return { ok: true, remaining: limit - prev.count };
}

export function sanitizeText(input: string) {
  return input.replace(/[<>]/g, "").trim();
}
