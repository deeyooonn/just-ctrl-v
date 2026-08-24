const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const folders = await prisma.folder.findMany();
  console.log('Folders count:', folders.length);
  if (folders.length > 0) {
    console.log(folders[0]);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
