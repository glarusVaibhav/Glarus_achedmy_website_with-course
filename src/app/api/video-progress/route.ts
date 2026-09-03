import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { VideoProgressSchema } from '@/lib/validation/studentSchemas';

export async function POST(req: Request) {
  try {
    const user = await verifyStudentSession();
    const body = await req.json();

    const validation = VideoProgressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message || 'Invalid video progress data',
          },
        },
        { status: 400 }
      );
    }

    const { lectureId, progressSeconds, isCompleted } = validation.data;

    // 1. Upsert VideoProgress
    const progress = await prisma.videoProgress.upsert({
      where: { userId_lectureId: { userId: user.id, lectureId } },
      update: {
        progressSeconds,
        isCompleted: isCompleted ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        lectureId,
        progressSeconds,
        isCompleted: isCompleted || false,
      },
    });

    // 2. Fetch lecture to update UserActivity (Continue Learning & Streak)
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { module: { include: { course: true } } },
    });

    if (lecture && lecture.module?.course) {
      const courseId = lecture.module.course.id;

      await prisma.userActivity.upsert({
        where: { userId_courseId: { userId: user.id, courseId } },
        update: {
          lastLectureId: lecture.id,
          lastLectureTitle: lecture.title,
          lastTimestamp: progressSeconds,
          totalSeconds: { increment: Math.min(progressSeconds, 300) },
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          courseId,
          lastLectureId: lecture.id,
          lastLectureTitle: lecture.title,
          lastTimestamp: progressSeconds,
          totalSeconds: progressSeconds,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, progress });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Video Progress API Error]:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await verifyStudentSession();
    const url = new URL(req.url);
    const lectureId = url.searchParams.get('lectureId');

    if (!lectureId) {
      return NextResponse.json({ error: 'lectureId is required' }, { status: 400 });
    }

    const progress = await prisma.videoProgress.findUnique({
      where: { userId_lectureId: { userId: user.id, lectureId } },
    });

    return NextResponse.json({
      progressSeconds: progress?.progressSeconds || 0,
      isCompleted: progress?.isCompleted || false,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
