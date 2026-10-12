import prisma from "@/lib/db";
import { formatDate, formatTime } from "@/lib/dateTime";
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
  AssignmentGradedPayload,
  AssignmentCreatedPayload,
  LiveSessionCreatedPayload,
  LiveSessionCancelledPayload,
  CourseMilestonePayload,
  CertificateAvailablePayload,
  StudentAnnouncementPayload,
  CourseCreationPermissionRequestedPayload,
  CourseCreationPermissionDecisionPayload,
  LiveSessionEditRequestedPayload,
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

        const formattedTime = startTime ? ` at ${formatTime(startTime)}` : "";
        const formattedDate = date ? ` on ${formatDate(date)}` : "";

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

        const formattedNewDate = formatDate(newDate);
        const formattedNewTime = formatTime(newStartTime);

        return instructorIds.map((instructorId) => ({
          recipientId: instructorId,
          actorId: event.actorId,
          category: "REMINDER",
          type: "LIVE_SESSION_RESCHEDULED" as NotificationType,
          priority: "HIGH" as NotificationPriority,
          title: `Class Rescheduled: ${sessionTitle}`,
          message: `Live class "${sessionTitle}" (${liveCourseTitle}) has been moved to ${formattedNewDate} at ${formattedNewTime}.`,
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
        const { courseId, courseTitle, studentName, studentId, instructorId } = event.payload;
        const notifications: ResolvedNotification[] = [];

        // 1. Notification to Instructor (if assigned)
        if (instructorId) {
          notifications.push({
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
            deduplicationKey: `STUDENT_ENROLLED:${courseId}:${studentId || 'unknown'}`
          });
        }

        // 2. Notification to Student Learner
        const recipientStudentId = studentId || event.actorId;
        if (recipientStudentId) {
          notifications.push({
            recipientId: recipientStudentId,
            actorId: event.actorId,
            category: "COURSE",
            type: "STUDENT_ENROLLED",
            priority: "NORMAL",
            title: `Enrollment Confirmed: ${courseTitle}`,
            message: `You're enrolled in "${courseTitle}". Start learning whenever you're ready!`,
            details: "Access all modules, interactive code sandboxes, and video lectures in your dashboard.",
            entityType: "COURSE",
            entityId: courseId,
            actionUrl: `/learn/${courseId}`,
            icon: "book",
            metadata: { courseId, courseTitle },
            deduplicationKey: `STUDENT_ENROLLED_CONFIRM:${courseId}:${recipientStudentId}`
          });
        }

        return notifications;
      }
    });

    // 9. ASSIGNMENT_SUBMITTED
    this.registerRule<AssignmentSubmittedPayload>({
      eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_SUBMITTED,
      resolve: async (event) => {
        const { assignmentId, assignmentTitle, submissionId, studentName, studentId, courseTitle, instructorId } = event.payload;
        const notifs: ResolvedNotification[] = [];

        if (instructorId) {
          notifs.push({
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
          });
        }

        if (studentId) {
          notifs.push({
            recipientId: studentId,
            actorId: event.actorId,
            category: "ASSIGNMENT",
            type: "ASSIGNMENT_SUBMITTED",
            priority: "NORMAL",
            title: `Assignment Submitted Successfully`,
            message: `Your solution for "${assignmentTitle}" has been received.`,
            details: "Your instructor will review your code and provide feedback soon.",
            entityType: "ASSIGNMENT",
            entityId: assignmentId,
            actionUrl: `/student/assignments`,
            icon: "check-square",
            metadata: { assignmentId, submissionId, assignmentTitle },
            deduplicationKey: `STUDENT_ASSIGNMENT_SUBMITTED:${assignmentId}:${submissionId}`
          });
        }

        return notifs;
      }
    });

    // 10. TASK_ASSIGNED
    this.registerRule<TaskAssignedPayload>({
      eventType: DOMAIN_EVENT_TYPES.TASK_ASSIGNED,
      resolve: async (event) => {
        const { taskId, taskTitle, priority = "Normal", deadline, instructorId, description, assignedBy } = event.payload;
        if (!instructorId) return null;

        const prioMap: Record<string, NotificationPriority> = {
          Urgent: "URGENT",
          High: "HIGH",
          Normal: "NORMAL",
          Low: "LOW"
        };

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "TASK",
          type: "TASK_ASSIGNED",
          priority: prioMap[priority] || "NORMAL",
          title: `New Task: ${taskTitle}`,
          message: `${assignedBy || "Academic Admin"} assigned you a new instruction: "${taskTitle}".`,
          details: description || (deadline ? `Complete before ${deadline}.` : "Check task details and update status upon completion."),
          entityType: "TASK",
          entityId: taskId,
          actionUrl: `/instructor/tasks`,
          icon: "check-square",
          metadata: { taskId, taskTitle, deadline, priority },
          deduplicationKey: `TASK_ASSIGNED:${taskId}`
        };
      }
    });

    // 11. VERIFICATION_DECISION
    this.registerRule<VerificationDecisionPayload>({
      eventType: DOMAIN_EVENT_TYPES.VERIFICATION_APPROVED,
      resolve: async (event) => {
        const { instructorId, decision, feedback } = event.payload;
        if (!instructorId) return null;

        const isApproved = decision === "APPROVED";
        const isChanges = decision === "CHANGES_REQUESTED";

        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "VERIFICATION",
          type: isApproved ? "VERIFICATION_APPROVED" : isChanges ? "VERIFICATION_CHANGES_REQUESTED" : "VERIFICATION_REJECTED",
          priority: isApproved ? "HIGH" : "URGENT",
          title: isApproved ? "Instructor Profile Verified!" : isChanges ? "Profile Updates Requested" : "Verification Declined",
          message: isApproved
            ? "Congratulations! Your faculty profile has been fully verified and approved by the academic committee."
            : isChanges
            ? "Admin reviewed your verification application and requested updates before granting full access."
            : "Your faculty verification request was declined. Please review admin notes.",
          details: feedback || (isApproved ? "You can now publish self-paced masterclasses and lead live cohorts." : "Open verification tab to review requirements."),
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
        const { sessionId, sessionTitle, liveCourseId, liveCourseTitle, instructorId, studentIds, startsInMinutes, meetingUrl } = event.payload;
        const notifs: ResolvedNotification[] = [];

        // Notify Instructor
        if (instructorId) {
          notifs.push({
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
          });
        }

        // Notify Enrolled Students
        let targetStudents = studentIds;
        if (!targetStudents && liveCourseId) {
          try {
            const enrollments = await prisma.liveCourseEnrollment.findMany({
              where: { liveCourseId, status: "ACTIVE" },
              select: { userId: true }
            });
            targetStudents = enrollments.map(e => e.userId);
          } catch (e) {
            console.error("Failed to query enrolled students for live reminder:", e);
          }
        }

        if (targetStudents && targetStudents.length > 0) {
          for (const sId of targetStudents) {
            notifs.push({
              recipientId: sId,
              actorId: null,
              category: "LIVE_SESSION",
              type: "LIVE_SESSION_REMINDER",
              priority: startsInMinutes <= 20 ? "URGENT" : "HIGH",
              title: startsInMinutes <= 15 ? `🔵 Live Class Starting Now!` : `Live Class Reminder`,
              message: `Your live class "${sessionTitle}" (${liveCourseTitle}) starts in ${startsInMinutes} minutes.`,
              details: "Join the live interactive video room to learn directly with your instructor.",
              entityType: "LIVE_SESSION",
              entityId: sessionId,
              actionUrl: `/live-classes/room/${sessionId}`,
              icon: "radio",
              metadata: { sessionId, liveCourseId, startsInMinutes },
              deduplicationKey: `STUDENT_LIVE_REMINDER:${sessionId}:${startsInMinutes}m:${sId}`
            });
          }
        }

        return notifs;
      }
    });

    // 14. ASSIGNMENT_GRADED (Student Alert)
    this.registerRule<AssignmentGradedPayload>({
      eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_GRADED,
      resolve: async (event) => {
        const { studentId, assignmentId, assignmentTitle, courseTitle, grade, feedback } = event.payload;
        if (!studentId) return null;

        return {
          recipientId: studentId,
          actorId: event.actorId,
          category: "ASSIGNMENT",
          type: "ASSIGNMENT_SUBMITTED",
          priority: "NORMAL",
          title: `✓ Assignment Graded: ${assignmentTitle}`,
          message: `Your submission for "${assignmentTitle}" in ${courseTitle || "your course"} has been graded${grade ? ` (Score: ${grade})` : ""}.`,
          details: feedback || "Review instructor feedback and grades in your assignments hub.",
          entityType: "ASSIGNMENT",
          entityId: assignmentId,
          actionUrl: `/student/assignments`,
          icon: "file-check",
          metadata: { assignmentId, grade, feedback },
          deduplicationKey: `ASSIGNMENT_GRADED:${assignmentId}:${studentId}`
        };
      }
    });

    // 15. COURSE_MILESTONE & COMPLETION
    const resolveMilestone = async (event: DomainEvent<CourseMilestonePayload>) => {
      const { studentId, courseId, courseTitle, milestonePercent } = event.payload;
      if (!studentId) return null;

      const isComplete = milestonePercent >= 100;

      return {
        recipientId: studentId,
        actorId: event.actorId,
        category: "COURSE" as NotificationCategory,
        type: (isComplete ? "STUDENT_COMPLETED_COURSE" : "COURSE_UPDATED") as NotificationType,
        priority: (isComplete ? "HIGH" : "NORMAL") as NotificationPriority,
        title: isComplete ? `🏆 Course Completed: ${courseTitle}` : `🎉 ${milestonePercent}% Milestone Reached!`,
        message: isComplete
          ? `Congratulations! You have completed 100% of "${courseTitle}". Your certificate of completion is ready.`
          : `Great momentum! You've completed ${milestonePercent}% of "${courseTitle}". Keep up the streak!`,
        details: isComplete ? "Download or share your verified digital credential." : "Continue to next lecture module.",
        entityType: "COURSE",
        entityId: courseId,
        actionUrl: isComplete ? `/student/certificates` : `/learn/${courseId}`,
        icon: isComplete ? "award" : "sparkles",
        metadata: { courseId, milestonePercent },
        deduplicationKey: `MILESTONE:${courseId}:${milestonePercent}:${studentId}`
      };
    };

    this.registerRule<CourseMilestonePayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_MILESTONE,
      resolve: resolveMilestone,
    });

    this.registerRule<CourseMilestonePayload>({
      eventType: DOMAIN_EVENT_TYPES.STUDENT_COMPLETED_COURSE,
      resolve: resolveMilestone,
    });

    // 16. LIVE_SESSION_SCHEDULED / CREATED (Student Alert)
    this.registerRule<LiveSessionCreatedPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_CREATED,
      resolve: async (event) => {
        const { liveCourseId, liveCourseTitle, sessionId, sessionTitle, date, startTime } = event.payload;
        if (!liveCourseId) return null;

        try {
          const enrollments = await prisma.liveCourseEnrollment.findMany({
            where: { liveCourseId, status: "ACTIVE" },
            select: { userId: true }
          });

          return enrollments.map(e => ({
            recipientId: e.userId,
            actorId: event.actorId,
            category: "LIVE_SESSION" as NotificationCategory,
            type: "LIVE_SESSION_CREATED" as NotificationType,
            priority: "NORMAL" as NotificationPriority,
            title: `📅 New Live Class: ${sessionTitle}`,
            message: `A new session has been added to "${liveCourseTitle}" on ${formatDate(date, "scheduled date")} at ${formatTime(startTime, "TBD")}.`,
            details: "Mark your calendar and check session topics in your training timetable.",
            entityType: "LIVE_SESSION",
            entityId: sessionId,
            actionUrl: `/calendar`,
            icon: "calendar",
            metadata: { liveCourseId, sessionId },
            deduplicationKey: `LIVE_SESSION_CREATED_STUDENT:${sessionId}:${e.userId}`
          }));
        } catch (err) {
          console.error("Error creating student notifications for new session:", err);
          return null;
        }
      }
    });

    // 17. LIVE_SESSION_CANCELLED (Student Alert)
    this.registerRule<LiveSessionCancelledPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_CANCELLED,
      resolve: async (event) => {
        const { liveCourseId, liveCourseTitle, sessionId, sessionTitle, reason } = event.payload;
        if (!liveCourseId) return null;

        try {
          const enrollments = await prisma.liveCourseEnrollment.findMany({
            where: { liveCourseId, status: "ACTIVE" },
            select: { userId: true }
          });

          return enrollments.map(e => ({
            recipientId: e.userId,
            actorId: event.actorId,
            category: "LIVE_SESSION" as NotificationCategory,
            type: "LIVE_SESSION_CANCELLED" as NotificationType,
            priority: "HIGH" as NotificationPriority,
            title: `Live Class Cancelled: ${sessionTitle}`,
            message: `The session "${sessionTitle}" (${liveCourseTitle}) has been cancelled.`,
            details: reason ? `Reason: ${reason}` : "Your instructor will reschedule this session shortly.",
            entityType: "LIVE_SESSION",
            entityId: sessionId,
            actionUrl: `/calendar`,
            icon: "calendar",
            metadata: { liveCourseId, sessionId, reason },
            deduplicationKey: `LIVE_CANCELLED:${sessionId}:${e.userId}`
          }));
        } catch (err) {
          console.error("Error notifying students of cancelled session:", err);
          return null;
        }
      }
    });

    // 18. COURSE_CREATION_PERMISSION_REQUESTED (Notify Admins)
    this.registerRule<CourseCreationPermissionRequestedPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REQUESTED,
      resolve: async (event) => {
        const { instructorId, instructorName, instructorEmail, notes } = event.payload;
        try {
          const admins = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true }
          });

          return admins.map(admin => ({
            recipientId: admin.id,
            actorId: instructorId,
            category: "ADMIN" as NotificationCategory,
            type: "PERMISSIONS_UPDATED" as NotificationType,
            priority: "HIGH" as NotificationPriority,
            title: `Course Creation Permission Requested`,
            message: `${instructorName || "Instructor"} requested permission to create and publish courses.`,
            details: notes ? `Instructor note: "${notes}"` : "Review instructor background and grant/reject course-creation access.",
            entityType: "INSTRUCTOR_PERMISSION",
            entityId: instructorId,
            actionUrl: `/admin/instructors?tab=permissions`,
            icon: "shield",
            metadata: { instructorId, instructorName, instructorEmail, notes },
            deduplicationKey: `COURSE_PERM_REQUEST:${instructorId}:${Date.now()}`
          }));
        } catch (err) {
          console.error("Error notifying admins of course creation request:", err);
          return null;
        }
      }
    });

    // 18b. LIVE_SESSION_EDIT_REQUESTED (Notify Admins)
    this.registerRule<LiveSessionEditRequestedPayload>({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_EDIT_REQUESTED,
      resolve: async (event) => {
        const {
          instructorId,
          instructorName,
          instructorEmail,
          sessionId,
          sessionCode,
          sessionTitle,
          courseName,
          notes
        } = event.payload;

        try {
          const admins = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true }
          });

          const targetLabel = sessionCode ? `${sessionCode} (${sessionTitle || "Live Session"})` : (sessionTitle || "Live Session");
          const courseLabel = courseName ? ` in "${courseName}"` : "";

          return admins.map(admin => ({
            recipientId: admin.id,
            actorId: instructorId,
            category: "ADMIN" as NotificationCategory,
            type: "PERMISSIONS_UPDATED" as NotificationType,
            priority: "HIGH" as NotificationPriority,
            title: `Session Edit Permission Requested`,
            message: `${instructorName || "Instructor"} requested edit access for ${targetLabel}${courseLabel}.`,
            details: notes ? `Reason from instructor: "${notes}"` : `Review instructor request and grant Live Class Edit permission.`,
            entityType: "INSTRUCTOR_PERMISSION",
            entityId: instructorId,
            actionUrl: `/admin/instructors?tab=permissions`,
            icon: "lock",
            metadata: {
              instructorId,
              instructorName,
              instructorEmail,
              sessionId,
              sessionCode,
              sessionTitle,
              courseName,
              notes
            },
            deduplicationKey: `SESSION_EDIT_REQ:${instructorId}:${sessionId}:${Date.now()}`
          }));
        } catch (err) {
          console.error("Error notifying admins of session edit request:", err);
          return null;
        }
      }
    });

    // 19. COURSE_CREATION_PERMISSION_APPROVED (Notify Instructor)
    this.registerRule<CourseCreationPermissionDecisionPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_APPROVED,
      resolve: async (event) => {
        const { instructorId, feedback, adminName } = event.payload;
        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "COURSE" as NotificationCategory,
          type: "PERMISSIONS_UPDATED" as NotificationType,
          priority: "HIGH" as NotificationPriority,
          title: `🎉 Course Creation Privileges Approved!`,
          message: `Your course creation request has been approved by ${adminName || "Platform Administration"}. You can now create and architect new courses.`,
          details: feedback || "Use our AI Copilot and Curriculum Designer in the Course Creator Studio to build your curriculum.",
          entityType: "INSTRUCTOR_PERMISSION",
          entityId: instructorId,
          actionUrl: `/instructor`,
          icon: "sparkles",
          metadata: { instructorId, approved: true },
          deduplicationKey: `COURSE_PERM_APPROVED:${instructorId}:${Date.now()}`
        };
      }
    });

    // 20. COURSE_CREATION_PERMISSION_REJECTED (Notify Instructor)
    this.registerRule<CourseCreationPermissionDecisionPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REJECTED,
      resolve: async (event) => {
        const { instructorId, feedback, adminName } = event.payload;
        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "ADMIN" as NotificationCategory,
          type: "PERMISSIONS_UPDATED" as NotificationType,
          priority: "NORMAL" as NotificationPriority,
          title: `Course Creation Request Update`,
          message: `Your course creation permission request was not approved at this time.`,
          details: feedback ? `Reviewer feedback: ${feedback}` : "You may re-apply after updating your profile and verification materials.",
          entityType: "INSTRUCTOR_PERMISSION",
          entityId: instructorId,
          actionUrl: `/instructor`,
          icon: "alert",
          metadata: { instructorId, approved: false, feedback },
          deduplicationKey: `COURSE_PERM_REJECTED:${instructorId}:${Date.now()}`
        };
      }
    });

    // 21. COURSE_CREATION_PERMISSION_REVOKED (Notify Instructor)
    this.registerRule<CourseCreationPermissionDecisionPayload>({
      eventType: DOMAIN_EVENT_TYPES.COURSE_CREATION_PERMISSION_REVOKED,
      resolve: async (event) => {
        const { instructorId, feedback } = event.payload;
        return {
          recipientId: instructorId,
          actorId: event.actorId,
          category: "ADMIN" as NotificationCategory,
          type: "PERMISSIONS_UPDATED" as NotificationType,
          priority: "HIGH" as NotificationPriority,
          title: `Course Creation Permission Updated`,
          message: `Your course creation privileges have been revoked by Platform Administration.`,
          details: feedback ? `Details: ${feedback}. Note: Your existing published and draft courses remain active.` : "Your existing courses and live sessions remain active. Contact administration if you believe this is an error.",
          entityType: "INSTRUCTOR_PERMISSION",
          entityId: instructorId,
          actionUrl: `/instructor`,
          icon: "shield",
          metadata: { instructorId, revoked: true },
          deduplicationKey: `COURSE_PERM_REVOKED:${instructorId}:${Date.now()}`
        };
      }
    });
  }
}


export const notificationRuleEngine = new NotificationRuleEngine();
