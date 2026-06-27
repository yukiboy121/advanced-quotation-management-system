import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from ".";
import {
  brands,
  categories,
  companies,
  currencies,
  customers,
  permissions,
  products,
  rolePermissions,
  roles,
  taxes,
  userRoles,
  users,
} from "./schema";

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

async function seed() {
  console.log("Seeding database...");

  for (const roleName of defaultRoles) {
    await db.insert(roles).values({ name: roleName, isSystem: true }).onConflictDoNothing();
  }
  console.log("✅ Roles seeded");

  for (const permissionKey of defaultPermissions) {
    await db.insert(permissions).values({ key: permissionKey }).onConflictDoNothing();
  }
  console.log("✅ Permissions seeded");

  const adminRole = await db.query.roles.findFirst({ where: eq(roles.name, "admin") });
  const allPermissions = await db.query.permissions.findMany();

  if (adminRole) {
    for (const p of allPermissions) {
      await db.insert(rolePermissions).values({ roleId: adminRole.id, permissionId: p.id }).onConflictDoNothing();
    }
    console.log("✅ Admin role permissions assigned");
  }

  await db
    .insert(currencies)
    .values([
      { code: "USD", symbol: "$", name: "US Dollar", isDefault: true },
      { code: "EUR", symbol: "€", name: "Euro" },
      { code: "GBP", symbol: "£", name: "British Pound" },
    ])
    .onConflictDoNothing();
  console.log("✅ Currencies seeded");

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
  console.log("✅ Company info seeded");

  await db.insert(taxes).values([{ name: "VAT", rate: "15.00" }, { name: "NBT", rate: "2.00" }]).onConflictDoNothing();
  await db.insert(categories).values([{ name: "Software" }, { name: "Hardware" }, { name: "Consulting" }]).onConflictDoNothing();
  await db.insert(brands).values([{ name: "Acme" }, { name: "Nimbus" }]).onConflictDoNothing();
  console.log("✅ Taxes, Categories, and Brands seeded");

  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, "admin@example.com") });
  if (!existingAdmin && adminRole) {
    const hash = await bcrypt.hash("Admin@12345", 12);
    const [admin] = await db
      .insert(users)
      .values({ fullName: "System Admin", email: "admin@example.com", passwordHash: hash })
      .returning();

    await db.insert(userRoles).values({ userId: admin.id, roleId: adminRole.id }).onConflictDoNothing();
    console.log("✅ Default admin user created");
  }

  console.log("Database seeding complete.");
}

seed().catch((error) => {
  console.error("Database seeding failed:", error);
  throw new Error("Database seeding failed");
});