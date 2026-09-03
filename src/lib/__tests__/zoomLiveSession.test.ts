import prisma from '../db';
import crypto from 'crypto';
import { LiveSessionService } from '../services/liveSessionService';
import { requireSessionEnrollment } from '../services/studentAuthService';

async function runZoomIntegrationTests() {
  console.log('\n===============================================================');
  console.log('🎥 RUNNING ZOOM VIDEO SDK LIVE SESSION INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      failed++;
    }
  }

  // --- Fixtures ---
  const testInstructor = await prisma.user.upsert({
    where: { email: 'test.zoom.instructor@glarus.edu' },
    update: {},
    create: {
      email: 'test.zoom.instructor@glarus.edu',
      name: 'Dr. Zoom Instructor',
      role: 'INSTRUCTOR',
    }
  });

  const testStudentEnrolled = await prisma.user.upsert({
    where: { email: 'test.zoom.student.enrolled@glarus.edu' },
    update: {},
    create: {
      email: 'test.zoom.student.enrolled@glarus.edu',
      name: 'Enrolled Zoom Student',
      role: 'STUDENT',
    }
  });

  const testStudentUnenrolled = await prisma.user.upsert({
    where: { email: 'test.zoom.student.unenrolled@glarus.edu' },
    update: {},
    create: {
      email: 'test.zoom.student.unenrolled@glarus.edu',
      name: 'Unenrolled Visitor',
      role: 'STUDENT',
    }
  });

  const testLiveCourse = await prisma.liveCourse.upsert({
    where: { id: 'test-course-zoom-sdk' },
    update: {},
    create: {
      id: 'test-course-zoom-sdk',
      title: 'Agentic AI Masterclass with Zoom SDK',
      description: 'Zoom Video SDK Live Testing Course',
      leadInstructorId: testInstructor.id,
      status: 'PUBLISHED',
      duration: '4 Weeks',
      price: 19999,
    }
  });

  // Enroll student
  await prisma.liveCourseEnrollment.upsert({
    where: {
      userId_liveCourseId: {
        userId: testStudentEnrolled.id,
        liveCourseId: testLiveCourse.id
      }
    },
    update: { status: 'ACTIVE' },
    create: {
      userId: testStudentEnrolled.id,
      liveCourseId: testLiveCourse.id,
      batchName: 'Zoom SDK Test Cohort',
      status: 'ACTIVE'
    }
  });

  const deterministicMeetingId = '550e8400-e29b-41d4-a716-446655440000';
  const deterministicPasscode = 'TestPass123';
  const activeStartDate = new Date(Date.now() - 10 * 60 * 1000);
  const activeStartTimeStr = activeStartDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Create test ongoing live session
  const testSessionOngoing = await prisma.liveSession.upsert({
    where: { id: 'test-session-zoom-live-1' },
    update: {
      date: activeStartDate,
      startTime: activeStartTimeStr,
      meetingId: deterministicMeetingId,
      meetingPasscode: deterministicPasscode,
      status: 'LIVE'
    },
    create: {
      id: 'test-session-zoom-live-1',
      liveCourseId: testLiveCourse.id,
      sessionNumber: 1,
      title: 'Real-time Autonomous Swarms Workshop',
      date: activeStartDate,
      startTime: activeStartTimeStr,
      duration: '120 min',
      status: 'LIVE',
      meetingId: deterministicMeetingId,
      meetingPasscode: deterministicPasscode
    }
  });

  console.log('--- Section 1: Database Credentials & Session Storage ---');

  // Test 1.1: LiveSession row persists meetingId and meetingPasscode
  assert(
    testSessionOngoing.meetingId === deterministicMeetingId &&
    testSessionOngoing.meetingPasscode === deterministicPasscode,
    '1.1 LiveSession stores deterministic meetingId and passcode in database'
  );

  console.log('\n--- Section 2: Session Symmetry (Instructor vs Student) ---');

  // Test 2.1: Instructor requests signature for session
  const instructorSessionRow = await prisma.liveSession.findUnique({
    where: { id: testSessionOngoing.id }
  });

  assert(
    instructorSessionRow?.meetingId === deterministicMeetingId &&
    instructorSessionRow?.meetingPasscode === deterministicPasscode,
    '2.1 Instructor retrieves correct meeting credentials from database'
  );

  // Test 2.2: Student checks enrollment authorization
  const authEnrollment = await requireSessionEnrollment(testStudentEnrolled.id, testSessionOngoing.id);
  assert(
    authEnrollment.session.id === testSessionOngoing.id &&
    authEnrollment.enrollment.status === 'ACTIVE',
    '2.2 Enrolled student authorized to access live session room'
  );

  // Test 2.3: Symmetric Meeting ID verification
  assert(
    authEnrollment.session.meetingId === instructorSessionRow?.meetingId,
    `2.3 Symmetric Session Verification: Student and Instructor share exact meeting_id "${deterministicMeetingId}"`
  );

  assert(
    authEnrollment.session.meetingPasscode === instructorSessionRow?.meetingPasscode,
    `2.4 Symmetric Passcode Verification: Student and Instructor share exact passcode "${deterministicPasscode}"`
  );

  console.log('\n--- Section 3: Join Authorization & Attendance Kickoff ---');

  // Test 3.1: Enrolled student join access computation
  const studentJoinAccess = await LiveSessionService.getLiveSessionJoinAccess(
    testStudentEnrolled.id,
    testSessionOngoing.id
  );

  assert(
    studentJoinAccess.success &&
    studentJoinAccess.meetingId === deterministicMeetingId &&
    studentJoinAccess.passcode === deterministicPasscode,
    '3.1 LiveSessionService returns authorized meeting credentials to student'
  );

  // Test 3.2: Attendance upserted as PRESENT
  const attendanceRecord = await prisma.liveSessionAttendance.findUnique({
    where: {
      sessionId_userId: {
        sessionId: testSessionOngoing.id,
        userId: testStudentEnrolled.id
      }
    }
  });

  assert(
    attendanceRecord !== null && attendanceRecord.status === 'PRESENT',
    '3.2 Student attendance automatically logged as PRESENT upon joining room'
  );

  console.log('\n--- Section 4: Security Gates & Unenrolled Rejection ---');

  // Test 4.1: Unenrolled student blocked
  let unenrolledBlocked = false;
  try {
    await requireSessionEnrollment(testStudentUnenrolled.id, testSessionOngoing.id);
  } catch (err: any) {
    unenrolledBlocked = true;
  }

  assert(
    unenrolledBlocked,
    '4.1 Unenrolled student is strictly rejected from obtaining session signature (403 Forbidden)'
  );

  // Clean up
  await prisma.liveSessionAttendance.deleteMany({ where: { sessionId: testSessionOngoing.id } });
  await prisma.liveCourseEnrollment.deleteMany({ where: { liveCourseId: testLiveCourse.id } });
  await prisma.liveSession.deleteMany({ where: { liveCourseId: testLiveCourse.id } });
  await prisma.liveCourse.deleteMany({ where: { id: testLiveCourse.id } });
  await prisma.user.deleteMany({
    where: {
      id: { in: [testInstructor.id, testStudentEnrolled.id, testStudentUnenrolled.id] }
    }
  });

  console.log('\n===============================================================');
  console.log(`🏁 ZOOM VIDEO SDK TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runZoomIntegrationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
