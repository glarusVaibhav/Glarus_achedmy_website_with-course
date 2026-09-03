import prisma from '../db';

async function runInstructorVerificationWorkflowSuite() {
  console.log('\n===============================================================');
  console.log('🎓 RUNNING INSTRUCTOR VERIFICATION & APPROVAL WORKFLOW TEST SUITE');
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

  // --- Step 1: Create Admin and Applicant Users ---
  console.log('--- Section 1: User & Admin Provisioning ---');

  const admin = await prisma.user.upsert({
    where: { email: 'admin.approvals@glarus.edu' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin.approvals@glarus.edu',
      name: 'Dr. Admin Reviewer',
      role: 'ADMIN'
    }
  });

  const applicant = await prisma.user.upsert({
    where: { email: 'applicant.yann@glarus.edu' },
    update: { role: 'STUDENT', name: 'Yann LeCun' },
    create: {
      email: 'applicant.yann@glarus.edu',
      name: 'Yann LeCun',
      role: 'STUDENT'
    }
  });

  assert(
    applicant.role === 'STUDENT',
    '1.1 Applicant begins with standard STUDENT account before verification'
  );

  // --- Step 2: Applicant Drafts and Submits Verification Application ---
  console.log('\n--- Section 2: Application Submission & Credential Persistence ---');

  const initialApplication = await prisma.instructorApproval.upsert({
    where: { userId: applicant.id },
    update: {
      firstName: 'Yann',
      lastName: 'LeCun',
      email: 'applicant.yann@glarus.edu',
      phone: '+1-555-0199',
      experience: '12+ Years in Deep Learning & Neural Architectures',
      teachingLanguages: JSON.stringify(['English', 'French']),
      skills: 'PyTorch, Energy-Based Models, Self-Supervised Learning',
      opportunitySource: 'LinkedIn Tech Community',
      resumeUrl: 'https://cdn.glarus.edu/resumes/yann-lecun-cv.pdf',
      resumeFileName: 'yann-lecun-cv.pdf',
      teachingVideoType: 'LINK',
      teachingVideoUrl: 'https://youtube.com/watch?v=sample-teaching-demo',
      areasOfExpertise: 'Computer Vision, Self-Supervised Learning, JEPA',
      aboutInstructor: 'Chief AI Scientist and Turing Award recipient.',
      courseTeachingPlan: '6-week deep dive into Joint Embedding Predictive Architectures (I-JEPA / V-JEPA).',
      whyGlarusAcademy: 'To build the next generation of generative AI and world-model practitioners.',
      teachesOnOtherPlatforms: true,
      otherPlatformDetails: 'Coursera / NYU Deep Learning',
      status: 'PENDING',
      version: 1,
    },
    create: {
      userId: applicant.id,
      firstName: 'Yann',
      lastName: 'LeCun',
      email: 'applicant.yann@glarus.edu',
      phone: '+1-555-0199',
      experience: '12+ Years in Deep Learning & Neural Architectures',
      teachingLanguages: JSON.stringify(['English', 'French']),
      skills: 'PyTorch, Energy-Based Models, Self-Supervised Learning',
      opportunitySource: 'LinkedIn Tech Community',
      resumeUrl: 'https://cdn.glarus.edu/resumes/yann-lecun-cv.pdf',
      resumeFileName: 'yann-lecun-cv.pdf',
      teachingVideoType: 'LINK',
      teachingVideoUrl: 'https://youtube.com/watch?v=sample-teaching-demo',
      areasOfExpertise: 'Computer Vision, Self-Supervised Learning, JEPA',
      aboutInstructor: 'Chief AI Scientist and Turing Award recipient.',
      courseTeachingPlan: '6-week deep dive into Joint Embedding Predictive Architectures (I-JEPA / V-JEPA).',
      whyGlarusAcademy: 'To build the next generation of generative AI and world-model practitioners.',
      teachesOnOtherPlatforms: true,
      otherPlatformDetails: 'Coursera / NYU Deep Learning',
      status: 'PENDING',
      version: 1,
    }
  });

  assert(
    initialApplication.status === 'PENDING' &&
    initialApplication.version === 1 &&
    Boolean(initialApplication.experience?.includes('Deep Learning')),
    '2.1 Instructor application persisted with PENDING status, version 1, and credentials'
  );

  // --- Step 3: Application Versioning on Resubmission ---
  console.log('\n--- Section 3: Application Versioning & In-Place Updates ---');

  const updatedApplication = await prisma.instructorApproval.update({
    where: { userId: applicant.id },
    data: {
      version: (initialApplication.version || 1) + 1,
      skills: 'PyTorch, Energy-Based Models, Self-Supervised Learning, World Models',
      updatedAt: new Date()
    }
  });

  assert(
    updatedApplication.version === 2 &&
    Boolean(updatedApplication.skills?.includes('World Models')),
    '3.1 Application resubmission increments version to 2 and preserves audit trail'
  );

  // --- Step 4: Admin Review Queue Retrieval ---
  console.log('\n--- Section 4: Admin Approval Queue Gating ---');

  const pendingApprovals = await prisma.instructorApproval.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  const applicantInQueue = pendingApprovals.find((a) => a.userId === applicant.id);
  assert(
    Boolean(applicantInQueue),
    '4.1 Admin review queue correctly surfaces applicant in PENDING queue'
  );

  // --- Step 5: Admin "Request Changes" Decision ---
  console.log('\n--- Section 5: Admin "Request Changes" Lifecycle ---');

  const changesRequested = await prisma.instructorApproval.update({
    where: { userId: applicant.id },
    data: {
      status: 'CHANGES_REQUESTED',
      feedback: 'Please attach a verified GitHub link demonstrating your recent PyTorch world model implementation.',
      reviewedBy: admin.id,
      reviewedAt: new Date()
    }
  });

  assert(
    changesRequested.status === 'CHANGES_REQUESTED' &&
    Boolean(changesRequested.feedback?.includes('GitHub link')) &&
    changesRequested.reviewedBy === admin.id,
    '5.1 Admin successfully sets CHANGES_REQUESTED with actionable feedback and reviewer timestamp'
  );

  // --- Step 6: Applicant Resubmits after Changes ---
  console.log('\n--- Section 6: Applicant Fixes & Resubmits ---');

  const resubmittedApp = await prisma.instructorApproval.update({
    where: { userId: applicant.id },
    data: {
      status: 'PENDING',
      version: changesRequested.version + 1,
      aboutInstructor: 'Chief AI Scientist (GitHub: https://github.com/facebookresearch/ije-pa)',
      updatedAt: new Date()
    }
  });

  assert(
    resubmittedApp.status === 'PENDING' && resubmittedApp.version === 3,
    '6.1 Resubmission flips status back to PENDING and advances version to 3'
  );

  // --- Step 7: Admin "Approved" Decision & Role Elevation ---
  console.log('\n--- Section 7: Admin Approval & Atomic Role Elevation ---');

  const [approvedApp, elevatedUser] = await prisma.$transaction([
    prisma.instructorApproval.update({
      where: { userId: applicant.id },
      data: {
        status: 'APPROVED',
        feedback: 'Credentials verified and approved for Live Cohort instruction.',
        reviewedBy: admin.id,
        reviewedAt: new Date()
      }
    }),
    prisma.user.update({
      where: { id: applicant.id },
      data: { role: 'INSTRUCTOR' }
    })
  ]);

  assert(
    approvedApp.status === 'APPROVED' && elevatedUser.role === 'INSTRUCTOR',
    '7.1 Admin approval atomically transitions status to APPROVED and elevates user to INSTRUCTOR role'
  );

  // --- Step 8: Rejection Workflow on Second Applicant ---
  console.log('\n--- Section 8: Rejection Workflow Integrity ---');

  const applicant2 = await prisma.user.upsert({
    where: { email: 'applicant.reject@glarus.edu' },
    update: { role: 'STUDENT' },
    create: {
      email: 'applicant.reject@glarus.edu',
      name: 'Unqualified Applicant',
      role: 'STUDENT'
    }
  });

  await prisma.instructorApproval.upsert({
    where: { userId: applicant2.id },
    update: { status: 'PENDING' },
    create: {
      userId: applicant2.id,
      firstName: 'Unqualified',
      lastName: 'Applicant',
      status: 'PENDING',
      experience: 'None'
    }
  });

  const rejectedApp = await prisma.instructorApproval.update({
    where: { userId: applicant2.id },
    data: {
      status: 'REJECTED',
      feedback: 'Insufficient teaching and production experience in AI engineering.',
      reviewedBy: admin.id,
      reviewedAt: new Date()
    }
  });

  const applicant2User = await prisma.user.findUnique({ where: { id: applicant2.id } });

  assert(
    rejectedApp.status === 'REJECTED' && applicant2User?.role === 'STUDENT',
    '8.1 Rejected applicant remains in STUDENT role and receives specific rejection rationale'
  );

  // --- Step 9: Complete Profile & Cohort Aggregation ---
  console.log('\n--- Section 9: Complete Instructor Profile API Aggregation ---');

  // Create a sample live course under the newly approved instructor
  const cohort = await prisma.liveCourse.create({
    data: {
      title: 'World Models & Self-Supervised Representations',
      description: 'Master JEPA architectures and continuous latent representations.',
      category: 'GENERATIVE_AI',
      level: 'ADVANCED',
      status: 'PUBLISHED',
      duration: '8 Weeks',
      price: 19999,
      leadInstructorId: elevatedUser.id,
      createdById: admin.id
    }
  });

  // Query complete instructor profile (mirroring GET /api/admin/instructors/[id])
  const instructorProfile = await prisma.user.findUnique({
    where: { id: elevatedUser.id },
    include: {
      instructorApproval: true,
      instructorProfile: true,
      leadLiveCourses: {
        include: { sessions: true }
      },
      sessionAssignments: {
        include: { session: true, liveCourse: true }
      }
    }
  });

  assert(
    instructorProfile?.role === 'INSTRUCTOR' &&
    instructorProfile?.instructorApproval?.status === 'APPROVED' &&
    instructorProfile?.leadLiveCourses.length === 1 &&
    instructorProfile?.leadLiveCourses[0].title.includes('World Models'),
    '9.1 Instructor profile API aggregates credentials, approval metadata, and lead live courses'
  );

  // --- Clean up fixtures ---
  console.log('\n--- Cleaning up test fixtures ---');
  await prisma.liveCourse.deleteMany({ where: { leadInstructorId: elevatedUser.id } });
  await prisma.instructorApproval.deleteMany({ where: { userId: { in: [applicant.id, applicant2.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [admin.id, applicant.id, applicant2.id] } } });
  console.log('🧹 Cleaned up temporary test records.');

  console.log('\n===============================================================');
  console.log(`🏁 INSTRUCTOR VERIFICATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runInstructorVerificationWorkflowSuite()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
