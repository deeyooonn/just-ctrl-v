import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function upgrade() {
  const user = await prisma.user.findUnique({ where: { email: 'diondeguzman0@gmail.com' } });
  if (user) {
    await prisma.user.update({
      where: { email: 'diondeguzman0@gmail.com' },
      data: { planTier: 'ADMIN' },
    });
    console.log('Successfully upgraded diondeguzman0@gmail.com to ADMIN.');
  } else {
    console.log('User not found. Please log in first to create the account in the new database.');
  }
}

upgrade().catch(console.error).finally(() => prisma.$disconnect());
