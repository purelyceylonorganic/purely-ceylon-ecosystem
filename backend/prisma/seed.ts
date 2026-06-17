import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 PCO தரவுத்தள seed ஆரம்பிக்கப்படுகிறது...");

  // 1. Password Hashing
  const adminPassword = await bcrypt.hash("SecureAdminPassword123!", 10);
  const farmerPassword = await bcrypt.hash("FarmerPassword123!", 10);

  // 2. Category உருவாக்குதல்
  const spiceCategory = await prisma.category.upsert({
    where: { slug: "organic-spices" },
    update: {},
    create: {
      name: "Organic Spices",
      slug: "organic-spices",
    },
  });

  // 3. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@purelyceylon.com" },
    update: {},
    create: {
      email: "admin@purelyceylon.com",
      fullName: "PCO Admin Management",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      phone: "+94771234567",
      isActive: true,
    },
  });

  // 4. Farmer / Vendor User
  const farmer = await prisma.user.upsert({
    where: { email: "matale.farmer@purelyceylon.com" },
    update: {},
    create: {
      email: "matale.farmer@purelyceylon.com",
      fullName: "மாத்தளை ஆர்கானிக் விவசாயக் கூட்டுறவு",
      passwordHash: farmerPassword,
      role: Role.VENDOR,
      phone: "+94662233444",
      isActive: true,
    },
  });

  // 5. Product + Variants
  const cinnamon = await prisma.product.upsert({
    where: { slug: "purely-ceylon-premium-alba-cinnamon" },
    update: {},
    create: {
      name: "Purely Ceylon Premium Alba Cinnamon",
      slug: "purely-ceylon-premium-alba-cinnamon",
      description: "இலங்கையின் உயர்தரமான அல்பா ரக கறவா பட்டை.",
      categoryId: spiceCategory.id,

      // Variants (correct relational structure)
      variants: {
        create: [
          {
            sku: "PCO-CIN-001",
            weight: "100g",
            price: 4500.0,
            costPrice: 1500.0,
            stock: 150,
          },
        ],
      },
    },
  });

  console.log("✅ Seed data வெற்றிகரமாக உருவாக்கப்பட்டது!");
  console.log({ admin: admin.email, farmer: farmer.email, cinnamon: cinnamon.name });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });