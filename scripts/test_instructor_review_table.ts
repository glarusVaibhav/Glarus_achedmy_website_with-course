import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runReviewTableTest() {
  console.log('--- STARTING INSTRUCTOR REVIEW TABLE TEST ---');

  try {
    // 1. Find or create a student user
    let student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
    if (!student) {
      student = await prisma.user.create({
        data: {
          name: 'Demo Review Student',
          email: `demo_student_${Date.now()}@glarusacademy.com`,
          role: 'STUDENT',
        },
      });
    }

    // 2. Find or create an instructor user
    let instructor = await prisma.user.findFirst({
      where: { role: 'INSTRUCTOR' },
    });
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          name: 'Demo Lead Instructor',
          email: `demo_instructor_${Date.now()}@glarusacademy.com`,
          role: 'INSTRUCTOR',
        },
      });
    }

    // 3. Find a live session
    let liveSession = await prisma.liveSession.findFirst({
      include: { liveCourse: true },
    });

    console.log(`[Test] Student: ${student.name} (${student.id})`);
    console.log(`[Test] Instructor: ${instructor.name} (${instructor.id})`);
    if (liveSession) {
      console.log(`[Test] Live Session: "${liveSession.title}" (${liveSession.id})`);
    }

    // 4. Create or Upsert a review in the brand new InstructorReview table
    const reviewData = {
      studentId: student.id,
      instructorId: instructor.id,
      sessionId: liveSession?.id || null,
      liveCourseId: liveSession?.liveCourseId || null,
      rating: 5,
      feedback: 'The instructor explained the concepts clearly, and the live examples made the session easy to follow.',
      tags: ['Clear Explanations', 'Engaging Demos', 'Interactive Q&A'],
      isAnonymous: false,
      status: 'PUBLISHED',
    };

    let review;
    if (liveSession?.id) {
      review = await prisma.instructorReview.upsert({
        where: {
          sessionId_studentId: {
            sessionId: liveSession.id,
            studentId: student.id,
          },
        },
        update: {
          rating: 5,
          feedback: reviewData.feedback,
          tags: reviewData.tags,
        },
        create: reviewData,
      });
    } else {
      review = await prisma.instructorReview.create({
        data: reviewData,
      });
    }

    console.log('[Test] Successfully saved review to InstructorReview table:', {
      id: review.id,
      rating: review.rating,
      feedback: review.feedback,
      tags: review.tags,
      studentId: review.studentId,
      instructorId: review.instructorId,
      createdAt: review.createdAt,
    });

    // 5. Query review back with relational joins
    const fetchedReview = await prisma.instructorReview.findUnique({
      where: { id: review.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        instructor: { select: { id: true, name: true, email: true } },
        session: { select: { id: true, title: true } },
        liveCourse: { select: { id: true, title: true } },
      },
    });

    console.log('[Test] Fetched review with joins:', {
      id: fetchedReview?.id,
      studentName: fetchedReview?.student.name,
      instructorName: fetchedReview?.instructor?.name,
      sessionTitle: fetchedReview?.session?.title || 'Standalone Review',
      rating: fetchedReview?.rating,
      tags: fetchedReview?.tags,
    });

    // 6. Test aggregation
    const reviewStats = await prisma.instructorReview.aggregate({
      where: { instructorId: instructor.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    console.log('[Test] Aggregated stats for instructor:', {
      totalReviews: reviewStats._count.id,
      averageRating: reviewStats._avg.rating,
    });

    console.log('--- ALL INSTRUCTOR REVIEW TABLE CHECKS PASSED WITH 100% SUCCESS ---');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runReviewTableTest();
