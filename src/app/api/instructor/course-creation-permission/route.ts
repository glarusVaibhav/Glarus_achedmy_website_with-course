import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getInstructorCourseCreationStatus,
  requestCourseCreationPermission
} from "@/lib/permissions/courseCreationPermission";
import { getInstructorPermissions } from "@/lib/permissions/instructorPermissions";

/**
 * GET — Return the current instructor's full permissions status
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const isAdmin = session.role === "ADMIN";
    const fullPermissions = await getInstructorPermissions(session.id);
    const permission = await getInstructorCourseCreationStatus(session.id);

    const canCreateCourse = isAdmin ? true : Boolean(fullPermissions.canCreateCourse && permission.allowed);
    const effectiveStatus = isAdmin
      ? "APPROVED"
      : canCreateCourse
      ? "APPROVED"
      : permission.status === "APPROVED"
      ? "REVOKED"
      : permission.status;

    return NextResponse.json({
      status: effectiveStatus,
      canCreateCourse: canCreateCourse,
      canEditCourse: isAdmin ? true : fullPermissions.canEditCourse,
      canCreateLiveClass: isAdmin ? true : fullPermissions.canCreateLiveClass,
      canEditLiveClass: isAdmin ? true : fullPermissions.canEditLiveClass,
      canRescheduleLiveClass: isAdmin ? true : fullPermissions.canRescheduleLiveClass,
      permissions: {
        COURSE_CREATE: canCreateCourse,
        COURSE_EDIT: isAdmin ? true : fullPermissions.permissions.COURSE_EDIT,
        LIVE_CLASS_CREATE: isAdmin ? true : fullPermissions.permissions.LIVE_CLASS_CREATE,
        LIVE_CLASS_EDIT: isAdmin ? true : fullPermissions.permissions.LIVE_CLASS_EDIT,
        LIVE_CLASS_RESCHEDULE: isAdmin ? true : fullPermissions.permissions.LIVE_CLASS_RESCHEDULE
      },
      allowed: canCreateCourse,
      requestedAt: permission.requestedAt,
      reviewedAt: permission.reviewedAt,
      rejectionReason: permission.rejectionReason,
      notes: permission.notes,
      message: permission.message,
      isAdmin
    });
  } catch (err: any) {
    console.error("GET /api/instructor/course-creation-permission error:", err);
    return NextResponse.json({ error: "Failed to fetch permission status" }, { status: 500 });
  }
}

/**
 * POST — Instructor requests course creation permission from Admin
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "INSTRUCTOR") {
      if (session?.role === "ADMIN") {
        return NextResponse.json({
          success: true,
          status: "APPROVED",
          message: "Administrators already have full course creation privileges."
        });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const result = await requestCourseCreationPermission(session.id, notes);

    if (!result.success && result.status === "PENDING") {
      return NextResponse.json(
        {
          error: "REQUEST_ALREADY_PENDING",
          status: result.status,
          message: result.message
        },
        { status: 409 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: "REQUEST_FAILED",
          status: result.status,
          message: result.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.message,
      permission: result.permission
    });
  } catch (err: any) {
    console.error("POST /api/instructor/course-creation-permission error:", err);
    return NextResponse.json(
      { error: "Failed to submit permission request", details: err?.message },
      { status: 500 }
    );
  }
}
