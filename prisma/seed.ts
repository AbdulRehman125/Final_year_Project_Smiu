import { db } from "@/lib/db";

async function main() {
  console.log("🌱 Seeding database...");

  // Example: Create a test user
  const user = await db.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "admin-user-id",
      email: "admin@example.com",
      name: "Admin User",
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Created user: ${user.email}`);
  console.log("🌳 Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // No need to disconnect manually if using the adapter-pg pool correctly, 
    // but good practice if you had a direct client.
  });
