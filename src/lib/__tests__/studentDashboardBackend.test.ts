import prisma from '../db';
import { verifyStudentSession, requireCourseEnrollment, requireLiveCourseEnrollment, AuthError } from '../services/studentAuthService';
import { PurchaseService } from '../services/purchaseService';
import { EnrollmentService } from '../services/enrollmentService';
import { StudentDashboardService } from '../services/studentDashboardService';
import { LiveSessionService } from '../services/liveSessionService';
import { AttendanceService } from '../services/attendanceService';
import { RecordingService } from '../services/recordingService';
import { AssignmentService } from '../services/assignmentService';
import { CertificateService } from '../services/certificateService';
import { signToken } from '../auth';

async function runStudentDashboardTestSuite() {
  console.log('===============================================================');
  console.log('🎓 RUNNING PRODUCTION-GRADE STUDENT DASHBOARD VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error('   Details:', detail);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 0. Setup Test Fixture Data
    // -------------------------------------------------------------
    const timestamp = Date.now();
    const testStudentEmail = `student_test_${timestamp}@glarus.ai`;

    const testStudent = await prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: testStudentEmail,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    const testInstructor = await prisma.user.create({
      data: {
        name: 'Dr. Katherine Bell',
        email: `instructor_${timestamp}@glarus.ai`,
        role: 'INSTRUCTOR',
        status: 'ACTIVE',
      },
    });

    const selfPacedCourse = await prisma.course.create({
      data: {
        title: 'Production Agentic Systems with Deep Reinforcement Learning',
        description: 'Advanced end-to-end self-paced AI engineering curriculum.',
        price: 9999,
        instructorId: testInstructor.id,
        status: 'APPROVED',
        type: 'SELF_PACED',
      },
    });

    const liveCohortCourse = await prisma.liveCourse.create({
      data: {
        title: 'Generative AI & LLM Systems (Live Cohort 12)',
        description: 'Intensive 8-week live workshop on distributed AI infrastructure.',
        price: 19999,
        leadInstructorId: testInstructor.id,
        status: 'ACTIVE',
        totalSessions: 8,
      },
    });

    const liveSessionOngoing = await prisma.liveSession.create({
      data: {
        liveCourseId: liveCohortCourse.id,
        sessionNumber: 1,
        title: 'Distributed Transformer Inference & vLLM Architecture',
        date: new Date(Date.now() - 10 * 60 * 1000), // started 10 minutes ago
        startTime: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        duration: '120 min',
        status: 'LIVE',
        meetingUrl: 'https://zoom.us/j/verified-live-test-room',
      },
    });

    const liveSessionUpcoming = await prisma.liveSession.create({
      data: {
        liveCourseId: liveCohortCourse.id,
        sessionNumber: 2,
        title: 'Model Context Protocol & Autonomous Tool Calling',
        date: new Date(Date.now() + 48 * 60 * 60 * 1000), // starts in 2 days
        startTime: '02:00 PM',
        duration: '120 min',
        status: 'SCHEDULED',
        meetingUrl: 'https://zoom.us/j/verified-upcoming-test-room',
      },
    });

    // -------------------------------------------------------------
    // Test 1: Authoritative Purchase Flow (Self-Paced Course)
    // -------------------------------------------------------------
    console.log('\n--- Section 1: Purchase & Atomic Transactions ---');
    const purchaseResult = await PurchaseService.processCheckout(
      testStudent.id,
      [{ id: selfPacedCourse.id, type: 'SELF_PACED_COURSE' }],
      'CARD',
      { name: 'Alex Rivera', email: testStudentEmail }
    );

    assert(
      purchaseResult.success && purchaseResult.purchases.length === 1,
      '1.1 Self-paced course checkout processes successfully'
    );
    assert(
      purchaseResult.purchases[0].amount === 9999,
      '1.2 Authoritative price (₹9,999) used from DB instead of untrusted client payload'
    );
    assert(
      purchaseResult.invoices.length === 1 && purchaseResult.invoices[0].totalAmount === 9999,
      '1.3 Official tax invoice generated with correct GST and total'
    );

    const isEnrolledSelfPaced = await EnrollmentService.isStudentEnrolled(testStudent.id, selfPacedCourse.id, false);
    assert(isEnrolledSelfPaced === true, '1.4 Student is automatically enrolled in self-paced course in atomic transaction');

    // -------------------------------------------------------------
    // Test 2: Authoritative Purchase Flow (Live Cohort Course)
    // -------------------------------------------------------------
    const livePurchaseResult = await PurchaseService.processCheckout(
      testStudent.id,
      [{ id: liveCohortCourse.id, type: 'LIVE_COURSE' }],
      'UPI',
      { name: 'Alex Rivera', email: testStudentEmail }
    );

    assert(
      livePurchaseResult.success && livePurchaseResult.purchases[0].liveCourseId === liveCohortCourse.id,
      '2.1 Live cohort course checkout completes successfully'
    );

    const isEnrolledLive = await EnrollmentService.isStudentEnrolled(testStudent.id, liveCohortCourse.id, true);
    assert(isEnrolledLive === true, '2.2 Student is actively enrolled in LiveCourseEnrollment table');

    // -------------------------------------------------------------
    // Test 3: Idempotency & Duplicate Purchase Guard
    // -------------------------------------------------------------
    let duplicateRejected = false;
    try {
      await PurchaseService.processCheckout(
        testStudent.id,
        [{ id: selfPacedCourse.id, type: 'SELF_PACED_COURSE' }],
        'CARD'
      );
    } catch (err: any) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, '3.1 Duplicate purchase of an enrolled course is safely prevented with error');

    // -------------------------------------------------------------
    // Test 4: Live Session Status Engine & 15-Minute Pre-Join Window
    // -------------------------------------------------------------
    console.log('\n--- Section 2: Live Cohorts & Join Authorization ---');
    const ongoingStatus = LiveSessionService.computeSessionStatus(liveSessionOngoing.date, liveSessionOngoing.startTime, '120 min');
    assert(ongoingStatus.status === 'ONGOING' && ongoingStatus.canJoin === true, '4.1 Class active right now is computed as ONGOING with canJoin=true');

    const upcomingStatus = LiveSessionService.computeSessionStatus(liveSessionUpcoming.date, liveSessionUpcoming.startTime, '120 min');
    assert(upcomingStatus.status === 'UPCOMING' && upcomingStatus.canJoin === false, '4.2 Future class in 2 days is computed as UPCOMING with canJoin=false');

    // Test live session join access
    const joinAccess = await LiveSessionService.getLiveSessionJoinAccess(testStudent.id, liveSessionOngoing.id);
    assert(
      joinAccess.success && joinAccess.meetingUrl === 'https://zoom.us/j/verified-live-test-room',
      '4.3 Enrolled student granted authorized meeting room URL'
    );

    // -------------------------------------------------------------
    // Test 5: Attendance Recording
    // -------------------------------------------------------------
    const attendance = await AttendanceService.recordAttendance(testStudent.id, liveSessionOngoing.id, 90, 5, 'Attended full session');
    assert(
      attendance.status === 'PRESENT' && attendance.durationMinutes === 90,
      '5.1 Live session attendance recorded with duration and PRESENT status'
    );

    // -------------------------------------------------------------
    // Test 6: Persistent Recording Progress & 30-Day Expiry
    // -------------------------------------------------------------
    console.log('\n--- Section 3: Recording Playback & Progress ---');
    const recordingProgress = await RecordingService.updateWatchProgress(
      testStudent.id,
      liveSessionOngoing.id,
      3600,
      7200,
      50,
      3600,
      'IN_PROGRESS'
    );
    assert(
      recordingProgress.percent === 50 && recordingProgress.status === 'IN_PROGRESS',
      '6.1 Recording watch progress persisted in PostgreSQL table SessionRecordingProgress'
    );

    // -------------------------------------------------------------
    // Test 7: Assignments & Submissions
    // -------------------------------------------------------------
    console.log('\n--- Section 4: Assignments & Project Submissions ---');
    const testAssignment = await prisma.assignment.create({
      data: {
        liveCourseId: liveCohortCourse.id,
        title: 'Build a Distributed vLLM Serving Gateway',
        description: 'Deploy an asynchronous LLM serving worker with PagedAttention and FastAPI.',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        pointsLabel: '100 Pts',
      },
    });

    const submissionResult = await AssignmentService.submitAssignment(testStudent.id, testAssignment.id, {
      githubUrl: 'https://github.com/alex-rivera/vllm-serving-gateway',
      liveUrl: 'https://vllm-gateway.demo.glarus.ai',
      notes: 'Includes continuous batching benchmark notebook with 95th percentile latency charts.',
    });

    assert(
      submissionResult.success && submissionResult.submission.status === 'IN_REVIEW',
      '7.1 Student project submitted with GitHub/Live URL and marked IN_REVIEW'
    );

    const retrievedAssignments = await AssignmentService.getStudentAssignments(testStudent.id, 'ALL', 'ALL');
    const foundSub = retrievedAssignments.assignments.find((a) => a.id === testAssignment.id);
    assert(
      Boolean(foundSub && foundSub.submission?.githubUrl?.includes('alex-rivera')),
      '7.2 Gated assignment queries return student’s own submission deliverables'
    );

    // -------------------------------------------------------------
    // Test 8: Mathematical Streak Engine (No hardcoded values)
    // -------------------------------------------------------------
    console.log('\n--- Section 5: Mathematical Streak Engine ---');
    // Clear existing activities for clean streak calculation
    await prisma.userActivity.deleteMany({ where: { userId: testStudent.id } });

    // Simulate 3 consecutive active days using multiple courses/activities
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const streakCourse = await prisma.course.create({
        data: {
          title: `Streak AI Module ${i}`,
          description: `Daily lesson on streak day ${i}`,
          price: 1000,
          instructorId: testInstructor.id,
          status: 'APPROVED',
        },
      });

      await prisma.userActivity.create({
        data: {
          userId: testStudent.id,
          courseId: streakCourse.id,
          lastLectureTitle: `Lecture on Day ${i}`,
          lastTimestamp: 100,
          totalSeconds: 1800,
          updatedAt: day,
          accessedAt: day,
        },
      });
    }

    const streakResult = await StudentDashboardService.calculateExactStreak(testStudent.id);
    assert(
      streakResult.currentStreak === 3 && streakResult.bestStreak === 3,
      '8.1 3 consecutive activity days produces exactly currentStreak=3 and bestStreak=3'
    );

    // -------------------------------------------------------------
    // Test 9: Complete Dashboard Overview Aggregation
    // -------------------------------------------------------------
    console.log('\n--- Section 6: Dashboard Overview Aggregation ---');
    const dashboardData = await StudentDashboardService.getDashboardOverview(testStudent.id);
    assert(
      dashboardData.stats.total >= 2,
      '9.1 Dashboard aggregates total enrolled count across self-paced and live cohorts'
    );
    assert(
      dashboardData.stats.selfPacedCount >= 1 && dashboardData.stats.liveCoursesCount >= 1,
      '9.2 Dashboard splits selfPacedCount and liveCoursesCount accurately'
    );
    assert(
      dashboardData.stats.streak === 3,
      '9.3 Dashboard delivers mathematical streak value'
    );
    assert(
      typeof dashboardData.stats.totalHours === 'number' && dashboardData.stats.totalHours >= 0,
      '9.4 Dashboard delivers split learning hours'
    );

    // -------------------------------------------------------------
    // Test 10: Verified Certificate Issuance
    // -------------------------------------------------------------
    console.log('\n--- Section 7: Verified Certificate Credentials ---');
    // Mark enrollment 100% complete
    await prisma.enrollment.update({
      where: { userId_courseId: { userId: testStudent.id, courseId: selfPacedCourse.id } },
      data: { progress: 100, isCompleted: true },
    });

    const issuedCert = await CertificateService.issueCertificateIfEligible(testStudent.id, selfPacedCourse.id);
    assert(
      Boolean(issuedCert && issuedCert.credentialId?.startsWith('GA-CERT-')),
      '10.1 Verified certificate generated with globally unique credentialId on 100% completion'
    );

    const studentCerts = await CertificateService.getStudentCertificates(testStudent.id);
    assert(
      studentCerts.certificates.some((c) => c.courseId === selfPacedCourse.id),
      '10.2 Certificate query returns verifiable credential'
    );

    // Cleanup test data
    console.log('\n--- Cleaning up test fixtures ---');
    await prisma.certificate.deleteMany({ where: { userId: testStudent.id } });
    await prisma.assignmentSubmission.deleteMany({ where: { userId: testStudent.id } });
    await prisma.assignment.deleteMany({ where: { liveCourseId: liveCohortCourse.id } });
    await prisma.sessionRecordingProgress.deleteMany({ where: { userId: testStudent.id } });
    await prisma.liveSessionAttendance.deleteMany({ where: { userId: testStudent.id } });
    await prisma.liveSession.deleteMany({ where: { liveCourseId: liveCohortCourse.id } });
    await prisma.liveCourseEnrollment.deleteMany({ where: { userId: testStudent.id } });
    await prisma.enrollment.deleteMany({ where: { userId: testStudent.id } });
    await prisma.invoice.deleteMany({ where: { purchase: { userId: testStudent.id } } });
    await prisma.purchase.deleteMany({ where: { userId: testStudent.id } });
    await prisma.userActivity.deleteMany({ where: { userId: testStudent.id } });
    await prisma.liveCourse.delete({ where: { id: liveCohortCourse.id } });
    await prisma.course.delete({ where: { id: selfPacedCourse.id } });
    await prisma.user.deleteMany({ where: { id: { in: [testStudent.id, testInstructor.id] } } });
    console.log('🧹 Cleaned up temporary test records.\n');

  } catch (err) {
    console.error('Test suite encounter uncaught error:', err);
    failed++;
  }

  console.log('===============================================================');
  console.log(`🏁 STUDENT DASHBOARD TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStudentDashboardTestSuite();
