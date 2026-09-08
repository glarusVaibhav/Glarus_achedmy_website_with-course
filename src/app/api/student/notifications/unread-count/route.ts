import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

/**
 * GET /api/student/notifications/unread-count
 * Returns the unread notification count for the authenticated student.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(session.id);
    return NextResponse.json({ success: true, count, unreadCount: count });
  } catch (err: any) {
    console.error("GET /api/student/notifications/unread-count error:", err);
    return NextResponse.json(
      { error: "Failed to get unread count", details: err?.message },
      { status: 500 }
    );
  }
}
