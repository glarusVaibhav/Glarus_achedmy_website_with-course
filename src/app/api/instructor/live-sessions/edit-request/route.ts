import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId, reason, notes } = body;

    const editReason = reason || notes || "";

    let sessionCode = "Live Session";
    let sessionTitle = "Live Class";
    let courseTitle = "Assigned Cohort";
    let courseId: string | undefined = undefined;

    if (sessionId) {
      const liveSession = await prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: {
          liveCourse: {
            select: { id: true, title: true }
          }
        }
      });
      if (liveSession) {
        sessionCode = `Session ${liveSession.sessionNumber < 10 ? `0${liveSession.sessionNumber}` : liveSession.sessionNumber}`;
        sessionTitle = liveSession.title || "Live Class";
        courseTitle = liveSession.liveCourse?.title || "Assigned Cohort";
        courseId = liveSession.liveCourseId;
      }
    }

    const requestNote = sessionId
      ? `Edit Request for ${sessionCode}: "${sessionTitle}" (${courseTitle})${editReason ? ` — Reason: "${editReason}"` : ""}`
      : `Live Session Edit Permission Requested${editReason ? ` — Reason: "${editReason}"` : ""}`;

    const existing = await prisma.instructorCoursePermission.findUnique({
      where: { instructorId: session.id }
    });

    let history: any[] = [];
    if (existing?.requestHistory && Array.isArray(existing.requestHistory)) {
      history = [...existing.requestHistory];
    }

    history.push({
      action: "SESSION_EDIT_REQUESTED",
      sessionId: sessionId || null,
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

    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_EDIT_REQUESTED,
      actorId: session.id,
      payload: {
        instructorId: session.id,
        instructorName: session.name,
        instructorEmail: session.email,
        sessionId: sessionId || "ALL",
        sessionCode,
        sessionTitle,
        courseId,
        courseName: courseTitle,
        notes: editReason || undefined
      }
    });

    return NextResponse.json({
      success: true,
      status: "PENDING",
      message: `Edit permission request has been submitted to Academic Administration.`,
      permission: updated
    });
  } catch (error: any) {
    console.error("POST /api/instructor/live-sessions/edit-request error:", error);
    return NextResponse.json(
      { error: "Failed to submit session edit permission request", details: error?.message },
      { status: 500 }
    );
  }
}
