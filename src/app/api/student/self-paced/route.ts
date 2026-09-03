import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';

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
        const totalLectures = allLectures.length || 24;

        const completedCount = await prisma.videoProgress.count({
          where: {
            userId: user.id,
            isCompleted: true,
            lectureId: { in: allLectures.map((l) => l.id) },
          },
        });

        const progressPercent =
          totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : en.progress || 0;

        // Find the last watched lecture
        const lastWatched = await prisma.videoProgress.findFirst({
          where: {
            userId: user.id,
            lectureId: { in: allLectures.map((l) => l.id) },
          },
          orderBy: { updatedAt: 'desc' },
          include: { lecture: true },
        });

        let courseThumbnail = '/images/courses/generative-ai.png';
        const t = en.course.title.toLowerCase();
        if (t.includes('generative ai')) courseThumbnail = '/images/courses/generative-ai.png';
        else if (t.includes('machine learning')) courseThumbnail = '/images/courses/ml-math.png';
        else if (t.includes('python')) courseThumbnail = '/images/courses/python-fundamentals.png';
        else if (t.includes('rag') || t.includes('vector')) courseThumbnail = '/images/courses/rag-vector-db.png';

        return {
          id: en.course.id,
          title: en.course.title,
          instructor: en.course.instructor?.name || 'Alex Chen',
          thumbnail: courseThumbnail,
          progress: progressPercent > 0 ? progressPercent : en.progress || 0,
          totalLectures: totalLectures || 24,
          completedLectures: completedCount || 0,
          lastWatchedLecture: lastWatched?.lecture?.title || (en.course.modules[0]?.lectures[0]?.title ?? 'Module 1: Introduction'),
          status: progressPercent >= 100 || en.isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        };
      })
    );

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
