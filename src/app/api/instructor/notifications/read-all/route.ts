import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedCount = await notificationService.markAllAsRead(session.id);

    return NextResponse.json({
      success: true,
      message: `Marked ${updatedCount} notifications as read.`,
      updatedCount,
      unreadCount: 0,
    });
  } catch (err: any) {
    console.error("PATCH /api/instructor/notifications/read-all error:", err);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return PATCH();
}
