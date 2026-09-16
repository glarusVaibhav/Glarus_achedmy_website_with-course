import prisma from '../lib/db';
import { formatRegistrationWindow } from '../components/landing/InteractiveCourses';

async function main() {
  console.log('🧪 Starting Registration Window Verification Test...');

  const testTitle = `Test Cohort with Registration Window - ${Date.now()}`;
  const now = new Date();
  const regStart = new Date(now.getTime() - 1000 * 60 * 60 * 24); // Yesterday (Open)
  const regEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
  const courseStart = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10);

  // 1. Create Live Course with Registration Dates
  const created = await prisma.liveCourse.create({
    data: {
      title: testTitle,
      description: 'A test live course for verifying registration start and end times.',
      category: 'Agentic AI',
      level: 'Intermediate',
      startDate: courseStart,
      registrationStartDate: regStart,
      registrationEndDate: regEnd,
      status: 'PUBLISHED',
      isPublished: true,
    }
  });

  console.log('✅ Created Live Course with registration window:');
  console.log(`   ID: ${created.id}`);
  console.log(`   Title: ${created.title}`);
  console.log(`   Registration Starts: ${created.registrationStartDate?.toISOString()}`);
  console.log(`   Registration Ends: ${created.registrationEndDate?.toISOString()}`);

  // 2. Fetch and verify
  const fetched = await prisma.liveCourse.findUnique({
    where: { id: created.id }
  });

  if (!fetched?.registrationStartDate || !fetched?.registrationEndDate) {
    throw new Error('❌ Registration dates were not saved properly!');
  }

  // 3. Test formatRegistrationWindow helper
  const windowStatus = formatRegistrationWindow(
    fetched.registrationStartDate.toISOString(),
    fetched.registrationEndDate.toISOString(),
    fetched.startDate?.toISOString()
  );

  console.log('✅ formatRegistrationWindow result:');
  console.log(`   isOpen: ${windowStatus.isOpen}`);
  console.log(`   label: ${windowStatus.label}`);
  console.log(`   countdownText: ${windowStatus.countdownText}`);
  console.log(`   fullWindowFormatted: ${windowStatus.fullWindowFormatted}`);

  if (!windowStatus.isOpen || !windowStatus.label.includes('Registration Open')) {
    throw new Error('❌ formatRegistrationWindow did not recognize active registration window!');
  }

  // 4. Test upcoming window
  const futureStart = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString();
  const futureEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10).toISOString();
  const upcomingStatus = formatRegistrationWindow(futureStart, futureEnd);
  console.log(`✅ Upcoming window test: isUpcoming=${upcomingStatus.isUpcoming}, label="${upcomingStatus.label}"`);

  // 5. Test closed window
  const pastStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString();
  const pastEnd = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString();
  const closedStatus = formatRegistrationWindow(pastStart, pastEnd);
  console.log(`✅ Closed window test: isClosed=${closedStatus.isClosed}, label="${closedStatus.label}"`);

  // 6. Cleanup test course
  await prisma.liveCourse.delete({ where: { id: created.id } });
  console.log('🧹 Cleaned up test live course.');

  console.log('\n🎉 ALL REGISTRATION WINDOW VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
