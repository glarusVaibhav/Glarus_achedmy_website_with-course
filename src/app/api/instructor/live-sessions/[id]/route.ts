import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/instructorPermissions";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        liveCourse: true,
        assignments: { where: { instructorId: session.id } }
      }
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Admin override check
    const isAdmin = session.role === "ADMIN";

    // Check system-level permissions granted by Admin
    const canEditLiveClass = isAdmin || (await hasPermission(session, "LIVE_CLASS_EDIT"));
    const canRescheduleLiveClass = isAdmin || (await hasPermission(session, "LIVE_CLASS_RESCHEDULE"));

    // Instructor authorization check
    const isLeadOrCreator =
      liveSession.liveCourse?.leadInstructorId === session.id ||
      liveSession.liveCourse?.createdById === session.id;
    const assignment = liveSession.assignments[0];
    const isAssigned = Boolean(assignment);

    if (!isAdmin && !isLeadOrCreator && !isAssigned) {
      return NextResponse.json(
        { error: "Access Denied: You are not assigned to this live course session." },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      meetingUrl,
      recordingUrl,
      status,
      agenda,
      topics,
      learningOutcomes,
      activities,
      resources,
      homework
    } = body;

    const isModifyingContent =
      title !== undefined ||
      description !== undefined ||
      meetingUrl !== undefined ||
      recordingUrl !== undefined ||
      status !== undefined ||
      agenda !== undefined ||
      topics !== undefined ||
      learningOutcomes !== undefined ||
      activities !== undefined ||
      resources !== undefined ||
      homework !== undefined;

    const isModifyingSchedule =
      date !== undefined || startTime !== undefined || endTime !== undefined;

    // Enforce LIVE_CLASS_EDIT authority
    if (!isAdmin && isModifyingContent && !canEditLiveClass) {
      return NextResponse.json(
        {
          error: "Permission Denied: 'Live Class Editing' authority is disabled by Administrator for your instructor profile."
        },
        { status: 403 }
      );
    }

    // Enforce LIVE_CLASS_RESCHEDULE authority
    if (!isAdmin && isModifyingSchedule && !canRescheduleLiveClass) {
      return NextResponse.json(
        {
          error: "Permission Denied: 'Live Class Rescheduling' authority is disabled by Administrator for your instructor profile."
        },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (date !== undefined && (isAdmin || canRescheduleLiveClass)) updateData.date = date ? new Date(date) : null;
    if (startTime !== undefined && (isAdmin || canRescheduleLiveClass)) updateData.startTime = startTime;
    if (endTime !== undefined && (isAdmin || canRescheduleLiveClass)) updateData.endTime = endTime;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;

    await prisma.$transaction(async (tx) => {
      await tx.liveSession.update({
        where: { id },
        data: updateData
      });

      if (agenda !== undefined && (isAdmin || isLeadOrCreator || canEditLiveClass || assignment?.canEditAgenda)) {
        await tx.sessionAgendaItem.deleteMany({ where: { sessionId: id } });
        if (agenda.length > 0) {
          await tx.sessionAgendaItem.createMany({
            data: agenda.map((ag: any, i: number) => ({
              sessionId: id,
              title: ag.title,
              description: ag.description || "",
              startTime: ag.startTime || null,
              endTime: ag.endTime || null,
              duration: ag.duration || "15 min",
              order: i + 1
            }))
          });
        }
      }

      if (topics !== undefined) {
        await tx.sessionTopic.deleteMany({ where: { sessionId: id } });
        if (topics.length > 0) {
          await tx.sessionTopic.createMany({
            data: topics.map((tp: any, i: number) => ({
              sessionId: id,
              title: typeof tp === "string" ? tp : tp.title,
              description: tp.description || "",
              order: i + 1
            }))
          });
        }
      }

      if (learningOutcomes !== undefined) {
        await tx.sessionLearningOutcome.deleteMany({ where: { sessionId: id } });
        if (learningOutcomes.length > 0) {
          await tx.sessionLearningOutcome.createMany({
            data: learningOutcomes.map((lo: any, i: number) => ({
              sessionId: id,
              title: typeof lo === "string" ? lo : lo.title,
              order: i + 1
            }))
          });
        }
      }

      if (activities !== undefined) {
        await tx.sessionActivity.deleteMany({ where: { sessionId: id } });
        if (activities.length > 0) {
          await tx.sessionActivity.createMany({
            data: activities.map((ac: any, i: number) => ({
              sessionId: id,
              title: ac.title,
              instructions: ac.instructions || "",
              duration: ac.duration || "25 min",
              order: i + 1
            }))
          });
        }
      }

      if (resources !== undefined && (isAdmin || isLeadOrCreator || canEditLiveClass || assignment?.canEditResources)) {
        await tx.sessionResource.deleteMany({ where: { sessionId: id } });
        if (resources.length > 0) {
          await tx.sessionResource.createMany({
            data: resources.map((res: any) => ({
              sessionId: id,
              title: res.title,
              type: res.type || "URL",
              url: res.url
            }))
          });
        }
      }

      if (homework !== undefined && (isAdmin || isLeadOrCreator || canEditLiveClass || assignment?.canAddHomework)) {
        await tx.sessionHomework.deleteMany({ where: { sessionId: id } });
        if (homework && homework.title) {
          await tx.sessionHomework.create({
            data: {
              sessionId: id,
              title: homework.title,
              description: homework.description || "",
              dueDate: homework.dueDate || null
            }
          });
        }
      }

      await tx.sessionChangeHistory.create({
        data: {
          sessionId: id,
          changedBy: `${session.name || "Instructor"} (Instructor)`,
          changeType: "INSTRUCTOR_EDIT",
          previousValue: JSON.stringify({ title: liveSession.title }),
          newValue: JSON.stringify({ title: title || liveSession.title }),
          reason: "Instructor curriculum refinement"
        }
      });
    });

    const refreshed = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        agenda: { orderBy: { order: "asc" } },
        topics: { orderBy: { order: "asc" } },
        learningOutcomes: { orderBy: { order: "asc" } },
        activities: { orderBy: { order: "asc" } },
        resources: true,
        homework: true,
        sessionAssignmentsList: true,
        liveCourse: {
          select: { id: true, title: true }
        }
      }
    });

    // If session was completed, notify enrolled students about unlocked session assignment
    if (status === "COMPLETED" || (updateData.status === "COMPLETED" && liveSession.status !== "COMPLETED")) {
      try {
        const enrollments = await prisma.liveCourseEnrollment.findMany({
          where: { liveCourseId: liveSession.liveCourseId, status: "ACTIVE" },
          select: { userId: true }
        });

        const assignments = refreshed?.sessionAssignmentsList || [];
        const assignmentTitle = assignments[0]?.title || `Session ${liveSession.sessionNumber} Practice Assignment`;

        if (enrollments.length > 0) {
          await prisma.notification.createMany({
            data: enrollments.map((enr) => ({
              recipientId: enr.userId,
              actorId: session.id,
              type: "ASSIGNMENT_REVIEW_REQUIRED",
              category: "ASSIGNMENT",
              priority: "HIGH",
              title: `New Assignment Available: ${assignmentTitle}`,
              message: `Live session "${liveSession.title}" has concluded! Your practical assignment is now unlocked and ready for submission.`,
              actionUrl: `/student/live-training/${liveSession.liveCourseId}`,
              metadata: JSON.stringify({
                sessionId: id,
                liveCourseId: liveSession.liveCourseId,
                courseTitle: refreshed?.liveCourse?.title,
                sessionTitle: liveSession.title
              })
            }))
          });
        }
      } catch (notifyErr) {
        console.warn("Auto-assignment completion notification notice:", notifyErr);
      }
    }

    return NextResponse.json({ success: true, session: refreshed });
  } catch (error: any) {
    console.error("Instructor Edit Session Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update session" }, { status: 500 });
  }
}
