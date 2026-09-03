import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await notificationService.getUnreadCount(session.id);
    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    console.error("GET /api/instructor/notifications/unread-count error:", err);
    return NextResponse.json(
      { error: "Failed to get unread count", details: err?.message },
      { status: 500 }
    );
  }
}
