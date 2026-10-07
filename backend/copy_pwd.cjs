const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const testUser = await prisma.user.findUnique({ where: { email: 'test_user_123@example.com' } });
  await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { password: testUser.password }
  });
  console.log('Updated to Password123!');
}
main().finally(() => prisma.$disconnect());
