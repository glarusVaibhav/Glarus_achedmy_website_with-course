import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const count = await notificationService.markAllAsRead(session.id);

    return NextResponse.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      markedCount: count,
      unreadCount: 0,
    });
  } catch (err: any) {
    console.error("POST /api/admin/notifications/read-all error:", err);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read", details: err?.message },
      { status: 500 }
    );
  }
}
