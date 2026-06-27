import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "warning",
  "success",
  "error",
]);

export const discountTypeEnum = pgEnum("discount_type", ["fixed", "percentage"]);

export const taxModeEnum = pgEnum("tax_mode", ["inclusive", "exclusive"]);

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    ...auditColumns,
  },
  (t) => [index("roles_name_idx").on(t.name)]
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 120 }).notNull().unique(),
    description: text("description"),
    ...auditColumns,
  },
  (t) => [index("permissions_key_idx").on(t.key)]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    permissionId: uuid("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 180 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    phone: varchar("phone", { length: 40 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...auditColumns,
  },
  (t) => [uniqueIndex("users_email_unique_idx").on(t.email)]
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 180 }),
  phone: varchar("phone", { length: 40 }),
  website: varchar("website", { length: 220 }),
  address: text("address"),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 120 }),
  taxNumber: varchar("tax_number", { length: 80 }),
  bankDetails: text("bank_details"),
  logoUrl: text("logo_url"),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("INV").notNull(),
  quotePrefix: varchar("quote_prefix", { length: 20 }).default("QT").notNull(),
  timezone: varchar("timezone", { length: 80 }).default("UTC").notNull(),
  ...auditColumns,
});

export const currencies = pgTable(
  "currencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 10 }).notNull().unique(),
    symbol: varchar("symbol", { length: 10 }).notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).default("1").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...auditColumns,
  },
  (t) => [index("currencies_code_idx").on(t.code)]
);

export const taxes = pgTable("taxes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  rate: numeric("rate", { precision: 8, scale: 2 }).notNull(),
  mode: taxModeEnum("mode").default("exclusive").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...auditColumns,
});

export const discounts = pgTable("discounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  type: discountTypeEnum("type").default("fixed").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...auditColumns,
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerCode: varchar("customer_code", { length: 30 }).notNull().unique(),
    companyName: varchar("company_name", { length: 180 }),
    customerName: varchar("customer_name", { length: 180 }).notNull(),
    email: varchar("email", { length: 180 }),
    phone: varchar("phone", { length: 40 }),
    whatsapp: varchar("whatsapp", { length: 40 }),
    address: text("address"),
    city: varchar("city", { length: 120 }),
    country: varchar("country", { length: 120 }),
    taxNumber: varchar("tax_number", { length: 80 }),
    currencyId: uuid("currency_id").references(() => currencies.id, { onDelete: "set null" }),
    notes: text("notes"),
    attachments: jsonb("attachments").$type<Array<{ name: string; url: string }>>().default([]).notNull(),
    ...auditColumns,
  },
  (t) => [
    index("customers_name_idx").on(t.customerName),
    index("customers_email_idx").on(t.email),
    index("customers_code_idx").on(t.customerCode),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    description: text("description"),
    ...auditColumns,
  },
  (t) => [index("categories_name_idx").on(t.name)]
);

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    description: text("description"),
    ...auditColumns,
  },
  (t) => [index("brands_name_idx").on(t.name)]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull().unique(),
    barcode: varchar("barcode", { length: 120 }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    description: text("description"),
    imageUrl: text("image_url"),
    unit: varchar("unit", { length: 40 }).default("pcs").notNull(),
    stock: integer("stock").default(0).notNull(),
    purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).default("0").notNull(),
    sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
    taxId: uuid("tax_id").references(() => taxes.id, { onDelete: "set null" }),
    discountId: uuid("discount_id").references(() => discounts.id, { onDelete: "set null" }),
    isActive: boolean("is_active").default(true).notNull(),
    ...auditColumns,
  },
  (t) => [index("products_name_idx").on(t.name), index("products_sku_idx").on(t.sku)]
);

export const quotationTemplates = pgTable("quotation_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  htmlTemplate: text("html_template").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  ...auditColumns,
});

export const quotations = pgTable(
  "quotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteNumber: varchar("quote_number", { length: 40 }).notNull().unique(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "restrict" })
      .notNull(),
    salesPersonId: uuid("sales_person_id").references(() => users.id, { onDelete: "set null" }),
    templateId: uuid("template_id").references(() => quotationTemplates.id, { onDelete: "set null" }),
    currencyId: uuid("currency_id").references(() => currencies.id, { onDelete: "set null" }),
    status: quoteStatusEnum("status").default("draft").notNull(),
    issueDate: timestamp("issue_date", { withTimezone: true }).defaultNow().notNull(),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    paymentTerms: text("payment_terms"),
    deliveryTerms: text("delivery_terms"),
    notes: text("notes"),
    termsAndConditions: text("terms_and_conditions"),
    discountType: discountTypeEnum("discount_type").default("fixed").notNull(),
    discountValue: numeric("discount_value", { precision: 12, scale: 2 }).default("0").notNull(),
    vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    nbtAmount: numeric("nbt_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    additionalCharges: numeric("additional_charges", { precision: 12, scale: 2 }).default("0").notNull(),
    roundOff: numeric("round_off", { precision: 12, scale: 2 }).default("0").notNull(),
    subTotal: numeric("sub_total", { precision: 12, scale: 2 }).default("0").notNull(),
    grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).default("0").notNull(),
    publicToken: varchar("public_token", { length: 80 }).notNull().unique(),
    signatureDataUrl: text("signature_data_url"),
    isRecurring: boolean("is_recurring").default(false).notNull(),
    recurrenceRule: varchar("recurrence_rule", { length: 80 }),
    customFields: jsonb("custom_fields").$type<Record<string, string>>().default({}).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...auditColumns,
  },
  (t) => [
    index("quotations_customer_idx").on(t.customerId),
    index("quotations_status_idx").on(t.status),
    index("quotations_issue_date_idx").on(t.issueDate),
    index("quotations_quote_no_idx").on(t.quoteNumber),
  ]
);

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id")
    .references(() => quotations.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").default(0).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1").notNull(),
  unit: varchar("unit", { length: 40 }).default("pcs").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  discountType: discountTypeEnum("discount_type").default("fixed").notNull(),
  discountValue: numeric("discount_value", { precision: 12, scale: 2 }).default("0").notNull(),
  taxRate: numeric("tax_rate", { precision: 8, scale: 2 }).default("0").notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).default("0").notNull(),
  itemNotes: text("item_notes"),
  ...auditColumns,
});

export const quotationStatusHistory = pgTable("quotation_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id")
    .references(() => quotations.id, { onDelete: "cascade" })
    .notNull(),
  previousStatus: quoteStatusEnum("previous_status"),
  newStatus: quoteStatusEnum("new_status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id, { onDelete: "set null" }),
  reason: text("reason"),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quotationVersions = pgTable("quotation_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id")
    .references(() => quotations.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("version_number").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reportsCache = pgTable("reports_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportType: varchar("report_type", { length: 80 }).notNull(),
  periodKey: varchar("period_key", { length: 80 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("activity_logs_entity_idx").on(t.entityType, t.entityId)]
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailHistory = pgTable("email_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotations.id, { onDelete: "set null" }),
  toEmail: varchar("to_email", { length: 180 }).notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  body: text("body").notNull(),
  status: varchar("status", { length: 40 }).default("queued").notNull(),
  providerResponse: jsonb("provider_response").$type<Record<string, unknown>>().default({}).notNull(),
  sentBy: uuid("sent_by").references(() => users.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export const backups = pgTable("backups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
