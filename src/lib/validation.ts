import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  fullName: z.string().min(2).max(160),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export const customerSchema = z.object({
  companyName: z.string().max(180).optional().or(z.literal("")),
  customerName: z.string().min(2).max(180),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(2).max(180),
  sku: z.string().min(2).max(80),
  unit: z.string().max(40).default("pcs"),
  stock: z.coerce.number().int().min(0),
  sellingPrice: z.coerce.number().min(0),
  description: z.string().max(3000).optional().or(z.literal("")),
});

export const quotationItemSchema = z.object({
  name: z.string().min(1).max(180),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
  discountValue: z.coerce.number().nonnegative().default(0),
  taxRate: z.coerce.number().nonnegative().default(0),
});

export const quotationSchema = z.object({
  customerId: z.string().uuid(),
  currencyCode: z.string().default("USD"),
  expiryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
  discountValue: z.coerce.number().nonnegative().default(0),
  vatAmount: z.coerce.number().default(0),
  nbtAmount: z.coerce.number().default(0),
  shippingAmount: z.coerce.number().default(0),
  additionalCharges: z.coerce.number().default(0),
  roundOff: z.coerce.number().default(0),
  items: z.array(quotationItemSchema).min(1),
});
