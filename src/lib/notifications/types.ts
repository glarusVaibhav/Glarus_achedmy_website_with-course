import { NotificationCategory, NotificationPriority, NotificationType } from "@prisma/client";

export type { NotificationCategory, NotificationPriority, NotificationType };

export interface DomainEvent<T = any> {
  eventType: string;
  payload: T;
  actorId?: string | null;
  timestamp: Date;
  eventId?: string;
}

export interface NotificationCreationData {
  recipientId: string;
  actorId?: string | null;
  category: NotificationCategory;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  icon?: string | null;
  metadata?: Record<string, any> | null;
  deduplicationKey?: string | null;
}

export interface ResolvedNotification {
  recipientId: string;
  actorId?: string | null;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  icon?: string | null;
  metadata?: Record<string, any> | null;
  deduplicationKey?: string | null;
}

export interface NotificationRule<T = any> {
  eventType: string;
  resolve: (event: DomainEvent<T>) => Promise<ResolvedNotification[] | ResolvedNotification | null>;
}

export interface NotificationQueryFilters {
  recipientId: string;
  isRead?: boolean;
  isArchived?: boolean;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  search?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface FormattedNotificationResponse {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  description: string; // Alias for frontend compatibility
  details?: string | null;
  isRead: boolean;
  isUnread: boolean;   // Alias for frontend compatibility
  isArchived: boolean;
  readAt?: string | null;
  createdAt: string;
  timeAgo: string;
  icon: string;
  entity?: {
    type: string | null;
    id: string | null;
  } | null;
  actionUrl?: string | null;
  link?: string | null; // Alias for frontend compatibility
  metadata?: Record<string, any> | null;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaginatedNotificationsResult {
  notifications: FormattedNotificationResponse[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
}
