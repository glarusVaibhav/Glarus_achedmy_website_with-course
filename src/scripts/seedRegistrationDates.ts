import prisma from '../lib/db';

async function main() {
  const now = new Date();
  const count = await prisma.liveCourse.updateMany({
    where: { registrationStartDate: null },
    data: {
      registrationStartDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      registrationEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  console.log(`Updated ${count.count} live courses with default registration window.`);
}

main().finally(() => prisma.$disconnect());
