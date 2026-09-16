import prisma from '../src/lib/db';

async function main() {
  const targetEmail = 'glarusvaibhavg.ai@gmail.com';
  console.log(`Searching for user with email: "${targetEmail}"...`);

  // Check PendingRegistration
  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { email: targetEmail }
  });
  if (pendingReg) {
    console.log(`Found pending registration for ${targetEmail}. Deleting...`);
    await prisma.pendingRegistration.delete({ where: { email: targetEmail } });
    console.log(`✅ Deleted pending registration.`);
  }

  // Check PasswordResetRequest
  const pwdReset = await prisma.passwordResetRequest.findUnique({
    where: { email: targetEmail }
  });
  if (pwdReset) {
    console.log(`Found password reset request for ${targetEmail}. Deleting...`);
    await prisma.passwordResetRequest.delete({ where: { email: targetEmail } });
    console.log(`✅ Deleted password reset request.`);
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    console.log(`ℹ️ No user record found in User table with email: "${targetEmail}"`);
    return;
  }

  console.log(`\n✅ Found User:`, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  console.log(`\nDeleting user ${user.id} and all related records...`);

  await prisma.$transaction(async (tx) => {
    // 1. Password reset
    await tx.passwordResetRequest.deleteMany({ where: { userId: user.id } });
    // 2. Notifications
    await tx.notification.deleteMany({ where: { recipientId: user.id } });
    await tx.notification.deleteMany({ where: { actorId: user.id } });
    // 3. User activity & achievements
    await tx.userActivity.deleteMany({ where: { userId: user.id } });
    await tx.achievement.deleteMany({ where: { userId: user.id } });
    // 4. Learning progress & notes
    await tx.videoProgress.deleteMany({ where: { userId: user.id } });
    await tx.sessionRecordingProgress.deleteMany({ where: { userId: user.id } });
    await tx.studentNote.deleteMany({ where: { userId: user.id } });
    await tx.assignmentSubmission.deleteMany({ where: { userId: user.id } });
    await tx.liveSessionAttendance.deleteMany({ where: { userId: user.id } });
    // 5. Certificates & Enrollments
    await tx.certificate.deleteMany({ where: { userId: user.id } });
    await tx.enrollment.deleteMany({ where: { userId: user.id } });
    await tx.liveCourseEnrollment.deleteMany({ where: { userId: user.id } });
    // 6. Purchases & Invoices & Refunds
    const purchases = await tx.purchase.findMany({ where: { userId: user.id } });
    for (const p of purchases) {
      await tx.invoice.deleteMany({ where: { purchaseId: p.id } });
      await tx.refund.deleteMany({ where: { purchaseId: p.id } });
    }
    await tx.purchase.deleteMany({ where: { userId: user.id } });
    // 7. Permissions & Profile
    await tx.instructorCoursePermission.deleteMany({ where: { instructorId: user.id } });
    await tx.instructorApproval.deleteMany({ where: { userId: user.id } });
    await tx.instructorProfile.deleteMany({ where: { userId: user.id } });
    // 8. User record
    await tx.user.delete({ where: { id: user.id } });
  });

  console.log(`\n🎉 User "${targetEmail}" (ID: ${user.id}) has been successfully deleted!`);
}

main()
  .catch(err => {
    console.error('Error during deletion:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
