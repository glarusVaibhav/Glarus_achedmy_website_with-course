import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

/**
 * DELETE /api/student/notifications/[id]
 * Deletes or archives a notification owned by the authenticated student.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await notificationService.deleteNotification(session.id, id);

    if (!deleted) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/student/notifications/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete notification", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/student/notifications/[id]
 * Updates read status or archive status for a specific notification.
 */
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
    const body = await request.json().catch(() => ({}));

    if (typeof body.isRead === "boolean") {
      if (body.isRead) {
        await notificationService.markAsRead(session.id, id);
      } else {
        await notificationService.setReadStatus(session.id, id, false);
      }
    }

    if (typeof body.isArchived === "boolean") {
      await notificationService.archiveNotification(session.id, id, body.isArchived);
    }

    const unreadCount = await notificationService.getUnreadCount(session.id);

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (err: any) {
    console.error("PATCH /api/student/notifications/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update notification", details: err?.message },
      { status: 500 }
    );
  }
}
