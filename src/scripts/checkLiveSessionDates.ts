import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.liveSession.findMany({
    include: { liveCourse: true },
    orderBy: { date: 'asc' }
  });

  console.log(`Total live sessions in DB: ${sessions.length}`);
  sessions.slice(0, 10).forEach(s => {
    console.log({
      id: s.id,
      title: s.title,
      courseTitle: s.liveCourse?.title,
      date: s.date?.toISOString(),
      startTime: s.startTime,
      status: s.status
    });
  });
}

main().finally(() => prisma.$disconnect());
