import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getInstructorCourseCreationStatus,
  requestCourseCreationPermission
} from "@/lib/permissions/courseCreationPermission";

/**
 * GET — Return the current instructor's course creation permission status
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const permission = await getInstructorCourseCreationStatus(session.id);

    return NextResponse.json({
      status: permission.status,
      canCreateCourse: session.role === "ADMIN" ? true : permission.canCreateCourse,
      allowed: session.role === "ADMIN" ? true : permission.allowed,
      requestedAt: permission.requestedAt,
      reviewedAt: permission.reviewedAt,
      rejectionReason: permission.rejectionReason,
      notes: permission.notes,
      message: permission.message,
      isAdmin: session.role === "ADMIN"
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
