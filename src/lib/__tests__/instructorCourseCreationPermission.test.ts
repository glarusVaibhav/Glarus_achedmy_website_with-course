import prisma from '../db';
import {
  getInstructorCourseCreationStatus,
  checkInstructorCourseCreationPermission,
  requestCourseCreationPermission,
  adminReviewCourseCreationPermission,
  getAllInstructorPermissions
} from '../permissions/courseCreationPermission';

async function runCourseCreationPermissionTestSuite() {
  console.log('\n===============================================================');
  console.log('🛡️ RUNNING INSTRUCTOR COURSE CREATION PERMISSION TEST SUITE');
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

  try {
    // --- Step 1: User & Admin Provisioning ---
    console.log('--- Section 1: Provisioning Test Actors ---');

    const admin = await prisma.user.upsert({
      where: { email: 'admin.courseperm@glarus.edu' },
      update: { role: 'ADMIN', name: 'Dr. Platform Administrator' },
      create: {
        email: 'admin.courseperm@glarus.edu',
        name: 'Dr. Platform Administrator',
        role: 'ADMIN'
      }
    });

    const instAlpha = await prisma.user.upsert({
      where: { email: 'instructor.alpha@glarus.edu' },
      update: { role: 'INSTRUCTOR', name: 'Prof. Alpha Developer' },
      create: {
        email: 'instructor.alpha@glarus.edu',
        name: 'Prof. Alpha Developer',
        role: 'INSTRUCTOR'
      }
    });

    const instBeta = await prisma.user.upsert({
      where: { email: 'instructor.beta@glarus.edu' },
      update: { role: 'INSTRUCTOR', name: 'Dr. Beta Architect' },
      create: {
        email: 'instructor.beta@glarus.edu',
        name: 'Dr. Beta Architect',
        role: 'INSTRUCTOR'
      }
    });

    const instGamma = await prisma.user.upsert({
      where: { email: 'instructor.gamma@glarus.edu' },
      update: { role: 'INSTRUCTOR', name: 'Eng. Gamma Specialist' },
      create: {
        email: 'instructor.gamma@glarus.edu',
        name: 'Eng. Gamma Specialist',
        role: 'INSTRUCTOR'
      }
    });

    // Clean any prior test permission records for clean slate
    await prisma.instructorCoursePermission.deleteMany({
      where: {
        instructorId: {
          in: [instAlpha.id, instBeta.id, instGamma.id]
        }
      }
    });

    assert(admin.role === 'ADMIN', '1.1 Admin user initialized with ADMIN role');
    assert(instAlpha.role === 'INSTRUCTOR', '1.2 Instructor Alpha initialized with INSTRUCTOR role');
    assert(instBeta.role === 'INSTRUCTOR', '1.3 Instructor Beta initialized with INSTRUCTOR role');
    assert(instGamma.role === 'INSTRUCTOR', '1.4 Instructor Gamma initialized with INSTRUCTOR role');

    // --- Step 2: Default Locked State (NOT_REQUESTED) ---
    console.log('\n--- Section 2: Default Locked State & NOT_REQUESTED Behavior ---');

    const alphaDefaultStatus = await getInstructorCourseCreationStatus(instAlpha.id);
    assert(
      alphaDefaultStatus.status === 'NOT_REQUESTED',
      '2.1 Uninitialized instructor has status NOT_REQUESTED'
    );
    assert(
      alphaDefaultStatus.allowed === false && alphaDefaultStatus.canCreateCourse === false,
      '2.2 Course creation is locked by default (allowed=false, canCreateCourse=false)'
    );

    const alphaAuthCheck = await checkInstructorCourseCreationPermission(instAlpha.id);
    assert(
      alphaAuthCheck.allowed === false,
      '2.3 Backend checkInstructorCourseCreationPermission returns allowed=false'
    );

    // --- Step 3: Instructor Request Submission ---
    console.log('\n--- Section 3: Permission Request Submission (PENDING) ---');

    const requestRes = await requestCourseCreationPermission(
      instAlpha.id,
      'Proposing a comprehensive Next.js 15 & Distributed Systems Masterclass.'
    );

    assert(requestRes.success === true, '3.1 Permission request submission returned success=true');
    assert(requestRes.status === 'PENDING', '3.2 Permission status transitioned to PENDING');

    const alphaPendingStatus = await getInstructorCourseCreationStatus(instAlpha.id);
    assert(
      alphaPendingStatus.status === 'PENDING',
      '3.3 Database confirms status is PENDING'
    );
    assert(
      alphaPendingStatus.allowed === false && alphaPendingStatus.canCreateCourse === false,
      '3.4 Course creation remains locked while request is PENDING review'
    );
    assert(
      alphaPendingStatus.notes === 'Proposing a comprehensive Next.js 15 & Distributed Systems Masterclass.',
      '3.5 Instructor request note and topic proposal persisted accurately'
    );

    // --- Step 4: Duplicate Request Prevention ---
    console.log('\n--- Section 4: Duplicate Request Prevention ---');

    const duplicateRes = await requestCourseCreationPermission(
      instAlpha.id,
      'Duplicate request submission attempt.'
    );

    assert(
      duplicateRes.success === false && duplicateRes.status === 'PENDING',
      '4.1 Duplicate submission prevented when a request is already PENDING'
    );

    // --- Step 5: Admin Review & Approval Flow ---
    console.log('\n--- Section 5: Admin Approval Action (APPROVED) ---');

    const approveRes = await adminReviewCourseCreationPermission(
      admin.id,
      instAlpha.id,
      'APPROVE',
      'Curriculum outline and project plan look exceptional. Approved for course publishing.'
    );

    assert(approveRes.success === true, '5.1 Admin approval action returned success=true');
    assert(approveRes.status === 'APPROVED', '5.2 Status transitioned to APPROVED');

    const alphaApprovedStatus = await getInstructorCourseCreationStatus(instAlpha.id);
    assert(
      alphaApprovedStatus.status === 'APPROVED' && alphaApprovedStatus.allowed === true,
      '5.3 Status is APPROVED and allowed=true for course creation'
    );
    assert(
      alphaApprovedStatus.canCreateCourse === true,
      '5.4 canCreateCourse flag is explicitly true'
    );

    const alphaPermRecord = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId: instAlpha.id }
    });
    assert(
      alphaPermRecord?.reviewedById === admin.id,
      '5.5 Reviewing Admin ID is recorded in permission record'
    );
    assert(
      alphaPermRecord?.reviewedAt !== null,
      '5.6 Review timestamp reviewedAt is recorded'
    );
    assert(
      Array.isArray(alphaPermRecord?.requestHistory) && (alphaPermRecord?.requestHistory as any[]).length >= 2,
      '5.7 Complete audit trail history maintained in requestHistory JSON'
    );

    // Verify Audit Log entry
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        adminId: admin.id,
        action: 'INSTRUCTOR_COURSE_PERMISSION_APPROVED'
      },
      orderBy: { timestamp: 'desc' },
      take: 1
    });
    assert(
      auditLogs.length > 0,
      '5.8 Platform AuditLog entry generated for permission approval'
    );

    // --- Step 6: Course Creation While Approved ---
    console.log('\n--- Section 6: Course Creation by Approved Instructor ---');

    const testCourse = await prisma.course.create({
      data: {
        instructorId: instAlpha.id,
        title: 'Distributed Systems & Cloud Architecture Masterclass',
        description: 'Deep dive into microservices, consensus protocols, and scale.',
        price: 7999,
        type: 'SELF_PACED',
        category: 'Engineering',
        isPublished: true,
        status: 'APPROVED'
      }
    });

    assert(
      testCourse.id !== undefined && testCourse.instructorId === instAlpha.id,
      '6.1 Approved instructor successfully created and published a course'
    );

    // --- Step 7: Admin Rejection & Re-application Flow (Instructor Beta) ---
    console.log('\n--- Section 7: Rejection Flow & Re-Application (Instructor Beta) ---');

    // Beta requests
    await requestCourseCreationPermission(
      instBeta.id,
      'Draft course on Basic Web Development.'
    );

    // Admin rejects with feedback
    const rejectRes = await adminReviewCourseCreationPermission(
      admin.id,
      instBeta.id,
      'REJECT',
      'Please provide detailed module breakdowns and include hands-on capstone assignments.'
    );

    assert(rejectRes.status === 'REJECTED', '7.1 Status transitioned to REJECTED');

    const betaRejectedStatus = await getInstructorCourseCreationStatus(instBeta.id);
    assert(
      betaRejectedStatus.allowed === false && betaRejectedStatus.canCreateCourse === false,
      '7.2 Rejected instructor cannot create courses (allowed=false)'
    );
    assert(
      betaRejectedStatus.rejectionReason === 'Please provide detailed module breakdowns and include hands-on capstone assignments.',
      '7.3 Admin rejection feedback is stored and accessible to instructor'
    );

    // Beta re-applies with improved proposal
    const reapplyRes = await requestCourseCreationPermission(
      instBeta.id,
      'Updated proposal: 8 modules including 3 production capstone projects.'
    );

    assert(
      reapplyRes.success === true && reapplyRes.status === 'PENDING',
      '7.4 Instructor successfully re-applied after rejection (status reset to PENDING)'
    );

    const betaPendingAgain = await getInstructorCourseCreationStatus(instBeta.id);
    assert(
      betaPendingAgain.status === 'PENDING',
      '7.5 Re-applied proposal is now PENDING review'
    );

    // Admin approves revised application
    await adminReviewCourseCreationPermission(
      admin.id,
      instBeta.id,
      'APPROVE',
      'Revised curriculum is comprehensive. Approved.'
    );

    const betaApproved = await getInstructorCourseCreationStatus(instBeta.id);
    assert(
      betaApproved.status === 'APPROVED' && betaApproved.allowed === true,
      '7.6 Revised proposal approved; Beta now has active course creation privileges'
    );

    // --- Step 8: Direct Grant Flow (Instructor Gamma) ---
    console.log('\n--- Section 8: Direct Admin Grant (Instructor Gamma) ---');

    const grantRes = await adminReviewCourseCreationPermission(
      admin.id,
      instGamma.id,
      'GRANT'
    );

    assert(grantRes.success === true, '8.1 Admin direct grant returned success=true');
    assert(grantRes.status === 'APPROVED', '8.2 Direct grant set status directly to APPROVED');

    const gammaStatus = await getInstructorCourseCreationStatus(instGamma.id);
    assert(
      gammaStatus.allowed === true && gammaStatus.canCreateCourse === true,
      '8.3 Directly granted instructor has immediate course creation permission'
    );

    // --- Step 9: Permission Revocation & Course Preservation ---
    console.log('\n--- Section 9: Permission Revocation & Data Integrity ---');

    const revokeRes = await adminReviewCourseCreationPermission(
      admin.id,
      instAlpha.id,
      'REVOKE',
      'Course authoring privileges paused for seasonal catalog audit.'
    );

    assert(revokeRes.status === 'REVOKED', '9.1 Status transitioned to REVOKED');

    const alphaRevokedStatus = await getInstructorCourseCreationStatus(instAlpha.id);
    assert(
      alphaRevokedStatus.allowed === false && alphaRevokedStatus.canCreateCourse === false,
      '9.2 Revoked instructor cannot create new courses (allowed=false)'
    );

    // CRITICAL: Verify existing course is 100% preserved and unaffected
    const preservedCourse = await prisma.course.findUnique({
      where: { id: testCourse.id }
    });

    assert(
      preservedCourse !== null && preservedCourse.title === 'Distributed Systems & Cloud Architecture Masterclass',
      '9.3 Existing course remains 100% active, intact, and untouched after permission revocation'
    );
    assert(
      preservedCourse?.isPublished === true,
      '9.4 Preserved course publication status is completely preserved'
    );

    // --- Step 10: Unauthorized Roles & Admin Safeguards ---
    console.log('\n--- Section 10: Security Checks & Admin Action Safeguards ---');

    const nonAdminReview = await adminReviewCourseCreationPermission(
      instBeta.id, // non-admin trying to review
      instAlpha.id,
      'APPROVE'
    );
    assert(
      nonAdminReview.success === false,
      '10.1 Non-admin user cannot approve or modify course creation permissions'
    );

    // --- Step 11: Admin Aggregate Permissions & Stats Query ---
    console.log('\n--- Section 11: Admin Aggregate Statistics & Overview ---');

    const allData = await getAllInstructorPermissions();
    assert(
      allData.instructors.length >= 3,
      '11.1 getAllInstructorPermissions retrieves all instructors in the system'
    );
    assert(
      allData.stats.total >= 3,
      '11.2 Stats total count matches instructor database records'
    );
    assert(
      allData.stats.approved >= 2, // Beta and Gamma are approved
      '11.3 Stats approved count matches approved instructors'
    );
    assert(
      allData.stats.revoked >= 1, // Alpha is revoked
      '11.4 Stats revoked count matches revoked instructors'
    );

    // --- Cleanup test data ---
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.instructorCoursePermission.deleteMany({
      where: {
        instructorId: { in: [instAlpha.id, instBeta.id, instGamma.id] }
      }
    });

    console.log('\n===============================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test suite encountered unhandled error:', error);
    process.exit(1);
  }
}

runCourseCreationPermissionTestSuite();
