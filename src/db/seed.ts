import bcrypt from "bcryptjs";
import { db } from ".";
import { roles, userRoles, users } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // --- Create roles ---
  const adminRole = await db
    .insert(roles)
    .values({ name: "admin", description: "Administrator with all permissions" })
    .onConflictDoNothing()
    .returning();
  const viewerRole = await db
    .insert(roles)
    .values({ name: "viewer", description: "User with read-only permissions" })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Roles created");

  // --- Create a default admin user ---
  const adminUserEmail = "admin@example.com";
  const existingAdmin = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminUserEmail) });

  if (!existingAdmin && adminRole.length > 0) {
    const passwordHash = await bcrypt.hash("Admin@12345", 12);
    const [adminUser] = await db
      .insert(users)
      .values({
        fullName: "Admin User",
        email: adminUserEmail,
        passwordHash,
        isActive: true,
      })
      .returning();

    await db.insert(userRoles).values({
      userId: adminUser.id,
      roleId: adminRole[0].id,
    });
    console.log("✅ Default admin user created");
  }

  console.log("Database seeding complete.");
}

seed().catch((error) => {
  console.error("Database seeding failed:", error);
  // Throwing an error will cause the build to fail, which is the desired behavior.
  throw new Error("Database seeding failed");
});