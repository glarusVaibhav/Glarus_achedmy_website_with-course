import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notificationService } from "@/lib/notifications/notificationService";
import { NotificationCategory, NotificationPriority } from "@/lib/notifications/types";

/**
 * GET /api/student/notifications
 * Anti-IDOR: Always binds to session.id.
 * Query Parameters:
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 *  - unread: boolean ("true" | "false")
 *  - category: LIVE_SESSION | RECORDING | ASSIGNMENT | COURSE | CERTIFICATE | SYSTEM | etc.
 *  - priority: URGENT | HIGH | NORMAL | LOW
 *  - search: string (matches title and message)
 *  - archived: boolean ("true" | "false")
 */
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

    // Map frontend short categories if passed
    let mappedCategory = categoryParam;
    if (categoryParam === "LIVE") mappedCategory = "LIVE_SESSION";

    const result = await notificationService.getNotifications({
      recipientId: session.id,
      isRead,
      isArchived,
      category: mappedCategory as NotificationCategory | undefined,
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
    console.error("GET /api/student/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch student notifications", details: err?.message },
      { status: 500 }
    );
  }
}
