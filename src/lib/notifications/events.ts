import { DomainEvent } from "./types";

export const DOMAIN_EVENT_TYPES = {
  // Course Lifecycle Events
  COURSE_APPROVED: "COURSE_APPROVED",
  COURSE_REJECTED: "COURSE_REJECTED",
  COURSE_CHANGES_REQUESTED: "COURSE_CHANGES_REQUESTED",
  COURSE_SUBMITTED_FOR_REVIEW: "COURSE_SUBMITTED_FOR_REVIEW",
  COURSE_PUBLISHED: "COURSE_PUBLISHED",
  COURSE_UNPUBLISHED: "COURSE_UNPUBLISHED",
  COURSE_ASSIGNED: "COURSE_ASSIGNED",

  // Live Training & Session Events
  LIVE_COURSE_ASSIGNED: "LIVE_COURSE_ASSIGNED",
  LIVE_SESSION_ASSIGNED: "LIVE_SESSION_ASSIGNED",
  LIVE_SESSION_CREATED: "LIVE_SESSION_CREATED",
  LIVE_SESSION_UPDATED: "LIVE_SESSION_UPDATED",
  LIVE_SESSION_RESCHEDULED: "LIVE_SESSION_RESCHEDULED",
  LIVE_SESSION_CANCELLED: "LIVE_SESSION_CANCELLED",
  LIVE_SESSION_REMINDER: "LIVE_SESSION_REMINDER",
  PERMISSIONS_UPDATED: "PERMISSIONS_UPDATED",
  INSTRUCTOR_REASSIGNED: "INSTRUCTOR_REASSIGNED",

  // Student & Assignment Events
  STUDENT_ENROLLED: "STUDENT_ENROLLED",
  STUDENT_ENROLLMENT_CONFIRMED: "STUDENT_ENROLLMENT_CONFIRMED",
  ASSIGNMENT_SUBMITTED: "ASSIGNMENT_SUBMITTED",
  ASSIGNMENT_GRADED: "ASSIGNMENT_GRADED",
  ASSIGNMENT_CREATED: "ASSIGNMENT_CREATED",
  ASSIGNMENT_REVIEW_REQUIRED: "ASSIGNMENT_REVIEW_REQUIRED",
  ASSIGNMENT_RESUBMITTED: "ASSIGNMENT_RESUBMITTED",
  COURSE_MILESTONE: "COURSE_MILESTONE",
  CERTIFICATE_ISSUED: "CERTIFICATE_ISSUED",
  STUDENT_COMPLETED_COURSE: "STUDENT_COMPLETED_COURSE",
  STUDENT_FEEDBACK_RECEIVED: "STUDENT_FEEDBACK_RECEIVED",
  STUDENT_HELP_REQUESTED: "STUDENT_HELP_REQUESTED",
  STUDENT_ANNOUNCEMENT: "STUDENT_ANNOUNCEMENT",

  // Tasks & Admin Actions
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DEADLINE_CHANGED: "TASK_DEADLINE_CHANGED",
  TASK_APPROVED: "TASK_APPROVED",
  TASK_REJECTED: "TASK_REJECTED",
  TASK_CANCELLED: "TASK_CANCELLED",
  ADMIN_INSTRUCTION: "ADMIN_INSTRUCTION",

  // Course Creation & Edit Permission Events
  COURSE_CREATION_PERMISSION_REQUESTED: "COURSE_CREATION_PERMISSION_REQUESTED",
  COURSE_CREATION_PERMISSION_APPROVED: "COURSE_CREATION_PERMISSION_APPROVED",
  COURSE_CREATION_PERMISSION_REJECTED: "COURSE_CREATION_PERMISSION_REJECTED",
  COURSE_CREATION_PERMISSION_REVOKED: "COURSE_CREATION_PERMISSION_REVOKED",
  LIVE_SESSION_EDIT_REQUESTED: "LIVE_SESSION_EDIT_REQUESTED",

  // Instructor Verification Events
  VERIFICATION_SUBMITTED: "VERIFICATION_SUBMITTED",
  VERIFICATION_APPROVED: "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  VERIFICATION_CHANGES_REQUESTED: "VERIFICATION_CHANGES_REQUESTED",

  // Payments & Payouts
  PAYOUT_INITIATED: "PAYOUT_INITIATED",
  PAYOUT_COMPLETED: "PAYOUT_COMPLETED",
  PAYOUT_FAILED: "PAYOUT_FAILED",
  REVENUE_MILESTONE: "REVENUE_MILESTONE",

  // Mentorship Events
  MENTORSHIP_REQUESTED: "MENTORSHIP_REQUESTED",
  MENTORSHIP_SCHEDULED: "MENTORSHIP_SCHEDULED",
  MENTORSHIP_CANCELLED: "MENTORSHIP_CANCELLED",

  // System
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
  SYSTEM_MAINTENANCE: "SYSTEM_MAINTENANCE",
  SECURITY_ALERT: "SECURITY_ALERT"
} as const;

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[keyof typeof DOMAIN_EVENT_TYPES];

/* ── Specific Event Payload Interfaces ── */

export interface CourseApprovedPayload {
  courseId: string;
  courseTitle: string;
  instructorId: string;
  isPublished?: boolean;
  feedback?: string | null;
}

export interface CourseRejectedPayload {
  courseId: string;
  courseTitle: string;
  instructorId: string;
  feedback?: string | null;
}

export interface CourseChangesRequestedPayload {
  courseId: string;
  courseTitle: string;
  instructorId: string;
  feedback?: string | null;
}

export interface LiveCourseAssignedPayload {
  liveCourseId: string;
  liveCourseTitle: string;
  instructorId: string;
  assignedBy?: string | null;
  totalSessions?: number;
}

export interface LiveSessionAssignedPayload {
  sessionId: string;
  sessionTitle: string;
  liveCourseId: string;
  liveCourseTitle: string;
  instructorId: string;
  sessionNumber?: number;
  date?: string | Date;
  startTime?: string;
  assignedBy?: string | null;
}

export interface LiveSessionRescheduledPayload {
  sessionId: string;
  sessionTitle: string;
  liveCourseId: string;
  liveCourseTitle: string;
  oldDate?: string;
  newDate: string;
  oldStartTime?: string;
  newStartTime: string;
  reason: string;
  instructorIds: string[]; // Can affect multiple instructors
}

export interface PermissionsUpdatedPayload {
  assignmentId: string;
  sessionId?: string | null;
  liveCourseId?: string | null;
  targetTitle: string;
  instructorId: string;
  permissions: Record<string, boolean>;
}

export interface StudentEnrolledPayload {
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  enrolledAt?: Date;
}

export interface AssignmentSubmittedPayload {
  assignmentId: string;
  assignmentTitle: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
}

export interface TaskAssignedPayload {
  taskId: string;
  taskTitle: string;
  taskType?: string;
  priority?: "Urgent" | "High" | "Normal" | "Low";
  deadline?: string;
  instructorId: string;
  assignedBy?: string | null;
  description?: string;
}

export interface TaskStatusChangedPayload {
  taskId: string;
  taskTitle: string;
  newStatus: string;
  instructorId: string;
  feedback?: string | null;
}

export interface VerificationDecisionPayload {
  instructorId: string;
  instructorName?: string;
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  feedback?: string | null;
}

export interface PayoutCompletedPayload {
  payoutId: string;
  instructorId: string;
  amount: number | string;
  currency?: string;
  transactionId?: string;
}

export interface LiveSessionReminderPayload {
  sessionId: string;
  sessionTitle: string;
  liveCourseId: string;
  liveCourseTitle: string;
  instructorId?: string;
  studentIds?: string[];
  startsInMinutes: number;
  meetingUrl?: string | null;
}

export interface StudentEnrollmentConfirmationPayload {
  studentId: string;
  courseId: string;
  courseTitle: string;
  isLive?: boolean;
}

export interface AssignmentGradedPayload {
  studentId: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId?: string;
  courseTitle?: string;
  grade?: string | number;
  feedback?: string | null;
}

export interface AssignmentCreatedPayload {
  courseId: string;
  courseTitle: string;
  assignmentId: string;
  assignmentTitle: string;
  dueDate?: string | null;
}

export interface LiveSessionCreatedPayload {
  liveCourseId: string;
  liveCourseTitle: string;
  sessionId: string;
  sessionTitle: string;
  date?: string | Date;
  startTime?: string;
  meetingUrl?: string | null;
}

export interface LiveSessionCancelledPayload {
  liveCourseId: string;
  liveCourseTitle: string;
  sessionId: string;
  sessionTitle: string;
  reason?: string;
}

export interface CourseMilestonePayload {
  studentId: string;
  courseId: string;
  courseTitle: string;
  milestonePercent: number; // 25, 50, 75, 100
}

export interface CertificateAvailablePayload {
  studentId: string;
  courseId?: string;
  liveCourseId?: string;
  courseTitle: string;
  certificateId: string;
  credentialId?: string | null;
}

export interface StudentAnnouncementPayload {
  studentId?: string;
  courseId?: string;
  title: string;
  message: string;
  actionUrl?: string;
}

export interface CourseCreationPermissionRequestedPayload {
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  notes?: string | null;
}

export interface CourseCreationPermissionDecisionPayload {
  instructorId: string;
  decision: "APPROVED" | "REJECTED" | "GRANTED" | "REVOKED";
  feedback?: string | null;
  adminId?: string;
  adminName?: string;
}

export interface LiveSessionEditRequestedPayload {
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  sessionId: string;
  sessionCode?: string;
  sessionTitle?: string;
  courseId?: string;
  courseName?: string;
  notes?: string | null;
}

