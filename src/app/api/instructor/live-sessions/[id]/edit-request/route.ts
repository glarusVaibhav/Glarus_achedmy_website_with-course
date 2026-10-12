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
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: sessionId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { reason, notes } = body;

    const editReason = reason || notes || "";

    // Find session & liveCourse info
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        liveCourse: {
          select: { id: true, title: true }
        }
      }
    });

    const sessionCode = liveSession ? `Session ${liveSession.sessionNumber < 10 ? `0${liveSession.sessionNumber}` : liveSession.sessionNumber}` : "Live Session";
    const sessionTitle = liveSession?.title || "Live Class";
    const courseTitle = liveSession?.liveCourse?.title || "Assigned Cohort";
    const requestNote = `Edit Request for ${sessionCode}: "${sessionTitle}" (${courseTitle})${editReason ? ` — Reason: "${editReason}"` : ""}`;

    // Update InstructorCoursePermission record
    const existing = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId: session.id }
    });

    let history: any[] = [];
    if (existing?.requestHistory && Array.isArray(existing.requestHistory)) {
      history = [...existing.requestHistory];
    }

    history.push({
      action: "SESSION_EDIT_REQUESTED",
      sessionId,
      sessionCode,
      sessionTitle,
      courseTitle,
      reason: editReason,
      timestamp: new Date().toISOString(),
      previousStatus: existing?.status || "NOT_REQUESTED"
    });

    const updated = await prisma.instructorCoursePermission.upsert({
      where: { instructorId: session.id },
      create: {
        instructorId: session.id,
        status: "PENDING",
        canCreateCourse: false,
        canEditCourse: false,
        canCreateLiveClass: false,
        canEditLiveClass: false,
        canRescheduleLiveClass: false,
        requestedAt: new Date(),
        notes: requestNote,
        rejectionReason: null,
        requestHistory: history
      },
      update: {
        status: "PENDING",
        requestedAt: new Date(),
        notes: requestNote,
        rejectionReason: null,
        requestHistory: history
      }
    });

    // Emit event so all Admins receive notifications
    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_EDIT_REQUESTED,
      actorId: session.id,
      payload: {
        instructorId: session.id,
        instructorName: session.name,
        instructorEmail: session.email,
        sessionId,
        sessionCode,
        sessionTitle,
        courseId: liveSession?.liveCourseId,
        courseName: courseTitle,
        notes: editReason || undefined
      }
    });

    return NextResponse.json({
      success: true,
      status: "PENDING",
      message: `Edit permission request for ${sessionCode} has been submitted to Academic Administration.`,
      permission: updated
    });
  } catch (error: any) {
    console.error("POST /api/instructor/live-sessions/[id]/edit-request error:", error);
    return NextResponse.json(
      { error: "Failed to submit session edit permission request", details: error?.message },
      { status: 500 }
    );
  }
}
