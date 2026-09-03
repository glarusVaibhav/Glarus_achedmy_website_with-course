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

    // If request made by instructor, check their canReschedule permission
    if (session.role === "INSTRUCTOR") {
      const assignment = liveSession.assignments.find((a) => a.instructorId === session.id);
      if (!assignment || !assignment.canReschedule) {
        return NextResponse.json({ error: "You do not have permission to reschedule this session. Please contact Admin." }, { status: 403 });
      }
    }

    const oldScheduleStr = `${liveSession.date ? new Date(liveSession.date).toISOString().split('T')[0] : "Unscheduled"} (${liveSession.startTime} - ${liveSession.endTime})`;
    const newScheduleStr = `${newDate} (${newStartTime || liveSession.startTime} - ${newEndTime || liveSession.endTime})`;

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
