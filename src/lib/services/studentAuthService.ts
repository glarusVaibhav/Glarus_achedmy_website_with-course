import prisma from '@/lib/db';
import { getSession, UserSession } from '@/lib/auth';

export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Authenticates the request and verifies the student identity against the database.
 * Does NOT trust client-provided identities.
 */
export async function verifyStudentSession(): Promise<{ id: string; name: string; email: string; role: string }> {
  const session: UserSession | null = await getSession();

  if (!session || !session.id) {
    throw new AuthError('Authentication required. Please log in.', 401, 'UNAUTHENTICATED');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw new AuthError('User account not found.', 401, 'USER_NOT_FOUND');
  }

  if (user.status === 'BLOCKED') {
    throw new AuthError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_BLOCKED');
  }

  if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
    throw new AuthError('Access restricted to active students.', 403, 'FORBIDDEN_ROLE');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Object-level authorization: Verifies student is enrolled in a self-paced course.
 */
export async function requireCourseEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    throw new AuthError('Access denied. You are not enrolled in this course.', 403, 'NOT_ENROLLED');
  }

  return enrollment;
}

/**
 * Object-level authorization: Verifies student is enrolled in a live cohort.
 */
export async function requireLiveCourseEnrollment(userId: string, liveCourseId: string) {
  const enrollment = await prisma.liveCourseEnrollment.findUnique({
    where: {
      userId_liveCourseId: {
        userId,
        liveCourseId,
      },
    },
  });

  if (!enrollment || enrollment.status === 'DROPPED' || enrollment.status === 'CANCELLED') {
    throw new AuthError('Access denied. You are not enrolled in this live training cohort.', 403, 'NOT_ENROLLED_LIVE');
  }

  return enrollment;
}

/**
 * Object-level authorization: Verifies student is enrolled in the live course owning the session.
 */
export async function requireSessionEnrollment(userId: string, sessionId: string) {
  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: { liveCourse: true },
  });

  if (!session) {
    throw new AuthError('Live session not found.', 404, 'SESSION_NOT_FOUND');
  }

  const enrollment = await prisma.liveCourseEnrollment.findUnique({
    where: {
      userId_liveCourseId: {
        userId,
        liveCourseId: session.liveCourseId,
      },
    },
  });

  if (!enrollment || enrollment.status === 'DROPPED') {
    throw new AuthError('Access denied. You are not enrolled in the cohort for this live session.', 403, 'NOT_ENROLLED_SESSION');
  }

  return { session, enrollment };
}
