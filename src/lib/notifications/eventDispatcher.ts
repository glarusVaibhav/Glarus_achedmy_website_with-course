import { DomainEvent } from "./types";
import { notificationService } from "./notificationService";

export async function emitDomainEvent<T = any>(
  event: Omit<DomainEvent<T>, "timestamp"> & { timestamp?: Date }
): Promise<void> {
  const fullEvent: DomainEvent<T> = {
    ...event,
    timestamp: event.timestamp || new Date(),
  };

  // Asynchronously process without blocking or risking domain transaction failure
  Promise.resolve()
    .then(async () => {
      try {
        await notificationService.processDomainEvent(fullEvent);
      } catch (err) {
        console.error(`[EventDispatcher] Failed to dispatch domain event ${fullEvent.eventType}:`, err);
      }
    })
    .catch((err) => {
      console.error("[EventDispatcher] Unhandled promise rejection:", err);
    });
}
