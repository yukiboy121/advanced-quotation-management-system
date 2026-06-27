import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, quotationItems, quotations } from "@/db/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quotation = await db.query.quotations.findFirst({ where: eq(quotations.publicToken, token) });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const customer = await db.query.customers.findFirst({ where: eq(customers.id, quotation.customerId) });
  const items = await db.query.quotationItems.findMany({ where: eq(quotationItems.quotationId, quotation.id), orderBy: [asc(quotationItems.sortOrder)] });

  return NextResponse.json({
    data: {
      quoteNumber: quotation.quoteNumber,
      status: quotation.status,
      issueDate: quotation.issueDate,
      expiryDate: quotation.expiryDate,
      grandTotal: quotation.grandTotal,
      notes: quotation.notes,
      customer: {
        customerName: customer?.customerName,
        companyName: customer?.companyName,
      },
      items,
    },
  });
}
