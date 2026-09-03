import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const notification = await notificationService.getNotificationById(session.id, id);

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (err: any) {
    console.error("GET /api/instructor/notifications/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notification", details: err?.message },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({ success: true, message: "Notification deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/instructor/notifications/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete notification", details: err?.message },
      { status: 500 }
    );
  }
}
