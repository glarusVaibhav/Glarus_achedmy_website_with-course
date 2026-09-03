import prisma from "@/lib/db";
import { notificationRuleEngine } from "./ruleEngine";
import {
  DomainEvent,
  NotificationCreationData,
  NotificationQueryFilters,
  FormattedNotificationResponse,
  PaginatedNotificationsResult,
} from "./types";
import { DOMAIN_EVENT_TYPES } from "./events";

export class NotificationService {
  /**
   * Creates a notification in PostgreSQL with idempotency (deduplicationKey).
   */
  public async createNotification(
    data: NotificationCreationData
  ): Promise<any | null> {
    try {
      if (data.deduplicationKey) {
        const existing = await prisma.notification.findUnique({
          where: { deduplicationKey: data.deduplicationKey },
        });
        if (existing) {
          return existing;
        }
      }

      // Verify recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: data.recipientId },
        select: { id: true, name: true, email: true },
      });

      if (!recipient) {
        console.warn(`[NotificationService] Recipient ${data.recipientId} does not exist. Skipping.`);
        return null;
      }

      const metadataString = data.metadata ? JSON.stringify(data.metadata) : null;

      const created = await prisma.notification.create({
        data: {
          recipientId: data.recipientId,
          actorId: data.actorId || null,
          category: data.category,
          type: data.type,
          priority: data.priority || "NORMAL",
          title: data.title,
          message: data.message,
          details: data.details || null,
          entityType: data.entityType || null,
          entityId: data.entityId || null,
          actionUrl: data.actionUrl || null,
          icon: data.icon || null,
          metadata: metadataString,
          deduplicationKey: data.deduplicationKey || null,
        },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      });

      // Hook for real-time WebSocket / SSE push
      this.sendRealtimeNotification(created);

      return created;
    } catch (err: any) {
      if (err?.code === "P2002") {
        // Unique constraint violation on deduplicationKey
        console.log(`[NotificationService] Duplicate event prevented by deduplicationKey: ${data.deduplicationKey}`);
        return await prisma.notification.findUnique({
          where: { deduplicationKey: data.deduplicationKey! },
        });
      }
      console.error("[NotificationService] Failed to create notification:", err);
      return null;
    }
  }

  /**
   * Processes a domain event through the rule engine and creates notifications.
   */
  public async processDomainEvent(event: DomainEvent): Promise<number> {
    try {
      const resolvedList = await notificationRuleEngine.evaluate(event);
      if (!resolvedList || resolvedList.length === 0) return 0;

      let createdCount = 0;
      for (const resolved of resolvedList) {
        const result = await this.createNotification(resolved);
        if (result) createdCount++;
      }

      return createdCount;
    } catch (err) {
      console.error(`[NotificationService] Failed to process domain event ${event.eventType}:`, err);
      return 0;
    }
  }

  /**
   * Fetches paginated, filtered notifications for a specific recipient.
   */
  public async getNotifications(
    filters: NotificationQueryFilters
  ): Promise<PaginatedNotificationsResult> {
    const {
      recipientId,
      isRead,
      isArchived = false,
      category,
      priority,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (Math.max(1, page) - 1) * limit;

    const where: any = {
      recipientId,
      isArchived,
    };

    if (typeof isRead === "boolean") {
      where.isRead = isRead;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ];
    }

    const [rawNotifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { recipientId, isRead: false, isArchived: false },
      }),
    ]);

    const formattedNotifications: FormattedNotificationResponse[] = rawNotifications.map(
      (item) => this.formatNotificationResponse(item)
    );

    const totalPages = Math.ceil(total / limit) || 1;
    const hasMore = page < totalPages;
    const nextCursor = hasMore ? (page + 1).toString() : undefined;

    return {
      notifications: formattedNotifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Get unread count for a recipient.
   */
  public async getUnreadCount(recipientId: string): Promise<number> {
    return await prisma.notification.count({
      where: { recipientId, isRead: false, isArchived: false },
    });
  }

  /**
   * Fetch single notification by ID with recipient ownership check (Anti-IDOR).
   */
  public async getNotificationById(
    recipientId: string,
    notificationId: string
  ): Promise<FormattedNotificationResponse | null> {
    const item = await prisma.notification.findFirst({
      where: { id: notificationId, recipientId },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!item) return null;
    return this.formatNotificationResponse(item);
  }

  /**
   * Mark a single notification as read.
   */
  public async markAsRead(
    recipientId: string,
    notificationId: string
  ): Promise<boolean> {
    const res = await prisma.notification.updateMany({
      where: { id: notificationId, recipientId },
      data: { isRead: true, readAt: new Date() },
    });
    return res.count > 0;
  }

  /**
   * Mark all unread notifications for a recipient as read in a single query.
   */
  public async markAllAsRead(recipientId: string): Promise<number> {
    const res = await prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return res.count;
  }

  /**
   * Toggle archive state for a notification.
   */
  public async archiveNotification(
    recipientId: string,
    notificationId: string,
    isArchived: boolean = true
  ): Promise<boolean> {
    const res = await prisma.notification.updateMany({
      where: { id: notificationId, recipientId },
      data: { isArchived },
    });
    return res.count > 0;
  }

  /**
   * Delete a notification.
   */
  public async deleteNotification(
    recipientId: string,
    notificationId: string
  ): Promise<boolean> {
    const res = await prisma.notification.deleteMany({
      where: { id: notificationId, recipientId },
    });
    return res.count > 0;
  }

  /**
   * Scheduled job to find upcoming live classes and emit reminders with idempotency.
   */
  public async runLiveSessionReminders(): Promise<{ checked: number; generated: number }> {
    const now = new Date();
    // Look ahead 70 minutes
    const futureWindow = new Date(now.getTime() + 70 * 60 * 1000);

    const upcomingSessions = await prisma.liveSession.findMany({
      where: {
        date: { gte: now, lte: futureWindow },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        liveCourse: true,
        assignments: {
          include: { instructor: true },
        },
      },
    });

    let generatedCount = 0;

    for (const session of upcomingSessions) {
      if (!session.date) continue;
      const sessionDate = new Date(session.date);
      const diffMinutes = Math.round((sessionDate.getTime() - now.getTime()) / (60 * 1000));

      const thresholds = [60, 20, 5];
      for (const threshold of thresholds) {
        // Window check: within 5 minutes of threshold
        if (Math.abs(diffMinutes - threshold) <= 3) {
          const instructorIds = new Set<string>();
          if (session.liveCourse?.leadInstructorId) {
            instructorIds.add(session.liveCourse.leadInstructorId);
          }
          session.assignments.forEach((a) => {
            if (a.instructorId) instructorIds.add(a.instructorId);
          });

          for (const instructorId of Array.from(instructorIds)) {
            const count = await this.processDomainEvent({
              eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_REMINDER,
              actorId: null,
              timestamp: new Date(),
              payload: {
                sessionId: session.id,
                sessionTitle: session.title,
                liveCourseId: session.liveCourseId,
                liveCourseTitle: session.liveCourse.title,
                instructorId,
                startsInMinutes: threshold,
                meetingUrl: session.meetingUrl || session.liveCourse.meetingUrl,
              },
            });
            generatedCount += count;
          }
        }
      }
    }

    return { checked: upcomingSessions.length, generated: generatedCount };
  }

  /**
   * Realtime notification hook (WebSockets / SSE abstraction).
   */
  private sendRealtimeNotification(notification: any): void {
    // In production, publish to Redis Pub/Sub, Pusher, or WebSocket connection map
    // E.g.: realtimeEventBus.publish(`user:${notification.recipientId}:notifications`, notification);
  }

  /**
   * Formats raw Prisma notification to standardized frontend payload.
   */
  private formatNotificationResponse(item: any): FormattedNotificationResponse {
    let parsedMetadata: any = null;
    if (item.metadata) {
      try {
        parsedMetadata = JSON.parse(item.metadata);
      } catch (e) {
        parsedMetadata = item.metadata;
      }
    }

    return {
      id: item.id,
      category: item.category,
      type: item.type,
      priority: item.priority,
      title: item.title,
      message: item.message,
      description: item.message, // For compatibility
      details: item.details,
      isRead: item.isRead,
      isUnread: !item.isRead,    // For compatibility
      isArchived: item.isArchived,
      readAt: item.readAt ? item.readAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      timeAgo: this.formatTimeAgo(item.createdAt),
      icon: item.icon || "bell",
      entity: item.entityType
        ? {
            type: item.entityType,
            id: item.entityId,
          }
        : null,
      actionUrl: item.actionUrl,
      link: item.actionUrl,      // For compatibility
      metadata: parsedMetadata,
      actor: item.actor
        ? {
            id: item.actor.id,
            name: item.actor.name,
            email: item.actor.email,
          }
        : null,
    };
  }

  /**
   * Calculates human-friendly relative time string.
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffSeconds < 60) {
      return "Just now";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "Yesterday";
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    }

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

export const notificationService = new NotificationService();
