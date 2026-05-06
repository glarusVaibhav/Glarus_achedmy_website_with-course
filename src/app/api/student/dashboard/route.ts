import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const userId = session.id as string;

    // Continue Learning — most recently accessed course
    const lastActivity = await prisma.userActivity.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { course: { include: { instructor: { select: { name: true } } } } },
    });

    // Stats
    const enrollments = await prisma.enrollment.findMany({ where: { userId } });
    const totalEnrolled = enrollments.length;

    // Self-paced progress calculation
    const selfPacedEnrollments = await prisma.enrollment.findMany({
      where: { userId, course: { type: "SELF_PACED" } },
      include: { course: { include: { modules: { include: { lectures: true } } } } },
    });

    let totalCompleted = 0;
    let totalInProgress = 0;
    for (const en of selfPacedEnrollments) {
      const allLectures = (en as any).course.modules.flatMap((m: any) => m.lectures);
      if (allLectures.length === 0) continue;
      const completed = await prisma.videoProgress.count({
        where: { userId, isCompleted: true, lectureId: { in: allLectures.map((l: any) => l.id) } },
      });
      if (completed === allLectures.length) totalCompleted++;
      else if (completed > 0) totalInProgress++;
    }

    // Instructor-led courses count as in-progress
    const instructorLedCount = await prisma.enrollment.count({
      where: { userId, course: { type: "INSTRUCTOR_LED" } },
    });
    totalInProgress += instructorLedCount;

    // Learning streak (count consecutive days with activity)
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    let streak = 0;
    if (activities.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const uniqueDays = [...new Set(activities.map((a) => {
        const d = new Date(a.updatedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a);

      for (let i = 0; i < uniqueDays.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        expected.setHours(0, 0, 0, 0);
        if (uniqueDays[i] === expected.getTime()) streak++;
        else break;
      }
    }

    // Total learning hours
    const totalSecondsResult = await prisma.userActivity.aggregate({
      where: { userId },
      _sum: { totalSeconds: true },
    });
    const totalHours = Math.round(((totalSecondsResult._sum.totalSeconds || 0) / 3600) * 10) / 10;

    // Achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });
    const totalXP = achievements.reduce((sum, a) => sum + a.xp, 0);

    // Notifications (unread)
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: { course: { include: { instructor: { select: { name: true } } } } },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json({
      continueLearning: lastActivity
        ? {
            courseId: lastActivity.courseId,
            courseTitle: lastActivity.course.title,
            instructor: lastActivity.course.instructor.name,
            lastLecture: lastActivity.lastLectureTitle,
            lastTimestamp: lastActivity.lastTimestamp,
            progress: 0,
          }
        : null,
      stats: {
        total: totalEnrolled,
        inProgress: totalInProgress,
        completed: totalCompleted,
        streak,
        totalHours,
        totalXP,
      },
      achievements,
      notifications,
      certificates: certificates.map((c) => ({
        id: c.id,
        courseTitle: c.course.title,
        instructor: c.course.instructor.name,
        issueDate: c.issueDate,
        certificateUrl: c.certificateUrl,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
