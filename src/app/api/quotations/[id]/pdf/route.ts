import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, quotationItems, quotations } from "@/db/schema";
import { requirePermission } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission(req, "quotations.read");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const quote = await db.query.quotations.findFirst({ where: eq(quotations.id, id) });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const customer = await db.query.customers.findFirst({ where: eq(customers.id, quote.customerId) });
  const items = await db.query.quotationItems.findMany({ where: eq(quotationItems.quotationId, id), orderBy: [asc(quotationItems.sortOrder)] });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText(`Quotation ${quote.quoteNumber}`, { x: 40, y: 800, size: 20, font, color: rgb(0.1, 0.1, 0.12) });
  page.drawText(`Status: ${quote.status}`, { x: 40, y: 775, size: 11, font });
  page.drawText(`Customer: ${customer?.customerName ?? "N/A"}`, { x: 40, y: 758, size: 11, font });
  page.drawText(`Date: ${new Date(quote.issueDate).toLocaleDateString()}`, { x: 40, y: 741, size: 11, font });

  let y = 710;
  page.drawText("Items", { x: 40, y, size: 13, font });
  y -= 20;

  for (const item of items.slice(0, 20)) {
    page.drawText(`${item.name} x ${item.quantity} @ ${item.unitPrice} = ${item.lineTotal}`, {
      x: 50,
      y,
      size: 10,
      font,
    });
    y -= 14;
  }

  page.drawText(`Subtotal: ${quote.subTotal}`, { x: 40, y: 120, size: 12, font });
  page.drawText(`Grand Total: ${quote.grandTotal}`, { x: 40, y: 100, size: 14, font });
  page.drawText("Thank you for your business", { x: 40, y: 60, size: 10, font, color: rgb(0.3, 0.3, 0.4) });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=${quote.quoteNumber}.pdf`,
    },
  });
}
