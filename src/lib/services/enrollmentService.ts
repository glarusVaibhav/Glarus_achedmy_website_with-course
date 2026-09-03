import prisma from '@/lib/db';

export class EnrollmentService {
  /**
   * Enrolls a student in a self-paced course (Idempotent).
   */
  static async enrollSelfPaced(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    return await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId,
        progress: 0,
      },
    });
  }

  /**
   * Enrolls a student in a live cohort program (Idempotent).
   */
  static async enrollLiveCourse(userId: string, liveCourseId: string, batchName = 'Main Cohort') {
    const liveCourse = await prisma.liveCourse.findUnique({
      where: { id: liveCourseId },
    });

    if (!liveCourse) {
      throw new Error(`Live Course with ID ${liveCourseId} not found`);
    }

    const existing = await prisma.liveCourseEnrollment.findUnique({
      where: {
        userId_liveCourseId: {
          userId,
          liveCourseId,
        },
      },
    });

    if (existing) {
      if (existing.status !== 'ACTIVE') {
        return await prisma.liveCourseEnrollment.update({
          where: { id: existing.id },
          data: { status: 'ACTIVE' },
        });
      }
      return existing;
    }

    const enrollment = await prisma.liveCourseEnrollment.create({
      data: {
        userId,
        liveCourseId,
        batchName,
        status: 'ACTIVE',
        progress: 0,
      },
    });

    // Increment enrolled count on LiveCourse
    await prisma.liveCourse.update({
      where: { id: liveCourseId },
      data: { enrolledCount: { increment: 1 } },
    }).catch(() => {});

    return enrollment;
  }

  /**
   * Checks if student is enrolled in a specific self-paced or live course.
   */
  static async isStudentEnrolled(userId: string, itemId: string, isLive = false): Promise<boolean> {
    if (isLive) {
      const en = await prisma.liveCourseEnrollment.findUnique({
        where: { userId_liveCourseId: { userId, liveCourseId: itemId } },
      });
      return Boolean(en && en.status === 'ACTIVE');
    }

    const en = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: itemId } },
    });
    return Boolean(en);
  }
}
