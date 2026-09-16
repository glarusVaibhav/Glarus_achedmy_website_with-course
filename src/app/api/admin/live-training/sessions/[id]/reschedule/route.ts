import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const { newDate, newStartTime, newEndTime, reason } = await req.json();

    if (!newDate || !reason) {
      return NextResponse.json({ error: "New date and rescheduling reason are required" }, { status: 400 });
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        liveCourse: true,
        assignments: { include: { instructor: true } }
      }
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const oldScheduleStr = `${liveSession.date ? new Date(liveSession.date).toISOString().split('T')[0] : "Unscheduled"} (${liveSession.startTime} - ${liveSession.endTime})`;
    const newScheduleStr = `${newDate} (${newStartTime || liveSession.startTime} - ${newEndTime || liveSession.endTime})`;

    // Check if user has direct reschedule authority (Admin or Super Instructor with canReschedule)
    const assignment = liveSession.assignments.find((a) => a.instructorId === session.id);
    const canDirectReschedule = session.role === "ADMIN" || (assignment && assignment.canReschedule);

    // If standard instructor without canReschedule, treat as a Reschedule Request to Admin
    if (!canDirectReschedule) {
      await prisma.sessionChangeHistory.create({
        data: {
          sessionId: id,
          changedBy: `${session.name || "Instructor"} (${session.email || session.id})`,
          changeType: "RESCHEDULE_REQUESTED",
          previousValue: oldScheduleStr,
          newValue: newScheduleStr,
          reason: `[Reschedule Request from Instructor] ${reason}`
        }
      });

      // Create instant notifications for all Admins
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            recipientId: admin.id,
            actorId: session.id,
            category: "ADMIN",
            type: "TASK_UPDATED",
            priority: "HIGH",
            title: `Session Reschedule Requested: ${liveSession.title}`,
            message: `Instructor ${session.name || "Instructor"} requested to move Session ${liveSession.sessionNumber} (${liveSession.liveCourse?.title}) to ${newDate} at ${newStartTime || liveSession.startTime}.`,
            details: `Reason: "${reason}". Please review in Academic Operations.`,
            entityType: "LIVE_SESSION",
            entityId: id,
            actionUrl: `/admin/live-training/sessions/${id}`,
            icon: "clock",
            deduplicationKey: `RESCHEDULE_REQ:${id}:${newDate}:${Date.now()}`
          }
        });
      }

      return NextResponse.json({
        success: true,
        requested: true,
        message: "Reschedule request submitted to Academic Administration for review.",
        changeSummary: {
          from: oldScheduleStr,
          to: newScheduleStr,
          reason
        }
      });
    }

    // Direct Reschedule (Admin or Super Instructor)
    const updatedSession = await prisma.$transaction(async (tx) => {
      const updated = await tx.liveSession.update({
        where: { id },
        data: {
          date: new Date(newDate),
          startTime: newStartTime || liveSession.startTime,
          endTime: newEndTime || liveSession.endTime,
          status: "RESCHEDULED"
        }
      });

      await tx.sessionChangeHistory.create({
        data: {
          sessionId: id,
          changedBy: `${session.name || "User"} (${session.role})`,
          changeType: "RESCHEDULE",
          previousValue: oldScheduleStr,
          newValue: newScheduleStr,
          reason
        }
      });

      return updated;
    });

    // Notify all assigned instructors via Domain Event
    const instructorIds = liveSession.assignments.map((a) => a.instructorId).filter(Boolean);
    if (liveSession.liveCourse?.leadInstructorId && !instructorIds.includes(liveSession.liveCourse.leadInstructorId)) {
      instructorIds.push(liveSession.liveCourse.leadInstructorId);
    }

    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_RESCHEDULED,
      actorId: session.id,
      payload: {
        sessionId: liveSession.id,
        sessionTitle: liveSession.title,
        liveCourseId: liveSession.liveCourseId,
        liveCourseTitle: liveSession.liveCourse.title,
        oldDate: liveSession.date ? new Date(liveSession.date).toISOString().split('T')[0] : "",
        newDate,
        oldStartTime: liveSession.startTime,
        newStartTime: newStartTime || liveSession.startTime,
        reason,
        instructorIds,
      },
    });

    // Notify all Admins as well
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          recipientId: admin.id,
          actorId: session.id,
          category: "ADMIN",
          type: "LIVE_SESSION_RESCHEDULED",
          priority: "HIGH",
          title: `Class Rescheduled: ${liveSession.title}`,
          message: `${session.name || "Instructor"} (${session.role}) rescheduled Session ${liveSession.sessionNumber} (${liveSession.liveCourse?.title}) to ${newDate} at ${newStartTime || liveSession.startTime}.`,
          details: `Reason: "${reason}".`,
          entityType: "LIVE_SESSION",
          entityId: id,
          actionUrl: `/admin/live-training/sessions/${id}`,
          icon: "calendar",
          deduplicationKey: `ADMIN_RESCHEDULED:${id}:${newDate}:${Date.now()}`
        }
      });
    }

    // Record in AuditLog
    const adminUser = session.role === "ADMIN" ? session.id : liveSession.liveCourse.createdById || session.id;
    await prisma.auditLog.create({
      data: {
        adminId: adminUser,
        action: `${session.role === "ADMIN" ? "Admin" : "Instructor"} rescheduled Session ${liveSession.sessionNumber}: "${liveSession.title}"`,
        details: `From: ${oldScheduleStr} → To: ${newScheduleStr}. Reason: ${reason}`
      }
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      changeSummary: {
        from: oldScheduleStr,
        to: newScheduleStr,
        reason
      }
    });
  } catch (error: any) {
    console.error("Reschedule Session Error:", error);
    return NextResponse.json({ error: error.message || "Failed to reschedule session" }, { status: 500 });
  }
}
