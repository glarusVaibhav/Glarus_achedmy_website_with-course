import prisma from '../src/lib/db';

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log('No admin found.');
    return;
  }

  // Create a realistic reschedule notification for the admin
  const notif = await prisma.notification.create({
    data: {
      recipientId: admin.id,
      category: 'ADMIN',
      type: 'TASK_UPDATED',
      priority: 'HIGH',
      title: 'Session Reschedule Requested: LLM Prompt Engineering',
      message: 'Instructor Himanshu requested to move Session 2 to Tomorrow at 15:30 IST.',
      details: 'Reason: "Network maintenance at university campus". Review and approve/deny in Academic Operations.',
      entityType: 'LIVE_SESSION',
      actionUrl: '/admin/live-training/instructor-assignments',
      icon: 'clock'
    }
  });

  console.log(`✅ Successfully generated Admin Reschedule Notification:`, notif.id);

  const adminNotifs = await prisma.notification.findMany({
    where: { recipientId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      message: true,
      category: true,
      priority: true,
      actionUrl: true,
      isRead: true
    }
  });

  console.log('\nLatest 5 Admin Notifications:');
  console.table(adminNotifs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
