import prisma from '../src/lib/db';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "phone" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT,
      ADD COLUMN IF NOT EXISTS "location" TEXT,
      ADD COLUMN IF NOT EXISTS "avatar" TEXT;
    `);
    console.log('✅ Safely added phone, bio, location, and avatar to User table!');
  } catch (e) {
    console.error('Error modifying User table:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
