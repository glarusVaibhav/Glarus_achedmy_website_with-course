import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        liveCourse: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            thumbnailGradient: true,
            status: true,
            meetingPlatform: true,
            meetingUrl: true,
            leadInstructor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        agenda: { orderBy: { order: "asc" } },
        topics: { orderBy: { order: "asc" } },
        learningOutcomes: { orderBy: { order: "asc" } },
        activities: { orderBy: { order: "asc" } },
        resources: true,
        homework: true,
        assignments: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        changeHistory: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: liveSession });
  } catch (error: any) {
    console.error("Admin Get Session Error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existingSession = await prisma.liveSession.findUnique({
      where: { id },
      include: { liveCourse: true }
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      timezone,
      duration,
      status,
      meetingUrl,
      recordingUrl,
      recordingStatus,
      agenda,
      topics,
      learningOutcomes,
      activities,
      resources,
      homework
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date ? new Date(date) : null;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl;
    if (recordingStatus !== undefined) updateData.recordingStatus = recordingStatus;

    // Execute updates within transaction if replacing child lists
    await prisma.$transaction(async (tx) => {
      // 1. Update primary session fields
      await tx.liveSession.update({
        where: { id },
        data: updateData
      });

      // 2. Replace Agenda if provided
      if (agenda !== undefined) {
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

      // 3. Replace Topics if provided
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

      // 4. Replace Learning Outcomes if provided
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

      // 5. Replace Activities if provided
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

      // 6. Replace Resources if provided
      if (resources !== undefined) {
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

      // 7. Replace Homework if provided
      if (homework !== undefined) {
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

      // Record in SessionChangeHistory
      await tx.sessionChangeHistory.create({
        data: {
          sessionId: id,
          changedBy: session.name || "Super Admin",
          changeType: "CONTENT_UPDATED",
          previousValue: JSON.stringify({ title: existingSession.title, status: existingSession.status }),
          newValue: JSON.stringify({ title: title || existingSession.title, status: status || existingSession.status }),
          reason: "Manual admin session edit"
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
        assignments: { include: { instructor: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin edited Session ${existingSession.sessionNumber}: "${existingSession.title}"`,
        details: `Updated session content & agenda in course: "${existingSession.liveCourse.title}"`
      }
    });

    return NextResponse.json({ session: refreshed });
  } catch (error: any) {
    console.error("Admin Update Session Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const existing = await prisma.liveSession.findUnique({
      where: { id },
      include: { liveCourse: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.liveSession.delete({ where: { id } }),
      prisma.liveCourse.update({
        where: { id: existing.liveCourseId },
        data: { totalSessions: { decrement: 1 } }
      })
    ]);

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin deleted Session ${existing.sessionNumber}: "${existing.title}"`,
        details: `Removed session from Live Course "${existing.liveCourse.title}"`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Delete Session Error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
