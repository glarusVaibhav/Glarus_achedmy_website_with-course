import prisma from "@/lib/db";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export type CourseCreationPermissionStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVOKED";

export interface PermissionCheckResult {
  allowed: boolean;
  status: CourseCreationPermissionStatus;
  canCreateCourse: boolean;
  message?: string;
  requestedAt?: Date | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
}

/**
 * Retrieves the current course-creation permission record for an instructor.
 * Defaults to NOT_REQUESTED if no record exists yet in the database.
 */
export async function getInstructorCourseCreationStatus(
  instructorId: string
): Promise<PermissionCheckResult> {
  try {
    const record = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId },
      include: {
        reviewedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!record) {
      return {
        allowed: false,
        status: "NOT_REQUESTED",
        canCreateCourse: false,
        message: "You must request and receive Admin approval before creating courses."
      };
    }

    const isAllowed = record.status === "APPROVED" && Boolean(record.canCreateCourse);
    const effectiveStatus: CourseCreationPermissionStatus =
      isAllowed
        ? "APPROVED"
        : record.status === "APPROVED" && !record.canCreateCourse
        ? "REVOKED"
        : (record.status as CourseCreationPermissionStatus);

    return {
      allowed: isAllowed,
      status: effectiveStatus,
      canCreateCourse: isAllowed,
      requestedAt: record.requestedAt,
      reviewedAt: record.reviewedAt,
      rejectionReason: record.rejectionReason,
      notes: record.notes,
      message: isAllowed
        ? "Course creation permission is active."
        : effectiveStatus === "PENDING"
        ? "Your permission request is waiting for Admin approval."
        : effectiveStatus === "REJECTED"
        ? record.rejectionReason || "Your permission request was not approved."
        : effectiveStatus === "REVOKED"
        ? "Course creation permission is currently locked or revoked by administration."
        : "You must request and receive Admin approval before creating courses."
    };
  } catch (err) {
    console.error("[getInstructorCourseCreationStatus] Error:", err);
    return {
      allowed: false,
      status: "NOT_REQUESTED",
      canCreateCourse: false,
      message: "Unable to verify course creation permissions."
    };
  }
}

/**
 * Enforces course-creation permission check for backend API actions.
 */
export async function checkInstructorCourseCreationPermission(
  instructorId: string
): Promise<PermissionCheckResult> {
  return await getInstructorCourseCreationStatus(instructorId);
}

/**
 * Submits a permission request on behalf of an instructor.
 * Prevents duplicate PENDING requests and maintains an audit history.
 */
export async function requestCourseCreationPermission(
  instructorId: string,
  notes?: string
): Promise<{ success: boolean; status: CourseCreationPermissionStatus; message: string; permission?: any }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return { success: false, status: "NOT_REQUESTED", message: "User not found." };
    }

    // Check existing record
    const existing = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId }
    });

    if (existing) {
      if (existing.status === "PENDING") {
        return {
          success: false,
          status: "PENDING",
          message: "A permission request is already pending review by Platform Administration."
        };
      }
      if (existing.status === "APPROVED" && existing.canCreateCourse) {
        return {
          success: true,
          status: "APPROVED",
          message: "You already have course creation privileges enabled."
        };
      }
    }

    // Parse existing request history
    let history: any[] = [];
    if (existing?.requestHistory && Array.isArray(existing.requestHistory)) {
      history = [...existing.requestHistory];
    }

    const historyEntry = {
      action: "REQUESTED",
      timestamp: new Date().toISOString(),
      notes: notes || null,
      previousStatus: existing?.status || "NOT_REQUESTED"
    };
    history.push(historyEntry);

    const updated = await prisma.instructorCoursePermission.upsert({
      where: { instructorId },
      create: {
        instructorId,
        status: "PENDING",
        canCreateCourse: false,
        requestedAt: new Date(),
        notes: notes || null,
        rejectionReason: null,
        requestHistory: history
      },
      update: {
        status: "PENDING",
        canCreateCourse: false,
        requestedAt: new Date(),
        notes: notes || null,
        rejectionReason: null,
        requestHistory: history
      }
    });

    // Emit domain event to notify administrators
    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REQUESTED,
      actorId: instructorId,
      payload: {
        instructorId,
        instructorName: user.name,
        instructorEmail: user.email,
        notes: notes || null
      }
    });

    return {
      success: true,
      status: "PENDING",
      message: "Your course creation permission request has been submitted to Platform Administration.",
      permission: updated
    };
  } catch (err: any) {
    console.error("[requestCourseCreationPermission] Error:", err);
    return {
      success: false,
      status: "NOT_REQUESTED",
      message: err?.message || "Failed to submit course creation permission request."
    };
  }
}

/**
 * Admin action to Approve, Reject, Grant Directly, or Revoke course creation permission.
 */
export async function adminReviewCourseCreationPermission(
  adminId: string,
  instructorId: string,
  action: "APPROVE" | "REJECT" | "GRANT" | "REVOKE",
  feedback?: string
): Promise<{ success: boolean; status: CourseCreationPermissionStatus; message: string; permission?: any }> {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, role: true }
    });

    if (!admin || admin.role !== "ADMIN") {
      return { success: false, status: "NOT_REQUESTED", message: "Unauthorized. Admin role required." };
    }

    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!instructor) {
      return { success: false, status: "NOT_REQUESTED", message: "Instructor not found." };
    }

    const existing = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId }
    });

    let history: any[] = [];
    if (existing?.requestHistory && Array.isArray(existing.requestHistory)) {
      history = [...existing.requestHistory];
    }

    const now = new Date();
    let newStatus: CourseCreationPermissionStatus;
    let canCreate: boolean;
    let eventType: string;
    let auditAction: string;

    switch (action) {
      case "APPROVE":
        newStatus = "APPROVED";
        canCreate = true;
        eventType = DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_APPROVED;
        auditAction = "INSTRUCTOR_COURSE_PERMISSION_APPROVED";
        break;

      case "GRANT":
        newStatus = "APPROVED";
        canCreate = true;
        eventType = DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_APPROVED;
        auditAction = "INSTRUCTOR_COURSE_PERMISSION_GRANTED";
        break;

      case "REJECT":
        newStatus = "REJECTED";
        canCreate = false;
        eventType = DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REJECTED;
        auditAction = "INSTRUCTOR_COURSE_PERMISSION_REJECTED";
        break;

      case "REVOKE":
        newStatus = "REVOKED";
        canCreate = false;
        eventType = DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REVOKED;
        auditAction = "INSTRUCTOR_COURSE_PERMISSION_REVOKED";
        break;

      default:
        return { success: false, status: existing?.status || "NOT_REQUESTED", message: "Invalid action." };
    }

    history.push({
      action,
      adminId,
      adminName: admin.name,
      timestamp: now.toISOString(),
      feedback: feedback || null,
      previousStatus: existing?.status || "NOT_REQUESTED",
      newStatus
    });

    const updated = await prisma.instructorCoursePermission.upsert({
      where: { instructorId },
      create: {
        instructorId,
        status: newStatus,
        canCreateCourse: canCreate,
        canEditCourse: canCreate,
        canCreateLiveClass: canCreate,
        canEditLiveClass: canCreate,
        canRescheduleLiveClass: canCreate,
        reviewedAt: now,
        reviewedById: adminId,
        rejectionReason: action === "REJECT" ? (feedback || null) : null,
        requestHistory: history
      },
      update: {
        status: newStatus,
        canCreateCourse: canCreate,
        canEditCourse: canCreate,
        canCreateLiveClass: canCreate,
        canEditLiveClass: canCreate,
        canRescheduleLiveClass: canCreate,
        reviewedAt: now,
        reviewedById: adminId,
        rejectionReason: action === "REJECT" ? (feedback || null) : null,
        requestHistory: history
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: auditAction,
          details: `Admin ${admin.name} performed ${action} on instructor ${instructor.name} (${instructor.email}). Status set to ${newStatus}.${feedback ? ` Notes: ${feedback}` : ""}`
        }
      });
    } catch (auditErr) {
      console.warn("[adminReviewCourseCreationPermission] Audit log creation notice:", auditErr);
    }

    // Emit domain event to notify instructor
    await emitDomainEvent({
      eventType,
      actorId: adminId,
      payload: {
        instructorId,
        decision: action === "GRANT" ? "GRANTED" : action,
        feedback: feedback || null,
        adminId,
        adminName: admin.name
      }
    });

    const successMessage =
      action === "APPROVE"
        ? `Permission approved for ${instructor.name}. Course creation is now enabled.`
        : action === "GRANT"
        ? `Course creation access granted directly to ${instructor.name}.`
        : action === "REJECT"
        ? `Permission request rejected for ${instructor.name}.`
        : `Course creation permission revoked for ${instructor.name}. Existing courses remain active.`;

    return {
      success: true,
      status: newStatus,
      message: successMessage,
      permission: updated
    };
  } catch (err: any) {
    console.error("[adminReviewCourseCreationPermission] Error:", err);
    return {
      success: false,
      status: "NOT_REQUESTED",
      message: err?.message || "Failed to process permission review."
    };
  }
}

/**
 * Fetches all instructor permissions and stats for the Admin interface.
 */
export async function getAllInstructorPermissions() {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "INSTRUCTOR" },
          { instructorApproval: { isNot: null } },
          { courseCreationPermission: { isNot: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        instructorApproval: {
          select: {
            id: true,
            status: true,
            firstName: true,
            lastName: true,
            skills: true,
            areasOfExpertise: true
          }
        },
        courseCreationPermission: {
          include: {
            reviewedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        courses: {
          select: { id: true, title: true, status: true, isPublished: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const stats = {
      total: instructors.length,
      approved: instructors.filter(i => i.courseCreationPermission?.status === "APPROVED" && Boolean(i.courseCreationPermission?.canCreateCourse)).length,
      pending: instructors.filter(i => i.courseCreationPermission?.status === "PENDING").length,
      rejected: instructors.filter(i => i.courseCreationPermission?.status === "REJECTED").length,
      revoked: instructors.filter(i => i.courseCreationPermission?.status === "REVOKED" || (i.courseCreationPermission?.status === "APPROVED" && !i.courseCreationPermission?.canCreateCourse)).length,
      notRequested: instructors.filter(i => !i.courseCreationPermission || i.courseCreationPermission.status === "NOT_REQUESTED").length
    };

    return { instructors, stats };
  } catch (err) {
    console.error("[getAllInstructorPermissions] Error:", err);
    return { instructors: [], stats: { total: 0, approved: 0, pending: 0, rejected: 0, revoked: 0, notRequested: 0 } };
  }
}
