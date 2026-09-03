import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updated = await notificationService.markAsRead(session.id, id);

    if (!updated) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    const unreadCount = await notificationService.getUnreadCount(session.id);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      unreadCount,
    });
  } catch (err: any) {
    console.error("PATCH /api/instructor/notifications/[id]/read error:", err);
    return NextResponse.json(
      { error: "Failed to mark notification as read", details: err?.message },
      { status: 500 }
    );
  }
}
