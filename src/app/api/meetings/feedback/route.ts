import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession().catch(() => null);
    const body = await req.json().catch(() => ({}));
    const { sessionId, userId: bodyUserId, rating, feedback, tags, isAnonymous } = body;

    const effectiveUserId = session?.id || bodyUserId;
    const ratingNum = typeof rating === 'number' ? Math.min(5, Math.max(1, Math.round(rating))) : 5;
    const feedbackText = typeof feedback === 'string' ? feedback.trim() : '';
    const tagList = Array.isArray(tags) ? tags.filter((t: any) => typeof t === 'string') : [];

    console.log(`[Meeting Feedback] Received feedback for session ${sessionId} from user ${effectiveUserId}:`, {
      rating: ratingNum,
      feedback: feedbackText,
      tags: tagList,
    });

    if (!sessionId || !effectiveUserId) {
      return NextResponse.json(
        { error: 'A valid sessionId and authenticated user are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'The feedback user could not be found.' },
        { status: 401 }
      );
    }

      // 1. Fetch live session details to get course and lead instructor
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

      if (!liveSession) {
        return NextResponse.json(
          { error: 'The live session could not be found.' },
          { status: 404 }
        );
      }

      const instructorId = liveSession.liveCourse.leadInstructorId || null;
      const liveCourseId = liveSession.liveCourse.id;

      // 2. Save / Update in the InstructorReview table
      const savedReview = await prisma.instructorReview.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: effectiveUserId,
            },
          },
          update: {
            instructorId,
            liveCourseId,
            rating: ratingNum,
            feedback: feedbackText,
            tags: tagList,
            isAnonymous: Boolean(isAnonymous),
            status: 'PUBLISHED',
          },
          create: {
            studentId: effectiveUserId,
            instructorId,
            sessionId,
            liveCourseId,
            rating: ratingNum,
            feedback: feedbackText,
            tags: tagList,
            isAnonymous: Boolean(isAnonymous),
            status: 'PUBLISHED',
          },
        });

      // 3. Update or create student attendance with feedback notes and exit timestamp
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

      // 4. Notify instructor about the new student review
      if (instructorId) {
        try {
          const studentName = isAnonymous ? 'A student (Anonymous)' : (session?.name || 'A student');
          await prisma.notification.create({
            data: {
              recipientId: instructorId,
              actorId: effectiveUserId,
              category: 'LIVE_SESSION',
              type: 'STUDENT_FEEDBACK_RECEIVED',
              priority: 'NORMAL',
              title: `New Student Review: ${ratingNum}/5 Stars`,
              message: `${studentName} left a ${ratingNum}/5 star review for "${liveSession?.title || 'Live Session'}".`,
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
                sessionTitle: liveSession?.title,
                courseTitle: liveSession?.liveCourse?.title,
                reviewId: savedReview?.id,
              }),
            },
          });
        } catch (notifErr) {
          console.warn('[Meeting Feedback] Notification creation skipped or failed:', notifErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback submitted and review saved successfully.',
        data: {
          reviewId: savedReview?.id,
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const instructorId = searchParams.get('instructorId');
    const liveCourseId = searchParams.get('liveCourseId');

    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (instructorId) where.instructorId = instructorId;
    if (liveCourseId) where.liveCourseId = liveCourseId;

    const reviews = await prisma.instructorReview.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            sessionNumber: true,
          },
        },
        liveCourse: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 5.0;

    return NextResponse.json({
      success: true,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        feedback: r.feedback,
        tags: r.tags,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt,
        student: r.isAnonymous ? { name: 'Anonymous Student', avatar: null } : r.student,
        sessionTitle: r.session?.title,
        sessionNumber: r.session?.sessionNumber,
        courseTitle: r.liveCourse?.title,
      })),
    });
  } catch (err: any) {
    console.error('[Meeting Feedback GET API Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

