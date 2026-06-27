import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "reports.read");
  if (!auth.ok) return auth.response;

  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const rows = await db.execute(sql`
    SELECT TO_CHAR(issue_date, 'Mon') AS month,
           COALESCE(SUM(grand_total::numeric),0)::float AS total
    FROM quotations
    WHERE EXTRACT(YEAR FROM issue_date) = ${year}
    GROUP BY TO_CHAR(issue_date, 'Mon'), EXTRACT(MONTH FROM issue_date)
    ORDER BY EXTRACT(MONTH FROM issue_date)
  `);

  return NextResponse.json({ data: rows.rows, year });
}
