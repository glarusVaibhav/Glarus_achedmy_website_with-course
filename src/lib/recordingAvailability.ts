/**
 * Recording Availability & 30-Day Expiration Utility
 * 
 * Core Rule: Every recorded live training session is available to students for
 * exactly 30 days after the original live class/session date (completedAt).
 */

export interface RecordingAvailability {
  classDate: Date;
  expiresAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  state: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  formattedClassDate: string;
  formattedExpiresAt: string;
  badgeLabel: string;
  statusMessage: string;
  warningLevel: "normal" | "amber" | "urgent" | "expired";
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export function calculateRecordingAvailability(
  completedAtOrClassDate: string | Date,
  referenceDate?: Date
): RecordingAvailability {
  const classDate = new Date(completedAtOrClassDate);

  // Safe fallback if date is invalid
  if (isNaN(classDate.getTime())) {
    const fallbackDate = new Date();
    const fallbackExpiry = new Date(fallbackDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      classDate: fallbackDate,
      expiresAt: fallbackExpiry,
      daysRemaining: 30,
      hoursRemaining: 720,
      state: "ACTIVE",
      formattedClassDate: "Live Session",
      formattedExpiresAt: "30 days after class",
      badgeLabel: "30 DAYS ACCESS",
      statusMessage: "Available for 30 days from class date",
      warningLevel: "normal",
      isExpired: false,
      isExpiringSoon: false,
    };
  }

  // 30 days after the original class date
  const expiresAt = new Date(classDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = referenceDate || new Date();

  const diffMs = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

  const isExpired = diffMs <= 0 || diffDays <= 0;
  const isExpiringSoon = !isExpired && diffDays <= 7;

  let state: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" = "ACTIVE";
  let warningLevel: "normal" | "amber" | "urgent" | "expired" = "normal";

  if (isExpired) {
    state = "EXPIRED";
    warningLevel = "expired";
  } else if (diffDays <= 2) {
    state = "EXPIRING_SOON";
    warningLevel = "urgent";
  } else if (diffDays <= 7) {
    state = "EXPIRING_SOON";
    warningLevel = "amber";
  }

  const formattedClassDate = classDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedExpiresAt = expiresAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let badgeLabel = "";
  let statusMessage = "";

  if (isExpired) {
    badgeLabel = "RECORDING EXPIRED";
    statusMessage = `Recording expired on ${formattedExpiresAt}`;
  } else if (diffDays === 1) {
    badgeLabel = "EXPIRES TOMORROW";
    statusMessage = `Expires tomorrow · Available until ${formattedExpiresAt}`;
  } else if (diffDays <= 7) {
    badgeLabel = `EXPIRES IN ${diffDays} DAYS`;
    statusMessage = `Expires in ${diffDays} days · Available until ${formattedExpiresAt}`;
  } else {
    badgeLabel = `${diffDays} DAYS REMAINING`;
    statusMessage = `Available until ${formattedExpiresAt} (30 days from class date)`;
  }

  return {
    classDate,
    expiresAt,
    daysRemaining: isExpired ? 0 : diffDays,
    hoursRemaining: isExpired ? 0 : diffHours,
    state,
    formattedClassDate,
    formattedExpiresAt,
    badgeLabel,
    statusMessage,
    warningLevel,
    isExpired,
    isExpiringSoon,
  };
}
