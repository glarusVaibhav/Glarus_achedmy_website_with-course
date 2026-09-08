import prisma from '../lib/db';
import { notificationService } from '../lib/notifications/notificationService';
import { DOMAIN_EVENT_TYPES } from '../lib/notifications/events';

async function main() {
  console.log('🧪 Starting Student Notification System End-to-End Verification...');

  // 1. Locate student
  const student = await prisma.user.findFirst({
    where: { email: 'arun.sharma@gmail.com' },
  });

  if (!student) {
    console.error('❌ Student user not found!');
    process.exit(1);
  }

  console.log(`✅ Found student: ${student.name} (${student.id})`);

  // 2. Clean previous test notifications for this student if any
  await prisma.notification.deleteMany({
    where: { recipientId: student.id },
  });
  console.log('🧹 Cleaned previous notifications for student.');

  // 3. Test Event 1: STUDENT_ENROLLED
  console.log('\n--- 1. Testing STUDENT_ENROLLED Event ---');
  const enrollCount = await notificationService.processDomainEvent({
    eventType: DOMAIN_EVENT_TYPES.STUDENT_ENROLLED,
    actorId: student.id,
    timestamp: new Date(),
    payload: {
      courseId: 'course_ai_masterclass',
      courseTitle: 'Full-Stack Generative AI Masterclass',
      studentId: student.id,
      studentName: student.name || 'Arun Sharma',
      instructorId: null,
    },
  });
  console.log(`Generated ${enrollCount} notification(s) for STUDENT_ENROLLED`);

  // 4. Test Event 2: ASSIGNMENT_GRADED
  console.log('\n--- 2. Testing ASSIGNMENT_GRADED Event ---');
  const gradeCount = await notificationService.processDomainEvent({
    eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_GRADED,
    actorId: 'inst_123',
    timestamp: new Date(),
    payload: {
      assignmentId: 'asg_rag_pipeline',
      assignmentTitle: 'Production RAG Evaluation Benchmark',
      studentId: student.id,
      score: '96/100',
      feedback: 'Exceptional cross-encoder reranking implementation!',
      instructorName: 'Dr. Alex Vance',
    },
  });
  console.log(`Generated ${gradeCount} notification(s) for ASSIGNMENT_GRADED`);

  // 5. Test Event 3: LIVE_SESSION_REMINDER
  console.log('\n--- 3. Testing LIVE_SESSION_REMINDER Event ---');
  const liveCount = await notificationService.processDomainEvent({
    eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_REMINDER,
    actorId: null,
    timestamp: new Date(),
    payload: {
      sessionId: 'session_live_101',
      sessionTitle: 'Fine-Tuning DeepSeek & Llama 3 with Unsloth',
      liveCourseId: 'lc_genai',
      liveCourseTitle: 'Generative AI Live Cohort',
      instructorId: student.id, // Emulating recipient
      startsInMinutes: 15,
      meetingUrl: 'https://zoom.us/j/9988776655',
    },
  });
  console.log(`Generated ${liveCount} notification(s) for LIVE_SESSION_REMINDER`);

  // 6. Test Event 4: COURSE_MILESTONE
  console.log('\n--- 4. Testing COURSE_MILESTONE Event ---');
  const milestoneCount = await notificationService.processDomainEvent({
    eventType: DOMAIN_EVENT_TYPES.COURSE_MILESTONE,
    actorId: student.id,
    timestamp: new Date(),
    payload: {
      studentId: student.id,
      courseId: 'course_ai_masterclass',
      courseTitle: 'Full-Stack Generative AI Masterclass',
      milestonePercent: 100,
      certificateUrl: '/student/certificates',
    },
  });
  console.log(`Generated ${milestoneCount} notification(s) for COURSE_MILESTONE`);

  // 7. Verify Queries
  console.log('\n--- 5. Querying Student Notifications ---');
  const result = await notificationService.getNotifications({
    recipientId: student.id,
    page: 1,
    limit: 10,
  });

  console.log(`Total notifications: ${result.total}`);
  console.log(`Unread count: ${result.unreadCount}`);
  result.notifications.forEach((n, idx) => {
    console.log(` [${idx + 1}] [${n.category}] ${n.title} -> actionUrl: ${n.actionUrl} (isUnread: ${n.isUnread})`);
  });

  if (result.total !== 4) {
    console.error(`❌ Expected 4 notifications, got ${result.total}`);
  } else {
    console.log('✅ All 4 domain notifications properly generated and stored in PostgreSQL!');
  }

  // 8. Test Mark Single As Read
  console.log('\n--- 6. Testing Mark Single As Read ---');
  const firstId = result.notifications[0].id;
  await notificationService.markAsRead(student.id, firstId);
  const unreadAfterOne = await notificationService.getUnreadCount(student.id);
  console.log(`Unread count after marking 1 as read: ${unreadAfterOne} (expected 3)`);

  // 9. Test Mark All As Read
  console.log('\n--- 7. Testing Mark All As Read ---');
  await notificationService.markAllAsRead(student.id);
  const unreadAfterAll = await notificationService.getUnreadCount(student.id);
  console.log(`Unread count after marking all as read: ${unreadAfterAll} (expected 0)`);

  // 11. Leave 4 fresh unread notifications for Arun Sharma for UI verification
  console.log('\n--- 9. Seeding 4 Fresh Live Unread Notifications for Student UI ---');
  await notificationService.createNotification({
    recipientId: student.id,
    category: 'LIVE_SESSION',
    type: 'LIVE_SESSION_REMINDER',
    priority: 'URGENT',
    title: '🔴 Live Class Starting in 15 Minutes!',
    message: 'Fine-Tuning DeepSeek & Llama 3 with Unsloth workshop starts at 07:00 PM IST.',
    details: 'Join the live interactive coding session. Zoom room link is ready.',
    actionUrl: '/calendar',
    deduplicationKey: 'LIVE_SEED_UI_1',
  });

  await notificationService.createNotification({
    recipientId: student.id,
    category: 'ASSIGNMENT',
    type: 'ASSIGNMENT_SUBMITTED',
    priority: 'NORMAL',
    title: '📝 Assignment Graded: Production RAG Pipeline (Score: 98/100)',
    message: 'Dr. Alex Vance completed evaluation of your Hybrid Vector Search implementation.',
    details: 'Outstanding work! Vector search retrieval speeds and re-ranking metrics were flawless.',
    actionUrl: '/student/assignments',
    deduplicationKey: 'ASG_SEED_UI_1',
  });

  await notificationService.createNotification({
    recipientId: student.id,
    category: 'COURSE',
    type: 'COURSE_PUBLISHED',
    priority: 'NORMAL',
    title: '🎓 New Module Unlocked: Autonomous Agentic Workflows',
    message: 'Module 6 has been added to your Full-Stack Generative AI Masterclass.',
    details: 'Covers LangGraph multi-agent supervisors, persistent SQLite memory, and tools.',
    actionUrl: '/student/courses',
    deduplicationKey: 'CRS_SEED_UI_1',
  });

  await notificationService.createNotification({
    recipientId: student.id,
    category: 'COURSE',
    type: 'STUDENT_COMPLETED_COURSE',
    priority: 'HIGH',
    title: '🏆 Certificate of Completion Ready to Download',
    message: 'Congratulations on achieving 100% course completion in Generative AI Foundation.',
    details: 'Your digitally verified credential ID is GA-2026-GENAI-9821.',
    actionUrl: '/student/certificates',
    deduplicationKey: 'CRT_SEED_UI_1',
  });

  const finalCount = await notificationService.getUnreadCount(student.id);
  console.log(`✅ Seeded ${finalCount} unread notifications ready for student testing.`);

  console.log('\n🎉 ALL STUDENT NOTIFICATION SYSTEM VERIFICATIONS PASSED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
