import { LiveSessionService } from '../src/lib/services/liveSessionService';
import prisma from '../src/lib/db';

async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'STUDENT', liveCourseEnrollments: { some: {} } } });
  if (!user) {
    console.log('No enrolled student found');
    return;
  }
  const result = await LiveSessionService.getEnrolledLiveCoursesAndClasses(user.id);
  console.log(`Enrolled courses found: ${result.courses.length}`);
  for (const c of result.courses) {
    if (c.notifications && c.notifications.length > 0) {
      console.log(`\n📚 Course: "${c.title}" (Unread: ${c.unreadNotificationCount})`);
      for (const n of c.notifications) {
        console.log(`   🔔 [${n.sessionCode}] ${n.title}`);
        console.log(`      Message: "${n.message}"`);
        console.log(`      Active Resources -> Video: ${n.hasVideo}, PDF: ${n.hasPdf}, Quiz: ${n.hasQuiz}, Assignment: ${n.hasAssignment}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
