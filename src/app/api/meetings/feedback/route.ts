import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession().catch(() => null);
    const body = await req.json().catch(() => ({}));
    const { sessionId, userId: bodyUserId, rating, feedback, tags } = body;

    const effectiveUserId = session?.id || bodyUserId;
    const ratingNum = typeof rating === 'number' ? Math.min(5, Math.max(1, rating)) : 5;
    const feedbackText = typeof feedback === 'string' ? feedback.trim() : '';
    const tagList = Array.isArray(tags) ? tags.filter((t: any) => typeof t === 'string') : [];

    console.log(`[Meeting Feedback] Received feedback for session ${sessionId} from user ${effectiveUserId}:`, {
      rating: ratingNum,
      feedback: feedbackText,
      tags: tagList,
    });

    if (sessionId && effectiveUserId) {
      // 1. Update or create student attendance with feedback notes and exit timestamp
      const formattedNote = [
        `Rating: ${ratingNum}/5`,
        tagList.length > 0 ? `Tags: ${tagList.join(', ')}` : null,
        feedbackText ? `Feedback: ${feedbackText}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      try {
        await prisma.liveSessionAttendance.upsert({
          where: {
            sessionId_userId: {
              sessionId,
              userId: effectiveUserId,
            },
          },
          update: {
            leftAt: new Date(),
            notes: formattedNote,
          },
          create: {
            sessionId,
            userId: effectiveUserId,
            status: 'PRESENT',
            joinedAt: new Date(),
            leftAt: new Date(),
            notes: formattedNote,
          },
        });
      } catch (attErr) {
        console.warn('[Meeting Feedback] Attendance update skipped or failed:', attErr);
      }

      // 2. Look up live session to notify instructor
      try {
        const liveSession = await prisma.liveSession.findUnique({
          where: { id: sessionId },
          include: {
            liveCourse: {
              select: {
                id: true,
                title: true,
                leadInstructorId: true,
              },
            },
          },
        });

        if (liveSession?.liveCourse?.leadInstructorId) {
          const studentName = session?.name || 'A student';
          await prisma.notification.create({
            data: {
              recipientId: liveSession.liveCourse.leadInstructorId,
              actorId: effectiveUserId,
              category: 'LIVE_SESSION',
              type: 'STUDENT_FEEDBACK_RECEIVED',
              priority: 'NORMAL',
              title: `New Live Session Rating: ${ratingNum}/5 Stars`,
              message: `${studentName} left a ${ratingNum}/5 star review for "${liveSession.title}".`,
              details: feedbackText || (tagList.length > 0 ? `Tags: ${tagList.join(', ')}` : 'No additional comments provided.'),
              entityType: 'LIVE_SESSION',
              entityId: sessionId,
              actionUrl: `/instructor/live-sessions`,
              icon: 'Star',
              metadata: JSON.stringify({
                rating: ratingNum,
                feedback: feedbackText,
                tags: tagList,
                sessionId,
                sessionTitle: liveSession.title,
                courseTitle: liveSession.liveCourse.title,
              }),
            },
          });
        }
      } catch (notifErr) {
        console.warn('[Meeting Feedback] Notification creation skipped or failed:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: {
        sessionId,
        rating: ratingNum,
        feedback: feedbackText,
      },
    });
  } catch (err: any) {
    console.error('[Meeting Feedback API Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
