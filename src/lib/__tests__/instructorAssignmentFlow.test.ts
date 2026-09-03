import prisma from '../db';

async function runInstructorAssignmentVerificationSuite() {
  console.log('\n===============================================================');
  console.log('🏛️ RUNNING ADMIN-TO-INSTRUCTOR ASSIGNMENT & ISOLATION TEST SUITE');
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

  // --- Step 1: Create Test Admin & Two Distinct Instructors ---
  console.log('--- Section 1: Instructor Identity & Scope Provisioning ---');

  const adminUser = await prisma.user.upsert({
    where: { email: 'test.admin.ops@glarus.edu' },
    update: { role: 'ADMIN' },
    create: {
      email: 'test.admin.ops@glarus.edu',
      name: 'Admin Ops Director',
      role: 'ADMIN',
    }
  });

  const instructorAlpha = await prisma.user.upsert({
    where: { email: 'instructor.alpha@glarus.edu' },
    update: { role: 'INSTRUCTOR', status: 'ACTIVE' },
    create: {
      email: 'instructor.alpha@glarus.edu',
      name: 'Prof. Alan Turing (Alpha)',
      role: 'INSTRUCTOR',
      status: 'ACTIVE'
    }
  });

  const instructorBeta = await prisma.user.upsert({
    where: { email: 'instructor.beta@glarus.edu' },
    update: { role: 'INSTRUCTOR', status: 'ACTIVE' },
    create: {
      email: 'instructor.beta@glarus.edu',
      name: 'Prof. Barbara Liskov (Beta)',
      role: 'INSTRUCTOR',
      status: 'ACTIVE'
    }
  });

  assert(
    instructorAlpha.role === 'INSTRUCTOR' && instructorBeta.role === 'INSTRUCTOR',
    '1.1 Two distinct instructor profiles provisioned in database'
  );

  // --- Step 2: Admin creates Course A and Course B ---
  console.log('\n--- Section 2: Course & Session Scheduling ---');

  const courseA = await prisma.liveCourse.upsert({
    where: { id: 'test-course-alpha-langchain' },
    update: { leadInstructorId: instructorAlpha.id },
    create: {
      id: 'test-course-alpha-langchain',
      title: 'LangGraph & Multi-Agent Architecture Cohort',
      description: 'LangGraph & Multi-Agent Architecture Cohort Description',
      category: 'GENERATIVE_AI',
      level: 'ADVANCED',
      status: 'PUBLISHED',
      duration: '6 Weeks',
      price: 14999,
      leadInstructorId: instructorAlpha.id,
      createdById: adminUser.id,
    }
  });

  const sessionA1 = await prisma.liveSession.upsert({
    where: { id: 'test-session-a1' },
    update: { liveCourseId: courseA.id },
    create: {
      id: 'test-session-a1',
      liveCourseId: courseA.id,
      sessionNumber: 1,
      title: 'Agent State Reducers & Cyclic Graphs',
      duration: '120 min',
      meetingId: 'alpha-room-uuid-001',
      meetingPasscode: 'AlphaPass1',
      status: 'SCHEDULED'
    }
  });

  const courseB = await prisma.liveCourse.upsert({
    where: { id: 'test-course-beta-mlops' },
    update: { leadInstructorId: instructorBeta.id },
    create: {
      id: 'test-course-beta-mlops',
      title: 'Production LLMOps & Distributed vLLM Deployment',
      description: 'Production LLMOps & Distributed vLLM Deployment Description',
      category: 'MLOPS',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      duration: '4 Weeks',
      price: 12999,
      leadInstructorId: instructorBeta.id,
      createdById: adminUser.id,
    }
  });

  const sessionB1 = await prisma.liveSession.upsert({
    where: { id: 'test-session-b1' },
    update: { liveCourseId: courseB.id },
    create: {
      id: 'test-session-b1',
      liveCourseId: courseB.id,
      sessionNumber: 1,
      title: 'vLLM PagedAttention & Continuous Batching',
      duration: '120 min',
      meetingId: 'beta-room-uuid-002',
      meetingPasscode: 'BetaPass2',
      status: 'SCHEDULED'
    }
  });

  assert(
    courseA.leadInstructorId === instructorAlpha.id && courseB.leadInstructorId === instructorBeta.id,
    '2.1 Courses scheduled with separate lead instructor assignments'
  );

  await prisma.sessionAssignment.deleteMany({
    where: { liveCourseId: { in: [courseA.id, courseB.id] } }
  });

  const assignmentA = await prisma.sessionAssignment.create({
    data: {
      instructorId: instructorAlpha.id,
      sessionId: sessionA1.id,
      liveCourseId: courseA.id,
      canEdit: true,
      canEditAgenda: true,
      canEditSchedule: false,
      canEditResources: true,
      canAddHomework: true,
      assignedBy: adminUser.id
    }
  });

  const assignmentB = await prisma.sessionAssignment.create({
    data: {
      instructorId: instructorBeta.id,
      sessionId: sessionB1.id,
      liveCourseId: courseB.id,
      canEdit: true,
      canEditAgenda: false,
      canEditSchedule: true,
      canEditResources: true,
      canAddHomework: true,
      assignedBy: adminUser.id
    }
  });

  assert(
    assignmentA.canEditAgenda === true && assignmentA.canEditSchedule === false,
    '3.1 Instructor Alpha granted granular edit rights with restricted schedule editing'
  );

  assert(
    assignmentB.canEditSchedule === true && assignmentB.canEditAgenda === false,
    '3.2 Instructor Beta granted schedule control with restricted agenda editing'
  );

  // --- Step 4: Strict Instructor Data Isolation (Query Verification) ---
  console.log('\n--- Section 4: Strict Portal Visibility & Data Isolation ---');

  // Query Alpha's portal data (same logic as /api/instructor/live-sessions)
  const alphaCourses = await prisma.liveCourse.findMany({
    where: {
      OR: [
        { leadInstructorId: instructorAlpha.id },
        { assignments: { some: { instructorId: instructorAlpha.id } } }
      ]
    },
    include: {
      sessions: {
        where: {
          OR: [
            { liveCourse: { leadInstructorId: instructorAlpha.id } },
            { assignments: { some: { instructorId: instructorAlpha.id } } }
          ]
        }
      }
    }
  });

  // Query Beta's portal data
  const betaCourses = await prisma.liveCourse.findMany({
    where: {
      OR: [
        { leadInstructorId: instructorBeta.id },
        { assignments: { some: { instructorId: instructorBeta.id } } }
      ]
    },
    include: {
      sessions: {
        where: {
          OR: [
            { liveCourse: { leadInstructorId: instructorBeta.id } },
            { assignments: { some: { instructorId: instructorBeta.id } } }
          ]
        }
      }
    }
  });

  // Test 4.1: Alpha sees Course A
  assert(
    alphaCourses.some((c) => c.id === courseA.id),
    '4.1 Instructor Alpha sees assigned Course A (LangGraph Cohort)'
  );

  // Test 4.2: Alpha DOES NOT see Course B
  assert(
    !alphaCourses.some((c) => c.id === courseB.id),
    '4.2 [SECURITY / ISOLATION] Instructor Alpha CANNOT see Course B (LLMOps Cohort)'
  );

  // Test 4.3: Beta sees Course B
  assert(
    betaCourses.some((c) => c.id === courseB.id),
    '4.3 Instructor Beta sees assigned Course B (LLMOps Cohort)'
  );

  // Test 4.4: Beta DOES NOT see Course A
  assert(
    !betaCourses.some((c) => c.id === courseA.id),
    '4.4 [SECURITY / ISOLATION] Instructor Beta CANNOT see Course A (LangGraph Cohort)'
  );

  // --- Step 5: Admin Course Reassignment Simulation ---
  console.log('\n--- Section 5: Dynamic Admin Reassignment Lifecycle ---');

  // Admin reassigns Course A to Instructor Beta
  await prisma.$transaction([
    prisma.liveCourse.update({
      where: { id: courseA.id },
      data: { leadInstructorId: instructorBeta.id }
    }),
    prisma.sessionAssignment.deleteMany({
      where: { liveCourseId: courseA.id }
    }),
    prisma.sessionAssignment.create({
      data: {
        instructorId: instructorBeta.id,
        sessionId: sessionA1.id,
        liveCourseId: courseA.id,
        canEdit: true,
        canEditAgenda: true,
        assignedBy: adminUser.id
      }
    })
  ]);

  // Re-query Alpha and Beta after admin reassignment
  const alphaCoursesAfterReassign = await prisma.liveCourse.findMany({
    where: {
      OR: [
        { leadInstructorId: instructorAlpha.id },
        { assignments: { some: { instructorId: instructorAlpha.id } } }
      ]
    }
  });

  const betaCoursesAfterReassign = await prisma.liveCourse.findMany({
    where: {
      OR: [
        { leadInstructorId: instructorBeta.id },
        { assignments: { some: { instructorId: instructorBeta.id } } }
      ]
    }
  });

  assert(
    !alphaCoursesAfterReassign.some((c) => c.id === courseA.id),
    '5.1 Reassigned Course A immediately disappears from former Instructor Alpha'
  );

  assert(
    betaCoursesAfterReassign.some((c) => c.id === courseA.id) &&
    betaCoursesAfterReassign.some((c) => c.id === courseB.id),
    '5.2 Reassigned Course A immediately becomes active in new Instructor Beta portal'
  );

  // --- Clean up fixtures ---
  console.log('\n--- Cleaning up test fixtures ---');
  await prisma.sessionAssignment.deleteMany({
    where: { liveCourseId: { in: [courseA.id, courseB.id] } }
  });
  await prisma.liveSession.deleteMany({
    where: { liveCourseId: { in: [courseA.id, courseB.id] } }
  });
  await prisma.liveCourse.deleteMany({
    where: { id: { in: [courseA.id, courseB.id] } }
  });
  await prisma.user.deleteMany({
    where: { id: { in: [adminUser.id, instructorAlpha.id, instructorBeta.id] } }
  });
  console.log('🧹 Cleaned up temporary test records.');

  console.log('\n===============================================================');
  console.log(`🏁 INSTRUCTOR ASSIGNMENT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runInstructorAssignmentVerificationSuite()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
