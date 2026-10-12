import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { getCourseData } from '@/lib/courses/course-loader';

export async function GET() {
  try {
    const user = await verifyStudentSession();

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lectures: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let courses = await Promise.all(
      enrollments.map(async (en) => {
        const allLectures = en.course.modules.flatMap((m) => m.lectures);
        const isInteractiveInDb = en.course.courseFormat === 'INTERACTIVE_LAB';
        const jsonCourse = (isInteractiveInDb || allLectures.length === 0)
          ? (getCourseData(en.course.id) || getCourseData(en.course.title))
          : null;
        const isJsonCourse = isInteractiveInDb || Boolean(jsonCourse && Array.isArray(jsonCourse.lessons) && jsonCourse.lessons.length > 0);

        const totalLectures = isJsonCourse && jsonCourse
          ? jsonCourse.lessons.length
          : allLectures.length > 0
          ? allLectures.length
          : 24;

        const completedCount = await prisma.videoProgress.count({
          where: {
            userId: user.id,
            isCompleted: true,
            lectureId: { in: allLectures.map((l) => l.id) },
          },
        });

        // Find the user activity or last watched lecture
        const [lastWatched, lastActivity] = await Promise.all([
          prisma.videoProgress.findFirst({
            where: {
              userId: user.id,
              lectureId: { in: allLectures.map((l) => l.id) },
            },
            orderBy: { updatedAt: 'desc' },
            include: { lecture: true },
          }),
          prisma.userActivity.findFirst({
            where: {
              userId: user.id,
              OR: [
                { courseId: en.course.id },
                { courseId: en.courseId },
                { courseId: en.course.title },
              ],
            },
            orderBy: { updatedAt: 'desc' },
          }).catch(() => null),
        ]);

        const progressPercent =
          totalLectures > 0 && completedCount > 0
            ? Math.round((completedCount / totalLectures) * 100)
            : en.progress || 0;

        const effectiveCompletedCount =
          completedCount > 0
            ? completedCount
            : progressPercent > 0
            ? Math.min(totalLectures, Math.round((progressPercent / 100) * totalLectures))
            : 0;

        const hasActiveStudy = Boolean(lastActivity || lastWatched || progressPercent > 0);
        const lastStudyDate =
          lastActivity?.updatedAt ||
          lastWatched?.updatedAt ||
          (progressPercent > 0 ? en.updatedAt : null);

        const lastAccessedDate =
          lastStudyDate ||
          en.updatedAt ||
          en.createdAt;

        let courseThumbnail = (en.course as any).image;
        if (!courseThumbnail || courseThumbnail === '/placeholder-course.jpg') {
          const t = en.course.title.toLowerCase();
          if (t.includes('generative ai')) courseThumbnail = '/images/courses/generative-ai.png';
          else if (t.includes('machine learning') || t.includes('ml')) courseThumbnail = '/images/courses/ml-math.png';
          else if (t.includes('python')) courseThumbnail = '/images/courses/python-fundamentals.png';
          else if (t.includes('rag') || t.includes('vector')) courseThumbnail = '/images/courses/rag-vector-db.png';
          else courseThumbnail = '/images/courses/generative-ai.png';
        }

        const defaultLastTitle = isJsonCourse
          ? (jsonCourse!.lessons[0]?.title || 'Lesson 1: Foundations')
          : (en.course.modules[0]?.lectures[0]?.title ?? 'Module 1: Introduction');

        return {
          id: en.course.id,
          title: en.course.title,
          instructor: en.course.instructor?.name || 'Alex Chen',
          thumbnail: courseThumbnail,
          courseType: isJsonCourse ? 'JSON_GAMIFIED' : 'VIDEO_STUDIO',
          badgeText: isJsonCourse ? 'Interactive Gamified Course' : 'On-Demand Video Studio',
          curriculumType: isJsonCourse ? 'Interactive AI Lab Curriculum' : 'On-Demand Video Curriculum',
          progress: progressPercent,
          totalLectures: totalLectures || 24,
          completedLectures: effectiveCompletedCount,
          lastWatchedLecture: lastActivity?.lastLectureTitle || lastWatched?.lecture?.title || defaultLastTitle,
          lastAccessedAt: lastAccessedDate ? new Date(lastAccessedDate).toISOString() : null,
          hasActiveStudy,
          studyTimestamp: lastStudyDate ? new Date(lastStudyDate).getTime() : 0,
          status: progressPercent >= 100 || en.isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        };
      })
    );

    // Sort by most recently studied / accessed course first
    courses.sort((a, b) => {
      // 1. Actively studied courses come first, ordered by recent study time
      if (a.hasActiveStudy && b.hasActiveStudy) {
        return (b.studyTimestamp || 0) - (a.studyTimestamp || 0);
      }
      if (a.hasActiveStudy) return -1;
      if (b.hasActiveStudy) return 1;

      // 2. In-progress courses before non-started courses
      const inProgA = (a.progress || 0) > 0 && (a.progress || 0) < 100 ? 1 : 0;
      const inProgB = (b.progress || 0) > 0 && (b.progress || 0) < 100 ? 1 : 0;
      if (inProgA !== inProgB) return inProgB - inProgA;

      // 3. Last accessed / enrolled date
      const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
      const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ courses });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Self-Paced Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch self-paced courses.' } },
      { status: 500 }
    );
  }
}
