/**
 * Centralized Video Entitlement & Anti-IDOR Authorization — Glarus Academy
 * 
 * Verifies server-side database relationships before granting stream access or signed tokens.
 * NEVER trusts client-supplied course or lecture IDs.
 */

import prisma from "@/lib/db";
import { calculateRecordingAvailability } from "@/lib/recordingAvailability";

export interface EntitlementResult {
  allowed: boolean;
  reason?: string;
  statusCode?: number;
  videoAsset?: any;
  lecture?: any;
  course?: any;
  session?: any;
}

/**
 * Checks if a user has permission to play/stream a VideoAsset.
 */
export async function canAccessVideoAsset(
  userId: string,
  userRole: string = "STUDENT",
  videoAssetId: string
): Promise<EntitlementResult> {
  const videoAsset = await prisma.videoAsset.findUnique({
    where: { id: videoAssetId },
    include: {
      lecture: {
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!videoAsset) {
    return {
      allowed: false,
      reason: "Video asset not found.",
      statusCode: 404,
    };
  }

  // Administrators always have full access
  if (userRole === "ADMIN") {
    return { allowed: true, videoAsset, lecture: videoAsset.lecture, course: videoAsset.lecture?.module?.course };
  }

  const course = videoAsset.lecture?.module?.course;
  const courseId = course?.id || videoAsset.courseId;

  // Instructors can access videos for courses they own or are assigned to
  if (userRole === "INSTRUCTOR") {
    if (course && course.instructorId === userId) {
      return { allowed: true, videoAsset, lecture: videoAsset.lecture, course };
    }
    // Check if the instructor created the video asset
    if (videoAsset.uploadedById === userId) {
      return { allowed: true, videoAsset, lecture: videoAsset.lecture, course };
    }
    return {
      allowed: false,
      reason: "Access denied. You do not have permission to manage this course's video materials.",
      statusCode: 403,
    };
  }

  // Student verification
  if (userRole === "STUDENT") {
    if (!courseId) {
      // Unassigned video asset
      return {
        allowed: false,
        reason: "Access denied: course not associated.",
        statusCode: 403,
      };
    }

    // 1. Check for active enrollment
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (isEnrolled) {
      return { allowed: true, videoAsset, lecture: videoAsset.lecture, course };
    }

    // 2. Check for completed purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
        paymentStatus: "COMPLETED",
      },
    });

    if (purchase) {
      return { allowed: true, videoAsset, lecture: videoAsset.lecture, course };
    }

    return {
      allowed: false,
      reason: "Course enrollment or purchase required to access this video.",
      statusCode: 403,
    };
  }

  return {
    allowed: false,
    reason: "Unauthorized access.",
    statusCode: 401,
  };
}

/**
 * Checks if a user has permission to play/stream a Live Session Recording.
 */
export async function canAccessSessionRecording(
  userId: string,
  userRole: string = "STUDENT",
  sessionId: string
): Promise<EntitlementResult> {
  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: {
      liveCourse: {
        include: {
          leadInstructor: true,
        },
      },
    },
  });

  if (!session) {
    return {
      allowed: false,
      reason: "Live session not found.",
      statusCode: 404,
    };
  }

  if (userRole === "ADMIN") {
    return { allowed: true, session };
  }

  if (userRole === "INSTRUCTOR") {
    if (session.liveCourse?.leadInstructorId === userId) {
      return { allowed: true, session };
    }
    // Check session assignments
    const assignment = await prisma.sessionAssignment.findFirst({
      where: {
        sessionId,
        instructorId: userId,
      },
    });
    if (assignment) {
      return { allowed: true, session };
    }
    return {
      allowed: false,
      reason: "Access denied. You are not the assigned instructor for this live session.",
      statusCode: 403,
    };
  }

  if (userRole === "STUDENT") {
    // 1. Check active live course enrollment
    const enrollment = await prisma.liveCourseEnrollment.findUnique({
      where: {
        userId_liveCourseId: {
          userId,
          liveCourseId: session.liveCourseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return {
        allowed: false,
        reason: "You are not enrolled in this live training cohort.",
        statusCode: 403,
      };
    }

    // 2. Check 30-day availability window
    const availability = calculateRecordingAvailability(session.date || new Date());
    if (availability.isExpired) {
      return {
        allowed: false,
        reason: `Access to this recording expired on ${availability.formattedExpiresAt}.`,
        statusCode: 403,
      };
    }

    return { allowed: true, session };
  }

  return {
    allowed: false,
    reason: "Unauthorized access.",
    statusCode: 401,
  };
}
