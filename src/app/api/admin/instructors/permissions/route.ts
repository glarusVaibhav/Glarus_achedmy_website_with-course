import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAllInstructorPermissions,
  adminReviewCourseCreationPermission
} from "@/lib/permissions/courseCreationPermission";

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
 * POST — Admin action to APPROVE, REJECT, GRANT, or REVOKE course creation permission
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { instructorId, action, feedback } = body;

    const validActions = ["APPROVE", "REJECT", "GRANT", "REVOKE"];
    if (!instructorId || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `instructorId and action (${validActions.join("/")}) are required.` },
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

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/admin/instructors/permissions error:", err);
    return NextResponse.json(
      { error: "Failed to process permission action", details: err?.message },
      { status: 500 }
    );
  }
}
