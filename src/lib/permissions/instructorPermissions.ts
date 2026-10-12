import prisma from "@/lib/db";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export type InstructorPermissionKey =
  | "COURSE_CREATE"
  | "COURSE_EDIT"
  | "LIVE_CLASS_CREATE"
  | "LIVE_CLASS_EDIT"
  | "LIVE_CLASS_RESCHEDULE";

export interface InstructorPermissionsState {
  status: "NOT_REQUESTED" | "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  canCreateCourse: boolean;
  canEditCourse: boolean;
  canCreateLiveClass: boolean;
  canEditLiveClass: boolean;
  canRescheduleLiveClass: boolean;
  permissions: {
    COURSE_CREATE: boolean;
    COURSE_EDIT: boolean;
    LIVE_CLASS_CREATE: boolean;
    LIVE_CLASS_EDIT: boolean;
    LIVE_CLASS_RESCHEDULE: boolean;
  };
  requestedAt?: Date | null;
  reviewedAt?: Date | null;
  reviewedBy?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  rejectionReason?: string | null;
  notes?: string | null;
}

export const PERMISSION_FIELD_MAP: Record<InstructorPermissionKey, keyof Pick<
  InstructorPermissionsState,
  "canCreateCourse" | "canEditCourse" | "canCreateLiveClass" | "canEditLiveClass" | "canRescheduleLiveClass"
>> = {
  COURSE_CREATE: "canCreateCourse",
  COURSE_EDIT: "canEditCourse",
  LIVE_CLASS_CREATE: "canCreateLiveClass",
  LIVE_CLASS_EDIT: "canEditLiveClass",
  LIVE_CLASS_RESCHEDULE: "canRescheduleLiveClass"
};

export const PERMISSION_LABEL_MAP: Record<InstructorPermissionKey, { title: string; desc: string }> = {
  COURSE_CREATE: {
    title: "Course Creation",
    desc: "Author self-paced & live curriculums"
  },
  COURSE_EDIT: {
    title: "Course Editing",
    desc: "Update lessons, syllabus, and video assets"
  },
  LIVE_CLASS_CREATE: {
    title: "Live Class Creation",
    desc: "Schedule interactive batch live sessions"
  },
  LIVE_CLASS_EDIT: {
    title: "Live Class Editing",
    desc: "Modify agenda, topics, timing, and Zoom credentials"
  },
  LIVE_CLASS_RESCHEDULE: {
    title: "Live Class Rescheduling",
    desc: "Adjust cohort dates and session time slots"
  }
};

/**
 * Check whether a user or session has a specific instructor permission.
 * - ADMIN role always returns true.
 * - Non-instructors return false.
 * - Instructors return true only if status === "APPROVED" and the specific permission flag is true.
 */
export async function hasPermission(
  userOrSession: { id: string; role?: string } | null | undefined,
  permission: InstructorPermissionKey
): Promise<boolean> {
  if (!userOrSession) return false;
  if (userOrSession.role === "ADMIN") return true;
  if (userOrSession.role !== "INSTRUCTOR") return false;

  try {
    const record = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId: userOrSession.id }
    });

    if (!record || record.status !== "APPROVED") {
      return false;
    }

    const fieldName = PERMISSION_FIELD_MAP[permission];
    return Boolean(record[fieldName]);
  } catch (err) {
    console.error(`[hasPermission] Error checking ${permission} for ${userOrSession.id}:`, err);
    return false;
  }
}

/**
 * Retrieve all granular permission states for an instructor.
 */
export async function getInstructorPermissions(
  instructorId: string
): Promise<InstructorPermissionsState> {
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
        status: "NOT_REQUESTED",
        canCreateCourse: false,
        canEditCourse: false,
        canCreateLiveClass: false,
        canEditLiveClass: false,
        canRescheduleLiveClass: false,
        permissions: {
          COURSE_CREATE: false,
          COURSE_EDIT: false,
          LIVE_CLASS_CREATE: false,
          LIVE_CLASS_EDIT: false,
          LIVE_CLASS_RESCHEDULE: false
        }
      };
    }

    const isApproved = record.status === "APPROVED";
    const canCreate = isApproved && Boolean(record.canCreateCourse);
    const canEdit = isApproved && Boolean(record.canEditCourse);
    const canCreateLive = isApproved && Boolean(record.canCreateLiveClass);
    const canEditLive = isApproved && Boolean(record.canEditLiveClass);
    const canReschedLive = isApproved && Boolean(record.canRescheduleLiveClass);

    const effectiveStatus: "NOT_REQUESTED" | "PENDING" | "APPROVED" | "REJECTED" | "REVOKED" =
      canCreate
        ? "APPROVED"
        : (record.status === "APPROVED" && !record.canCreateCourse)
        ? "REVOKED"
        : (record.status as any);

    return {
      status: effectiveStatus,
      canCreateCourse: canCreate,
      canEditCourse: canEdit,
      canCreateLiveClass: canCreateLive,
      canEditLiveClass: canEditLive,
      canRescheduleLiveClass: canReschedLive,
      permissions: {
        COURSE_CREATE: canCreate,
        COURSE_EDIT: canEdit,
        LIVE_CLASS_CREATE: canCreateLive,
        LIVE_CLASS_EDIT: canEditLive,
        LIVE_CLASS_RESCHEDULE: canReschedLive
      },
      requestedAt: record.requestedAt,
      reviewedAt: record.reviewedAt,
      reviewedBy: record.reviewedBy,
      rejectionReason: record.rejectionReason,
      notes: record.notes
    };
  } catch (err) {
    console.error("[getInstructorPermissions] Error:", err);
    return {
      status: "NOT_REQUESTED",
      canCreateCourse: false,
      canEditCourse: false,
      canCreateLiveClass: false,
      canEditLiveClass: false,
      canRescheduleLiveClass: false,
      permissions: {
        COURSE_CREATE: false,
        COURSE_EDIT: false,
        LIVE_CLASS_CREATE: false,
        LIVE_CLASS_EDIT: false,
        LIVE_CLASS_RESCHEDULE: false
      }
    };
  }
}

/**
 * Update a single permission toggle for an instructor by an Admin.
 */
export async function toggleInstructorPermission(
  adminId: string,
  instructorId: string,
  permissionKey: InstructorPermissionKey,
  enabled: boolean
): Promise<{ success: boolean; message: string; permission: InstructorPermissionsState }> {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, role: true }
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new Error("Unauthorized. Admin role required.");
    }

    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!instructor) {
      throw new Error("Instructor not found.");
    }

    const existing = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId }
    });

    const fieldName = PERMISSION_FIELD_MAP[permissionKey];
    const permissionLabel = PERMISSION_LABEL_MAP[permissionKey]?.title || permissionKey;

    let history: any[] = [];
    if (existing?.requestHistory && Array.isArray(existing.requestHistory)) {
      history = [...existing.requestHistory];
    }

    const now = new Date();
    history.push({
      action: "PERMISSION_TOGGLED",
      permissionKey,
      enabled,
      adminId,
      adminName: admin.name,
      timestamp: now.toISOString(),
      previousValue: existing ? Boolean(existing[fieldName]) : false
    });

    // If existing record was NOT_REQUESTED, REJECTED, PENDING, or REVOKED, enabling a permission approves it
    let currentStatus = existing?.status || "NOT_REQUESTED";
    if (enabled) {
      if (currentStatus === "NOT_REQUESTED" || currentStatus === "REJECTED" || currentStatus === "PENDING" || currentStatus === "REVOKED") {
        currentStatus = "APPROVED";
      }
    } else {
      if (permissionKey === "COURSE_CREATE") {
        currentStatus = "REVOKED";
      }
    }

    const updateData: any = {
      [fieldName]: enabled,
      status: currentStatus,
      reviewedAt: now,
      reviewedById: adminId,
      requestHistory: history
    };

    const updated = await prisma.instructorCoursePermission.upsert({
      where: { instructorId },
      create: {
        instructorId,
        status: currentStatus,
        canCreateCourse: permissionKey === "COURSE_CREATE" ? enabled : false,
        canEditCourse: permissionKey === "COURSE_EDIT" ? enabled : false,
        canCreateLiveClass: permissionKey === "LIVE_CLASS_CREATE" ? enabled : false,
        canEditLiveClass: permissionKey === "LIVE_CLASS_EDIT" ? enabled : false,
        canRescheduleLiveClass: permissionKey === "LIVE_CLASS_RESCHEDULE" ? enabled : false,
        reviewedAt: now,
        reviewedById: adminId,
        requestHistory: history
      },
      update: updateData
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: "INSTRUCTOR_PERMISSION_TOGGLED",
          details: `Admin ${admin.name} set "${permissionLabel}" to ${enabled ? "ENABLED" : "DISABLED"} for instructor ${instructor.name} (${instructor.email}).`
        }
      });
    } catch (auditErr) {
      console.warn("[toggleInstructorPermission] Audit log notice:", auditErr);
    }

    // Domain event
    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_APPROVED,
      actorId: adminId,
      payload: {
        instructorId,
        permissionKey,
        enabled,
        adminId,
        adminName: admin.name
      }
    });

    const fullPermissions = await getInstructorPermissions(instructorId);

    return {
      success: true,
      message: `${permissionLabel} is now ${enabled ? "ENABLED" : "DISABLED"} for ${instructor.name}.`,
      permission: fullPermissions
    };
  } catch (err: any) {
    console.error("[toggleInstructorPermission] Error:", err);
    throw err;
  }
}
