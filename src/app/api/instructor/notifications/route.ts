import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";
import { NotificationCategory, NotificationPriority } from "@/lib/notifications/types";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const unreadParam = searchParams.get("unread");
    const categoryParam = searchParams.get("category");
    const priorityParam = searchParams.get("priority");
    const searchParam = searchParams.get("search");
    const archivedParam = searchParams.get("archived");

    const isRead = unreadParam === "true" ? false : unreadParam === "false" ? true : undefined;
    const isArchived = archivedParam === "true";

    const result = await notificationService.getNotifications({
      recipientId: session.id,
      isRead,
      isArchived,
      category: categoryParam as NotificationCategory | undefined,
      priority: priorityParam as NotificationPriority | undefined,
      search: searchParam || undefined,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 20 : Math.min(limit, 100),
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("GET /api/instructor/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: err?.message },
      { status: 500 }
    );
  }
}
