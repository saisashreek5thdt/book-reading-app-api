import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const initialCategories = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery'];

  for (const name of initialCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Initial categories seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });