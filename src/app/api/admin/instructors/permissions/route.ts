import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAllInstructorPermissions,
  adminReviewCourseCreationPermission
} from "@/lib/permissions/courseCreationPermission";
import {
  toggleInstructorPermission,
  getInstructorPermissions,
  InstructorPermissionKey
} from "@/lib/permissions/instructorPermissions";

/**
 * GET — Fetch all instructor permissions and pending requests for Admin
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const data = await getAllInstructorPermissions();

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/admin/instructors/permissions error:", err);
    return NextResponse.json({ error: "Failed to fetch instructor permissions" }, { status: 500 });
  }
}

/**
 * POST — Admin action to TOGGLE individual permissions, or APPROVE, REJECT, GRANT, REVOKE
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { instructorId, action, permissionKey, enabled, feedback } = body;

    if (!instructorId) {
      return NextResponse.json({ error: "instructorId is required." }, { status: 400 });
    }

    // Individual toggle action
    if (action === "TOGGLE_PERMISSION") {
      const validKeys: InstructorPermissionKey[] = [
        "COURSE_CREATE",
        "COURSE_EDIT",
        "LIVE_CLASS_CREATE",
        "LIVE_CLASS_EDIT",
        "LIVE_CLASS_RESCHEDULE"
      ];

      if (!permissionKey || !validKeys.includes(permissionKey)) {
        return NextResponse.json(
          { error: `Invalid permissionKey. Must be one of: ${validKeys.join(", ")}` },
          { status: 400 }
        );
      }

      const result = await toggleInstructorPermission(
        session.id,
        instructorId,
        permissionKey as InstructorPermissionKey,
        Boolean(enabled)
      );

      return NextResponse.json({
        success: true,
        status: result.permission.status,
        message: result.message,
        permission: result.permission
      });
    }

    // Bulk status actions (APPROVE, REJECT, GRANT, REVOKE)
    const validActions = ["APPROVE", "REJECT", "GRANT", "REVOKE"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be TOGGLE_PERMISSION or one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await adminReviewCourseCreationPermission(
      session.id,
      instructorId,
      action as "APPROVE" | "REJECT" | "GRANT" | "REVOKE",
      feedback
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "ACTION_FAILED", message: result.message },
        { status: 400 }
      );
    }

    const fullPermissions = await getInstructorPermissions(instructorId);

    return NextResponse.json({
      ...result,
      permission: fullPermissions
    });
  } catch (err: any) {
    console.error("POST /api/admin/instructors/permissions error:", err);
    return NextResponse.json(
      { error: "Failed to process permission action", details: err?.message },
      { status: 500 }
    );
  }
}

