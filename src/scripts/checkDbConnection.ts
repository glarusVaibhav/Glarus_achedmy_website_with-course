import { PrismaClient } from '@prisma/client';

async function testConnection(label: string, url: string) {
  console.log(`\n========================================`);
  console.log(`Testing: ${label}`);
  console.log(`URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`========================================`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    },
    log: ['error']
  });

  try {
    const start = Date.now();
    const result: any = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db, current_user as user, version() as version`;
    const elapsed = Date.now() - start;
    console.log(`✅ [CONNECTED] Response time: ${elapsed}ms`);
    console.log(`  Database Name : ${result[0]?.db}`);
    console.log(`  Connected User: ${result[0]?.user}`);
    console.log(`  Postgres Info : ${result[0]?.version?.split(' on ')[0]}`);

    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const liveCourseCount = await prisma.liveCourse.count();
    const sessionCount = await prisma.liveSession.count();

    console.log(`\n📊 Table Record Counts:`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Courses: ${courseCount}`);
    console.log(`  - Live Courses: ${liveCourseCount}`);
    console.log(`  - Live Sessions: ${sessionCount}`);
    return true;
  } catch (err: any) {
    console.log(`❌ [FAILED]: ${err.message || err}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const currentUrl = process.env.DATABASE_URL || 'postgresql://postgres:Gt%40Ak%40sh%231052@192.168.1.22:5432/elearning_db?schema=public';
  const localhostUrl = 'postgresql://postgres:Gt%40Ak%40sh%231052@localhost:5432/elearning_db?schema=public';
  const loopbackUrl = 'postgresql://postgres:Gt%40Ak%40sh%231052@127.0.0.1:5432/elearning_db?schema=public';

  console.log('🔍 Starting Database Connection Checks...');

  await testConnection('Current DATABASE_URL from .env', currentUrl);

  if (currentUrl.includes('192.168.1.22')) {
    await testConnection('Localhost (localhost:5432)', localhostUrl);
    await testConnection('Loopback (127.0.0.1:5432)', loopbackUrl);
  }
}

main();
