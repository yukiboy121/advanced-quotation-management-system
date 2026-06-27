import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  brands,
  categories,
  companies,
  currencies,
  customers,
  permissions,
  products,
  roles,
  rolePermissions,
  taxes,
  userRoles,
  users,
} from "@/db/schema";

const defaultRoles = ["super-admin", "admin", "manager", "sales-executive", "employee", "viewer"];
const defaultPermissions = [
  "dashboard.read",
  "customers.read",
  "customers.write",
  "products.read",
  "products.write",
  "quotations.read",
  "quotations.write",
  "reports.read",
  "settings.write",
  "users.write",
];

export async function POST(_req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed disabled in production" }, { status: 403 });
  }

  for (const roleName of defaultRoles) {
    await db.insert(roles).values({ name: roleName, isSystem: true }).onConflictDoNothing();
  }

  for (const permissionKey of defaultPermissions) {
    await db.insert(permissions).values({ key: permissionKey }).onConflictDoNothing();
  }

  const adminRole = await db.query.roles.findFirst({ where: eq(roles.name, "admin") });
  const allPermissions = await db.query.permissions.findMany();

  if (adminRole) {
    for (const p of allPermissions) {
      await db
        .insert(rolePermissions)
        .values({ roleId: adminRole.id, permissionId: p.id })
        .onConflictDoNothing();
    }
  }

  await db
    .insert(currencies)
    .values([
      { code: "USD", symbol: "$", name: "US Dollar", isDefault: true },
      { code: "EUR", symbol: "€", name: "Euro" },
      { code: "GBP", symbol: "£", name: "British Pound" },
    ])
    .onConflictDoNothing();

  await db
    .insert(companies)
    .values({
      name: "Acme Quotation Systems",
      email: "sales@acme-quote.com",
      phone: "+1 555 0199",
      website: "https://acme-quote.com",
      address: "450 Market Street",
      city: "San Francisco",
      country: "USA",
      quotePrefix: "AQ",
      invoicePrefix: "INV",
    })
    .onConflictDoNothing();

  await db.insert(taxes).values([{ name: "VAT", rate: "15.00" }, { name: "NBT", rate: "2.00" }]).onConflictDoNothing();
  await db.insert(categories).values([{ name: "Software" }, { name: "Hardware" }, { name: "Consulting" }]).onConflictDoNothing();
  await db.insert(brands).values([{ name: "Acme" }, { name: "Nimbus" }]).onConflictDoNothing();

  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, "admin@example.com") });
  if (!existingAdmin) {
    const hash = await bcrypt.hash("Admin@12345", 12);
    const [admin] = await db
      .insert(users)
      .values({ fullName: "System Admin", email: "admin@example.com", passwordHash: hash })
      .returning({ id: users.id });

    if (adminRole) {
      await db.insert(userRoles).values({ userId: admin.id, roleId: adminRole.id }).onConflictDoNothing();
    }
  }

  const usd = await db.query.currencies.findFirst({ where: eq(currencies.code, "USD") });

  if (usd) {
    const existingCustomer = await db.query.customers.findFirst({ where: eq(customers.customerCode, "CUST-0001") });
    if (!existingCustomer) {
      await db.insert(customers).values({
        customerCode: "CUST-0001",
        customerName: "Globex Corporation",
        companyName: "Globex Corporation",
        email: "procurement@globex.com",
        country: "USA",
        city: "New York",
        currencyId: usd.id,
      });
    }

    const existingProduct = await db.query.products.findFirst({ where: eq(products.sku, "SKU-001") });
    if (!existingProduct) {
      await db.insert(products).values({
        name: "Enterprise CRM License",
        sku: "SKU-001",
        stock: 100,
        unit: "license",
        sellingPrice: "1499.00",
      });
    }
  }

  return NextResponse.json({ ok: true, message: "Seed completed", login: "admin@example.com / Admin@12345" });
}
