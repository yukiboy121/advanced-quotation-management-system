export type QuoteLineInput = {
  quantity: number;
  unitPrice: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  taxRate: number;
};

export type QuoteCalcInput = {
  items: QuoteLineInput[];
  discountType: "fixed" | "percentage";
  discountValue: number;
  vatAmount?: number;
  nbtAmount?: number;
  shippingAmount?: number;
  additionalCharges?: number;
  roundOff?: number;
};

export function calculateLineTotal(item: QuoteLineInput) {
  const gross = item.quantity * item.unitPrice;
  const discount = item.discountType === "percentage" ? (gross * item.discountValue) / 100 : item.discountValue;
  const net = Math.max(0, gross - discount);
  const tax = (net * item.taxRate) / 100;
  return Number((net + tax).toFixed(2));
}

export function calculateQuoteTotals(input: QuoteCalcInput) {
  const itemsTotal = input.items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const quoteDiscount = input.discountType === "percentage" ? (itemsTotal * input.discountValue) / 100 : input.discountValue;
  const subTotal = Math.max(0, itemsTotal - quoteDiscount);
  const grandTotal =
    subTotal +
    (input.vatAmount ?? 0) +
    (input.nbtAmount ?? 0) +
    (input.shippingAmount ?? 0) +
    (input.additionalCharges ?? 0) +
    (input.roundOff ?? 0);

  return {
    subTotal: Number(subTotal.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}
