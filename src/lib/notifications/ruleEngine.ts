import { DOMAIN_EVENT_TYPES } from "./events";
import {
  DomainEvent,
  NotificationRule,
  ResolvedNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "./types";
import {
  CourseApprovedPayload,
  CourseRejectedPayload,
  CourseChangesRequestedPayload,
  LiveCourseAssignedPayload,
  LiveSessionAssignedPayload,
  LiveSessionRescheduledPayload,
  PermissionsUpdatedPayload,
  StudentEnrolledPayload,
  AssignmentSubmittedPayload,
  TaskAssignedPayload,
  TaskStatusChangedPayload,
  VerificationDecisionPayload,
  PayoutCompletedPayload,
  LiveSessionReminderPayload,
} from "./events";

export class NotificationRuleEngine {
  private rules: Map<string, NotificationRule> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  public registerRule<T>(rule: NotificationRule<T>): void {
    this.rules.set(rule.eventType, rule);
  }

  public getRule(eventType: string): NotificationRule | undefined {
    return this.rules.get(eventType);
  }

  public async evaluate(event: DomainEvent): Promise<ResolvedNotification[]> {
    const rule = this.rules.get(event.eventType);
    if (!rule) {
      console.warn(`[NotificationEngine] No notification rule registered for event type: ${event.eventType}`);
      return [];
    }

    try {
      const result = await rule.resolve(event);
      if (!result) return [];
      return Array.isArray(result) ? result : [result];
    } catch (err) {
      console.error(`[NotificationEngine] Error evaluating rule for ${event.eventType}:`, err);
      return [];
    }
  }

  private registerDefaultRules(): void {
    // 1. COURSE_APPROVED
    this.registerRule<CourseApprovedPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_APPROVED,
      resolve: async (event) => {
        const { courseId, courseTitle, instructorId, isPublished, feedback } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "COURSE",
          type: "COURSE_APPROVED",
          priority: "HIGH",
          title: isPublished ? "Course Published & Live!" : `${courseTitle} Approved`,
          message: isPublished
            ? `Your course "${courseTitle}" has been officially approved by admin review and is now live on the public student catalog.`
            : `Your course "${courseTitle}" passed admin quality verification and is ready for publishing.`,
          details: feedback || "Your curriculum, videos, and project resources meet all platform standards.",
          entityType: "COURSE",
          entityId: courseId,
          actionUrl: `/instructor/courses`,
          icon: "book",
          metadata: { courseId, courseTitle, isPublished },
          deduplicationKey: `COURSE_APPROVED:${courseId}:${isPublished ? 'published' : 'approved'}`
        };
      }
    });

    // 2. COURSE_REJECTED
    this.registerRule<CourseRejectedPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_REJECTED,
      resolve: async (event) => {
        const { courseId, courseTitle, instructorId, feedback } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "COURSE",
          type: "COURSE_REJECTED",
          priority: "HIGH",
          title: `Course Submission Rejected: ${courseTitle}`,
          message: `Your course submission "${courseTitle}" was not approved by the review team.`,
          details: feedback || "Please review the quality checklist and resubmit.",
          entityType: "COURSE",
          entityId: courseId,
          actionUrl: `/instructor/courses`,
          icon: "book",
          metadata: { courseId, courseTitle, feedback },
          deduplicationKey: `COURSE_REJECTED:${courseId}:${Date.now()}`
        };
      }
    });

    // 3. COURSE_CHANGES_REQUESTED
    this.registerRule<CourseChangesRequestedPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CHANGES_REQUESTED,
      resolve: async (event) => {
        const { courseId, courseTitle, instructorId, feedback } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "COURSE",
          type: "COURSE_CHANGES_REQUESTED",
          priority: "NORMAL",
          title: `Changes Requested: ${courseTitle}`,
          message: `Admin review requested updates for "${courseTitle}".`,
          details: feedback || "Please apply the requested curriculum improvements and resubmit.",
          entityType: "COURSE",
          entityId: courseId,
          actionUrl: `/instructor/courses`,
          icon: "book",
          metadata: { courseId, courseTitle, feedback },
          deduplicationKey: `COURSE_CHANGES:${courseId}:${Date.now()}`
        };
      }
    });

    // 4. LIVE_COURSE_ASSIGNED
    this.registerRule<LiveCourseAssignedPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_COURSE_ASSIGNED,
      resolve: async (event) => {
        const { liveCourseId, liveCourseTitle, instructorId, totalSessions } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "LIVE_SESSION",
          type: "LIVE_COURSE_ASSIGNED",
          priority: "HIGH",
          title: `Lead Mentor: ${liveCourseTitle}`,
          message: `Admin appointed you as Lead Instructor for live cohort "${liveCourseTitle}" (${totalSessions || 0} sessions).`,
          details: "You can view the full timetable, curriculum, and learner roster in your Live Classes hub.",
          entityType: "LIVE_COURSE",
          entityId: liveCourseId,
          actionUrl: `/instructor/live-sessions`,
          icon: "radio",
          metadata: { liveCourseId, liveCourseTitle, totalSessions },
          deduplicationKey: `LIVE_COURSE_ASSIGNED:${liveCourseId}:${instructorId}`
        };
      }
    });

    // 5. LIVE_SESSION_ASSIGNED
    this.registerRule<LiveSessionAssignedPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_ASSIGNED,
      resolve: async (event) => {
        const { sessionId, sessionTitle, liveCourseId, liveCourseTitle, instructorId, sessionNumber, date, startTime } = event.payload;
        if (!instructorId) return null;

        const formattedTime = startTime ? ` at ${startTime}` : "";
        const formattedDate = date ? ` on ${new Date(date).toLocaleDateString()}` : "";

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "LIVE_SESSION",
          type: "LIVE_SESSION_ASSIGNED",
          priority: "HIGH",
          title: `Live Session Assigned: ${sessionTitle}`,
          message: `You were assigned to teach Session ${sessionNumber || ''}: "${sessionTitle}" (${liveCourseTitle})${formattedDate}${formattedTime}.`,
          details: "Please review the session agenda and prepare presentation materials in advance.",
          entityType: "LIVE_SESSION",
          entityId: sessionId,
          actionUrl: `/instructor/live-sessions`,
          icon: "radio",
          metadata: { sessionId, liveCourseId, sessionTitle, liveCourseTitle, sessionNumber },
          deduplicationKey: `LIVE_SESSION_ASSIGNED:${sessionId}:${instructorId}`
        };
      }
    });

    // 6. LIVE_SESSION_RESCHEDULED
    this.registerRule<LiveSessionRescheduledPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_RESCHEDULED,
      resolve: async (event) => {
        const { sessionId, sessionTitle, liveCourseTitle, newDate, newStartTime, reason, instructorIds } = event.payload;
        if (!instructorIds || instructorIds.length === 0) return null;

        return instructorIds.map((instructorId) => ({
          recipientId: instructorId,
          actorId: event.actorId,
          category: "REMINDER",
          type: "LIVE_SESSION_RESCHEDULED" as NotificationType,
          priority: "HIGH" as NotificationPriority,
          title: `Class Rescheduled: ${sessionTitle}`,
          message: `Live class "${sessionTitle}" (${liveCourseTitle}) has been moved to ${newDate} at ${newStartTime}.`,
          details: `Reschedule justification: ${reason || "Operational timetable adjustment."}`,
          entityType: "LIVE_SESSION",
          entityId: sessionId,
          actionUrl: `/instructor/live-sessions`,
          icon: "clock",
          metadata: { sessionId, newDate, newStartTime, reason },
          deduplicationKey: `LIVE_SESSION_RESCHEDULED:${sessionId}:${newDate}:${newStartTime}:${instructorId}`
        }));
      }
    });

    // 7. PERMISSIONS_UPDATED
    this.registerRule<PermissionsUpdatedPayload>({
      eventType: DOMAIN_EVENT_TYPES.PERMISSIONS_UPDATED,
      resolve: async (event) => {
        const { assignmentId, targetTitle, instructorId, permissions } = event.payload;
        if (!instructorId) return null;

        const editPrivilege = permissions.canEdit ? "Granted" : "Restricted";

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "ADMIN",
          type: "PERMISSIONS_UPDATED",
          priority: "NORMAL",
          title: `RBAC Permissions Updated: ${targetTitle}`,
          message: `Admin updated your live teaching privileges for "${targetTitle}". Master Edit Access: ${editPrivilege}.`,
          details: `Active permissions: Agenda (${permissions.canEditAgenda ? 'YES' : 'NO'}), Schedule (${permissions.canEditSchedule ? 'YES' : 'NO'}), Resources (${permissions.canEditResources ? 'YES' : 'NO'}).`,
          entityType: "SESSION_ASSIGNMENT",
          entityId: assignmentId,
          actionUrl: `/instructor/live-sessions`,
          icon: "shield",
          metadata: { assignmentId, targetTitle, permissions },
          deduplicationKey: `PERM_UPDATED:${assignmentId}:${Date.now()}`
        };
      }
    });

    // 8. STUDENT_ENROLLED
    this.registerRule<StudentEnrolledPayload>({
      eventType: DOMAIN_EVENT_TYPES.STUDENT_ENROLLED,
      resolve: async (event) => {
        const { courseId, courseTitle, studentName, instructorId } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "STUDENT",
          type: "STUDENT_ENROLLED",
          priority: "NORMAL",
          title: `New Student Enrollment`,
          message: `${studentName || 'A new student'} enrolled in "${courseTitle}".`,
          details: "Welcome your new learner and check their progress in the Students hub.",
          entityType: "COURSE",
          entityId: courseId,
          actionUrl: `/instructor/students`,
          icon: "user",
          metadata: { courseId, courseTitle, studentName },
          deduplicationKey: `STUDENT_ENROLLED:${courseId}:${event.payload.studentId}`
        };
      }
    });

    // 9. ASSIGNMENT_SUBMITTED
    this.registerRule<AssignmentSubmittedPayload>({
      eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_SUBMITTED,
      resolve: async (event) => {
        const { assignmentId, assignmentTitle, submissionId, studentName, courseTitle, instructorId } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "ASSIGNMENT",
          type: "ASSIGNMENT_SUBMITTED",
          priority: "NORMAL",
          title: `Assignment Submitted`,
          message: `${studentName} submitted "${assignmentTitle}" in ${courseTitle} for review.`,
          details: "Review code solution, provide grades, and leave constructive feedback.",
          entityType: "ASSIGNMENT",
          entityId: assignmentId,
          actionUrl: `/instructor/assignments`,
          icon: "file",
          metadata: { assignmentId, submissionId, studentName, assignmentTitle },
          deduplicationKey: `ASSIGNMENT_SUBMITTED:${assignmentId}:${submissionId}`
        };
      }
    });

    // 10. TASK_ASSIGNED
    this.registerRule<TaskAssignedPayload>({
      eventType: DOMAIN_EVENT_TYPES.TASK_ASSIGNED,
      resolve: async (event) => {
        const { taskId, taskTitle, priority, deadline, instructorId, description } = event.payload;
        if (!instructorId) return null;

        const notifPriority: NotificationPriority =
          priority === "Urgent" ? "URGENT" : priority === "High" ? "HIGH" : "NORMAL";

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "TASK",
          type: "TASK_ASSIGNED",
          priority: notifPriority,
          title: `New Task Assigned: ${taskTitle}`,
          message: description || `Admin assigned you a new task: "${taskTitle}".`,
          details: deadline ? `Due date: ${deadline}` : "Check task instructions in your task command center.",
          entityType: "TASK",
          entityId: taskId,
          actionUrl: `/instructor/tasks`,
          icon: "check-square",
          metadata: { taskId, taskTitle, deadline, priority },
          deduplicationKey: `TASK_ASSIGNED:${taskId}:${instructorId}`
        };
      }
    });

    // 11. VERIFICATION_APPROVED / REJECTED
    this.registerRule<VerificationDecisionPayload>({
      eventType: DOMAIN_EVENT_TYPES.VERIFICATION_APPROVED,
      resolve: async (event) => {
        const { instructorId, decision, feedback } = event.payload;
        if (!instructorId) return null;

        const isApproved = decision === "APPROVED";

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "VERIFICATION",
          type: isApproved ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
          priority: "HIGH",
          title: isApproved ? "Instructor Profile Verified & Approved" : "Instructor Verification Status Update",
          message: isApproved
            ? "Congratulations! Your instructor application and KYC credentials have been approved. You now have full educator access."
            : `Your instructor verification application status was updated to ${decision}. Feedback: ${feedback || 'Please update your details.'}`,
          details: feedback || null,
          entityType: "USER",
          entityId: instructorId,
          actionUrl: `/instructor/verification`,
          icon: "shield",
          metadata: { decision, feedback },
          deduplicationKey: `VERIFICATION:${instructorId}:${decision}`
        };
      }
    });

    // 12. PAYOUT_COMPLETED
    this.registerRule<PayoutCompletedPayload>({
      eventType: DOMAIN_EVENT_TYPES.PAYOUT_COMPLETED,
      resolve: async (event) => {
        const { payoutId, instructorId, amount, currency = "₹", transactionId } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "PAYMENT",
          type: "PAYOUT_COMPLETED",
          priority: "NORMAL",
          title: `Payout Completed`,
          message: `${currency}${amount} credited successfully to your registered bank account.`,
          details: transactionId ? `Transaction Ref: ${transactionId}` : "Funds have been processed for your teaching earnings.",
          entityType: "PAYOUT",
          entityId: payoutId,
          actionUrl: `/instructor`,
          icon: "credit-card",
          metadata: { payoutId, amount, currency, transactionId },
          deduplicationKey: `PAYOUT_COMPLETED:${payoutId}`
        };
      }
    });

    // 13. LIVE_SESSION_REMINDER
    this.registerRule<LiveSessionReminderPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_REMINDER,
      resolve: async (event) => {
        const { sessionId, sessionTitle, liveCourseTitle, instructorId, startsInMinutes, meetingUrl } = event.payload;
        if (!instructorId) return null;

        return {
          recipientId: instructorId,
          actorId: null,
          category: "REMINDER",
          type: "LIVE_SESSION_REMINDER",
          priority: startsInMinutes <= 20 ? "URGENT" : "HIGH",
          title: `Live Class Reminder`,
          message: `Your live session "${sessionTitle}" (${liveCourseTitle}) starts in ${startsInMinutes} minutes.`,
          details: meetingUrl ? `Zoom / Meet Room: ${meetingUrl}. Please join 5 minutes early to test audio/video.` : "Please open your instructor dashboard to launch the live classroom.",
          entityType: "LIVE_SESSION",
          entityId: sessionId,
          actionUrl: `/instructor/live-sessions`,
          icon: "clock",
          metadata: { sessionId, startsInMinutes, meetingUrl },
          deduplicationKey: `LIVE_REMINDER:${sessionId}:${startsInMinutes}m:${instructorId}`
        };
      }
    });
  }
}

export const notificationRuleEngine = new NotificationRuleEngine();
