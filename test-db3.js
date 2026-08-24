const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findUnique({ where: { email: 'diondeguzman0@gmail.com' } });
  console.log(user);
}
run().catch(console.error).finally(() => prisma.$disconnect());
