import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    // Instructor permission verification
    const assignment = liveSession.assignments[0];
    if (!isAdmin && (!assignment || !assignment.canEdit)) {
      return NextResponse.json(
        { error: "Access Denied: You do not have permission to edit this session. Please contact Admin." },
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
      agenda,
      topics,
      learningOutcomes,
      activities,
      resources,
      homework
    } = body;

    // Enforce granular permissions for instructors
    if (!isAdmin) {
      if ((date !== undefined || startTime !== undefined || endTime !== undefined) && !assignment.canEditSchedule) {
        return NextResponse.json(
          { error: "Access Denied: You do not have permission to modify the session schedule directly." },
          { status: 403 }
        );
      }
      if (agenda !== undefined && !assignment.canEditAgenda) {
        return NextResponse.json(
          { error: "Access Denied: You do not have permission to edit the session agenda." },
          { status: 403 }
        );
      }
      if (resources !== undefined && !assignment.canEditResources) {
        return NextResponse.json(
          { error: "Access Denied: You do not have permission to edit session resources." },
          { status: 403 }
        );
      }
      if (homework !== undefined && !assignment.canAddHomework) {
        return NextResponse.json(
          { error: "Access Denied: You do not have permission to modify homework assignments." },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined && (isAdmin || assignment?.canEditSchedule)) updateData.date = date ? new Date(date) : null;
    if (startTime !== undefined && (isAdmin || assignment?.canEditSchedule)) updateData.startTime = startTime;
    if (endTime !== undefined && (isAdmin || assignment?.canEditSchedule)) updateData.endTime = endTime;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (recordingUrl !== undefined && (isAdmin || assignment?.canManageRecording)) updateData.recordingUrl = recordingUrl;

    await prisma.$transaction(async (tx) => {
      await tx.liveSession.update({
        where: { id },
        data: updateData
      });

      if (agenda !== undefined && (isAdmin || assignment?.canEditAgenda)) {
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

      if (resources !== undefined && (isAdmin || assignment?.canEditResources)) {
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

      if (homework !== undefined && (isAdmin || assignment?.canAddHomework)) {
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
        homework: true
      }
    });

    return NextResponse.json({ success: true, session: refreshed });
  } catch (error: any) {
    console.error("Instructor Edit Session Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update session" }, { status: 500 });
  }
}
