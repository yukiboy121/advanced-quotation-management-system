import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, emailHistory, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";

const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.write");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const quote = await db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  const customer = await db.query.customers.findFirst({ where: eq(customers.id, quote.customerId) });
  if (!customer?.email) return NextResponse.json({ error: "Customer email missing" }, { status: 400 });

  const publicUrl = `${req.nextUrl.origin}/api/public/quotes/${quote.publicToken}`;
  const subject = `Quotation ${quote.quoteNumber}`;
  const body = `Hello ${customer.customerName},\n\nPlease review your quotation ${quote.quoteNumber}.\nTotal: ${quote.grandTotal}\nView online: ${publicUrl}\n\nRegards`;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "noreply@example.com",
    to: customer.email,
    subject,
    text: body,
  });

  await db.insert(emailHistory).values({
    quotationId: quote.id,
    toEmail: customer.email,
    subject,
    body,
    status: "sent",
    providerResponse: info as unknown as Record<string, unknown>,
    sentBy: auth.user.userId,
  });

  return NextResponse.json({ ok: true, preview: info.message });
}
