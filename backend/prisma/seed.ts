import { PrismaClient, Role } from '@prisma/client';
declare const process: { exit(code?: number): never };
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 PCO தரவுத்தளத்தில் விபரங்களை நிரப்பத் தொடங்குகிறது...');

  // 0. முதலில் ஒரு Category-ஐ உருவாக்குவோம்
  const spiceCategory = await prisma.category.upsert({
    where: { slug: 'organic-spices' },
    update: {},
    create: {
      name: 'Organic Spices',
      slug: 'organic-spices',
    },
  });

  // 1. அட்மின் மற்றும் விவசாயி கணக்குகளை உருவாக்குதல்
  const admin = await prisma.user.upsert({
    where: { email: 'admin@purelyceylon.com' },
    update: {},
    create: {
      email: 'admin@purelyceylon.com',
      fullName: 'PCO Admin Management',
      passwordHash: 'SecureAdminPassword123!', 
      role: Role.ADMIN,
      phone: '+94771234567',
    },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'matale.farmer@purelyceylon.com' },
    update: {},
    create: {
      email: 'matale.farmer@purelyceylon.com',
      fullName: 'மாத்தளை ஆர்கானிக் விவசாயக் கூட்டுறவு',
      passwordHash: 'FarmerPassword123!',
      role: Role.VENDOR,
      phone: '+94662233444',
    },
  });

  // 2. தயாரிப்புகளை உருவாக்குதல் (இப்போது சரியான categoryId உடன்)
  const cinnamon = await prisma.product.upsert({
    where: { sku: 'PCO-CIN-001' },
    update: {},
    create: {
      sku: 'PCO-CIN-001',
      name: 'Purely Ceylon Premium Alba Cinnamon',
      slug: 'purely-ceylon-premium-alba-cinnamon',
      description: 'இலங்கையின் உயர்தரமான அல்பா ரக கறவா பட்டை.',
      basePrice: 4500.00,
      stock: 150,
      weight: '100g',
      categoryId: spiceCategory.id, // சரியான Category ID
    },
  });

  console.log('✅ அட்மின், விவசாயி மற்றும் தயாரிப்புகள் வெற்றிகரமாக உருவாக்கப்பட்டன.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });