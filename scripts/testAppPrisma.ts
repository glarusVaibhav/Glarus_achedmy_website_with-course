import prisma from '../src/lib/db';

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      take: 5
    });
    console.log('✅ Main Application Prisma client connected successfully!');
    console.log('Sample Users in database:');
    users.forEach((u) => console.log(` - [${u.role}] ${u.name} (${u.email})`));
  } catch (err) {
    console.error('❌ Failed to query via app Prisma client:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
