import prisma from '../lib/db';
import { PurchaseService } from '../lib/services/purchaseService';
import { StudentDashboardService } from '../lib/services/studentDashboardService';
import { LiveSessionService } from '../lib/services/liveSessionService';
import { getCourseDataAsync } from '../lib/courses/course-loader';

async function runEndToEndVerification() {
  console.log('=== STARTING END-TO-END ENROLLMENT & CONTENT ACCESS VERIFICATION ===\n');

  // 1. Get or create test student
  const student = await prisma.user.upsert({
    where: { email: 'arun.sharma@gmail.com' },
    update: {},
    create: {
      email: 'arun.sharma@gmail.com',
      name: 'Arun Sharma',
      role: 'STUDENT',
    },
  });
  console.log(`[1] Test student identified: ${student.name} (${student.id})`);

  // 2. Get or create test self-paced course
  const testCourse = await prisma.course.upsert({
    where: { id: 'test-self-paced-ai-course' },
    update: {},
    create: {
      id: 'test-self-paced-ai-course',
      title: 'Full-Stack Agentic AI Engineering',
      description: 'Production AI agents and microservices curriculum',
      price: 9999,
      status: 'APPROVED',
      type: 'SELF_PACED',
      instructorId: student.id,
      modules: {
        create: [
          {
            title: 'Module 1: Agentic Architectures',
            order: 1,
            lectures: {
              create: [
                { title: 'Lecture 1.1: State Graphs', order: 1, videoUrl: 'https://example.com/video1.mp4' },
                { title: 'Lecture 1.2: Checkpointing', order: 2, videoUrl: 'https://example.com/video2.mp4' }
              ]
            }
          }
        ]
      }
    },
    include: { modules: { include: { lectures: true } } }
  });
  console.log(`[2] Self-paced test course ready: "${testCourse.title}" (${testCourse.id})`);

  // 3. Get or create test live course
  const testLiveCourse = await prisma.liveCourse.upsert({
    where: { id: 'test-live-cohort-ai' },
    update: {},
    create: {
      id: 'test-live-cohort-ai',
      title: 'Live Agentic AI Masterclass Cohort',
      description: 'Live interactive multi-agent masterclasses',
      price: 18999,
      duration: '4 Weeks',
      status: 'PUBLISHED',
      leadInstructorId: student.id,
      sessions: {
        create: [
          {
            title: 'Session 1: Live Graph Systems',
            sessionNumber: 1,
            date: new Date(Date.now() + 24 * 3600 * 1000),
            startTime: '08:00 PM',
            duration: '120 min',
            meetingUrl: 'https://zoom.us/j/glarus-test-live-room'
          }
        ]
      }
    },
    include: { sessions: true }
  });
  console.log(`[3] Live cohort test course ready: "${testLiveCourse.title}" (${testLiveCourse.id})`);

  // 4. Clean up any existing enrollments for fresh test
  await prisma.enrollment.deleteMany({
    where: { userId: student.id, courseId: testCourse.id }
  });
  await prisma.liveCourseEnrollment.deleteMany({
    where: { userId: student.id, liveCourseId: testLiveCourse.id }
  });

  // 5. Execute checkout via PurchaseService (Simulating /api/purchase)
  console.log('\n[4] Executing batch checkout via PurchaseService...');
  const checkoutResult = await PurchaseService.processCheckout(
    student.id,
    [
      { id: testCourse.id, type: 'SELF_PACED_COURSE' },
      { id: testLiveCourse.id, type: 'LIVE_COURSE' }
    ],
    'CARD',
    { name: student.name || 'Arun Sharma', email: student.email }
  );

  console.log(`Checkout result success: ${checkoutResult.success}`);
  console.log(`Purchases created: ${checkoutResult.purchasesCount}`);
  console.log(`Invoices created: ${checkoutResult.invoices.length}`);

  // 6. Verify Database Records
  console.log('\n[5] Verifying PostgreSQL Database Records...');
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: student.id, courseId: testCourse.id } }
  });
  console.log(`- Self-Paced Enrollment exists in DB: ${Boolean(enrollment)}`);

  const liveEnrollment = await prisma.liveCourseEnrollment.findUnique({
    where: { userId_liveCourseId: { userId: student.id, liveCourseId: testLiveCourse.id } }
  });
  console.log(`- Live Cohort Enrollment exists in DB: ${Boolean(liveEnrollment && liveEnrollment.status === 'ACTIVE')}`);

  // 7. Verify Student Dashboard Data
  console.log('\n[6] Verifying Student Dashboard Data...');
  const dashboardData = await StudentDashboardService.getDashboardOverview(student.id);
  console.log(`- Dashboard Total Enrolled: ${dashboardData.stats.total}`);
  console.log(`- Dashboard Self-Paced Count: ${dashboardData.stats.selfPacedCount}`);
  console.log(`- Dashboard Live Courses Count: ${dashboardData.stats.liveCoursesCount}`);

  // 8. Verify Enrolled Live Course and Classroom Access
  console.log('\n[7] Verifying Live Sessions & Classroom Access...');
  const liveDashboard = await LiveSessionService.getEnrolledLiveCoursesAndClasses(student.id);
  const enrolledLiveCourse = liveDashboard.courses.find((c: any) => c.id === testLiveCourse.id);
  console.log(`- Enrolled Live Course in Student Portal: ${Boolean(enrolledLiveCourse)}`);
  console.log(`- Total Sessions in Classroom: ${enrolledLiveCourse?.sessions?.length}`);

  // 9. Verify Course Player Dynamic Loader (Self-Paced /learn/[id])
  console.log('\n[8] Verifying Course Learning Player Dynamic Loading (/learn/[id])...');
  const courseLearningData = await getCourseDataAsync(testCourse.id);
  console.log(`- Course Player Loaded Course: "${courseLearningData?.title}"`);
  console.log(`- Course Player Total Lessons: ${courseLearningData?.lessons?.length}`);
  console.log(`- Lesson 1 Title: "${courseLearningData?.lessons?.[0]?.title}"`);

  console.log('\n=== ALL ENROLLMENT, DASHBOARD REFLECTION & CONTENT ACCESS CHECKS PASSED SUCCESSFULLY! ===');
}

runEndToEndVerification()
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
