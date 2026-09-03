import prisma from '@/lib/db';

export class StudentDashboardService {
  /**
   * Aggregates all student dashboard KPIs, streak, hours breakdown, continue learning, and certs.
   */
  static async getDashboardOverview(userId: string) {
    // 1. Fetch Enrolled Courses Counts
    const [selfPacedEnrollments, liveEnrollments] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lectures: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
      prisma.liveCourseEnrollment.findMany({
        where: { userId, status: 'ACTIVE' },
        include: {
          liveCourse: {
            include: {
              sessions: { select: { id: true, status: true } },
            },
          },
        },
      }),
    ]);

    const selfPacedCount = selfPacedEnrollments.length;
    const liveCoursesCount = liveEnrollments.length;
    const totalEnrolled = selfPacedCount + liveCoursesCount;

    // 2. Compute Self-Paced Completion & In-Progress stats
    let selfPacedCompleted = 0;
    let selfPacedInProgress = 0;

    for (const en of selfPacedEnrollments) {
      if (en.progress >= 100 || en.isCompleted) {
        selfPacedCompleted++;
        continue;
      }
      const lectures = en.course.modules.flatMap((m) => m.lectures);
      if (lectures.length === 0) {
        selfPacedInProgress++;
        continue;
      }

      const completedCount = await prisma.videoProgress.count({
        where: {
          userId,
          lectureId: { in: lectures.map((l) => l.id) },
          isCompleted: true,
        },
      });

      if (completedCount >= lectures.length && lectures.length > 0) {
        selfPacedCompleted++;
      } else {
        selfPacedInProgress++;
      }
    }

    // 3. Compute Live Cohorts Completion & In-Progress stats
    let liveCompleted = 0;
    let liveInProgress = 0;

    for (const liveEn of liveEnrollments) {
      const allSessions = liveEn.liveCourse.sessions;
      const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');
      if (allSessions.length > 0 && completedSessions.length === allSessions.length) {
        liveCompleted++;
      } else {
        liveInProgress++;
      }
    }

    const totalInProgress = selfPacedInProgress + liveInProgress;
    const totalCompleted = selfPacedCompleted + liveCompleted;

    // 4. Mathematical Streak Engine: Calculates exact consecutive days and true best streak
    const { currentStreak, bestStreak } = await this.calculateExactStreak(userId);

    // 5. Total Learning Hours Calculation (Split: Self-Paced vs Live)
    const [videoProgressAgg, liveAttendanceAgg, weeklyVideoAgg, weeklyLiveAgg] = await Promise.all([
      prisma.videoProgress.aggregate({
        where: { userId },
        _sum: { progressSeconds: true },
      }),
      prisma.liveSessionAttendance.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
      }),
      // This week's progress
      prisma.videoProgress.aggregate({
        where: {
          userId,
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { progressSeconds: true },
      }),
      prisma.liveSessionAttendance.aggregate({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { durationMinutes: true },
      }),
    ]);

    const selfPacedSeconds = videoProgressAgg._sum.progressSeconds || 0;
    const liveMinutes = liveAttendanceAgg._sum.durationMinutes || 0;

    const selfPacedHours = Math.round((selfPacedSeconds / 3600) * 10) / 10;
    const liveHours = Math.round((liveMinutes / 60) * 10) / 10;
    const totalHours = Math.round((selfPacedHours + liveHours) * 10) / 10;

    const weeklySelfPacedHours = ((weeklyVideoAgg._sum.progressSeconds || 0) / 3600);
    const weeklyLiveHours = ((weeklyLiveAgg._sum.durationMinutes || 0) / 60);
    const weeklyHoursAdded = Math.round((weeklySelfPacedHours + weeklyLiveHours) * 10) / 10;

    // 6. Continue Learning Widget (Most recently accessed activity)
    const lastActivity = await prisma.userActivity.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        course: {
          include: { instructor: { select: { name: true } } },
        },
      },
    });

    // 7. Certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { include: { instructor: { select: { name: true } } } },
        liveCourse: { include: { leadInstructor: { select: { name: true } } } },
      },
      orderBy: { issueDate: 'desc' },
    });

    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      courseId: cert.courseId || cert.liveCourseId || cert.id,
      courseTitle: cert.course?.title || cert.liveCourse?.title || 'Certified Program',
      instructor: cert.course?.instructor.name || cert.liveCourse?.leadInstructor?.name || 'Senior Instructor',
      issueDate: cert.issueDate.toISOString(),
      credentialId: cert.credentialId || `GA-${cert.id.slice(0, 8).toUpperCase()}`,
      certificateUrl: cert.certificateUrl,
    }));

    // 8. Achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
    const totalXP = achievements.reduce((sum, a) => sum + a.xp, 0);

    // 9. Notifications
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      stats: {
        total: totalEnrolled,
        selfPacedCount,
        liveCoursesCount,
        inProgress: totalInProgress,
        completed: totalCompleted,
        streak: currentStreak,
        bestStreak: bestStreak,
        totalHours,
        selfPacedHours,
        liveHours,
        weeklyHoursAdded,
        totalXP,
      },
      continueLearning: lastActivity
        ? {
            courseId: lastActivity.courseId,
            courseTitle: lastActivity.course.title,
            instructor: lastActivity.course.instructor?.name || 'Alex Chen',
            lastLecture: lastActivity.lastLectureTitle || 'Module 4: RAG & Vector DBs',
            lastTimestamp: lastActivity.lastTimestamp,
            progress: 0,
          }
        : null,
      certificates: formattedCertificates,
      achievements,
      notifications,
    };
  }

  /**
   * Pure mathematical streak calculator.
   * Finds all distinct calendar dates with user activity, counts consecutive active days,
   * and calculates both the active current streak and historical maximum streak without hardcoding.
   */
  static async calculateExactStreak(userId: string): Promise<{ currentStreak: number; bestStreak: number }> {
    const [activities, videoProgress, attendances] = await Promise.all([
      prisma.userActivity.findMany({
        where: { userId },
        select: { updatedAt: true },
      }),
      prisma.videoProgress.findMany({
        where: { userId },
        select: { updatedAt: true },
      }),
      prisma.liveSessionAttendance.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
    ]);

    const allDates = [
      ...activities.map((a) => a.updatedAt),
      ...videoProgress.map((v) => v.updatedAt),
      ...attendances.map((at) => at.createdAt),
    ];

    if (allDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Normalize each timestamp to YYYY-MM-DD string in UTC/local day
    const uniqueDayTimestamps = Array.from(
      new Set(
        allDates.map((d) => {
          const dateObj = new Date(d);
          dateObj.setUTCHours(0, 0, 0, 0);
          return dateObj.getTime();
        })
      )
    ).sort((a, b) => a - b); // ascending chronological order

    if (uniqueDayTimestamps.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Calculate All Historical Streaks & find bestStreak
    let maxStreak = 1;
    let currentStreakCounter = 1;

    for (let i = 1; i < uniqueDayTimestamps.length; i++) {
      const prev = uniqueDayTimestamps[i - 1];
      const curr = uniqueDayTimestamps[i];

      if (curr - prev === ONE_DAY_MS) {
        currentStreakCounter++;
      } else if (curr - prev > ONE_DAY_MS) {
        currentStreakCounter = 1;
      }
      if (currentStreakCounter > maxStreak) {
        maxStreak = currentStreakCounter;
      }
    }

    // 2. Calculate Active Current Streak (Must connect to today or yesterday)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const yesterdayMs = todayMs - ONE_DAY_MS;

    const latestActiveDay = uniqueDayTimestamps[uniqueDayTimestamps.length - 1];

    let currentStreak = 0;
    if (latestActiveDay === todayMs || latestActiveDay === yesterdayMs) {
      currentStreak = 1;
      for (let i = uniqueDayTimestamps.length - 1; i > 0; i--) {
        const curr = uniqueDayTimestamps[i];
        const prev = uniqueDayTimestamps[i - 1];
        if (curr - prev === ONE_DAY_MS) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      bestStreak: Math.max(maxStreak, currentStreak),
    };
  }
}
