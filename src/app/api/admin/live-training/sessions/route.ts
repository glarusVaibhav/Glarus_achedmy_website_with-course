import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (courseId) {
      where.liveCourseId = courseId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { liveCourse: { title: { contains: search } } }
      ];
    }

    const sessions = await prisma.liveSession.findMany({
      where,
      orderBy: [{ date: "asc" }, { sessionNumber: "asc" }],
      include: {
        liveCourse: {
          select: {
            id: true,
            title: true,
            category: true,
            thumbnailGradient: true,
            status: true,
            leadInstructor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        agenda: {
          orderBy: { order: "asc" }
        },
        topics: {
          orderBy: { order: "asc" }
        },
        activities: {
          orderBy: { order: "asc" }
        },
        assignments: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    const formatted = sessions.map((sess) => {
      const assignedInstructor = sess.assignments[0]?.instructor || sess.liveCourse.leadInstructor || null;
      const permissions = sess.assignments[0] || null;

      return {
        id: sess.id,
        sessionNumber: sess.sessionNumber,
        title: sess.title,
        description: sess.description,
        date: sess.date,
        startTime: sess.startTime,
        endTime: sess.endTime,
        timezone: sess.timezone,
        duration: sess.duration,
        status: sess.status,
        meetingId: sess.meetingId,
        meetingPasscode: sess.meetingPasscode,
        meetingUrl: sess.meetingUrl,
        recordingUrl: sess.recordingUrl,
        recordingStatus: sess.recordingStatus,
        agendaCount: sess.agenda.length,
        topicsCount: sess.topics.length,
        activitiesCount: sess.activities.length,
        agenda: sess.agenda,
        courseId: sess.liveCourse.id,
        courseTitle: sess.liveCourse.title,
        courseCategory: sess.liveCourse.category,
        courseStatus: sess.liveCourse.status,
        thumbnailGradient: sess.liveCourse.thumbnailGradient,
        assignedInstructor,
        permissions,
        createdAt: sess.createdAt,
        updatedAt: sess.updatedAt
      };
    });

    return NextResponse.json({ sessions: formatted });
  } catch (error: any) {
    console.error("Admin Get Sessions Error:", error);
    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      liveCourseId,
      sessionNumber,
      title,
      description,
      date,
      startTime = "07:00 PM",
      endTime = "09:00 PM",
      timezone = "Asia/Kolkata (IST)",
      duration = "120 min",
      status = "SCHEDULED",
      meetingUrl,
      meetingId,
      passcode,
      meetingPasscode,
      agenda = [],
      topics = [],
      learningOutcomes = [],
      activities = [],
      resources = [],
      homework,
      instructorId,
      instructorPermissions
    } = body;

    if (!liveCourseId || !title) {
      return NextResponse.json({ error: "Live course ID and session title are required" }, { status: 400 });
    }

    const course = await prisma.liveCourse.findUnique({ where: { id: liveCourseId } });
    if (!course) {
      return NextResponse.json({ error: "Live course not found" }, { status: 404 });
    }

    const count = await prisma.liveSession.count({ where: { liveCourseId } });
    const sNum = sessionNumber || count + 1;

    // Generate deterministic Zoom Video SDK session parameters if not provided
    const finalMeetingId = meetingId || crypto.randomUUID();
    const finalPasscode = passcode || meetingPasscode || crypto.randomBytes(4).toString("hex").toUpperCase();

    const createdSession = await prisma.liveSession.create({
      data: {
        liveCourseId,
        sessionNumber: sNum,
        title,
        description: description || "",
        date: date ? new Date(date) : null,
        startTime,
        endTime,
        timezone,
        duration,
        status: status as any,
        meetingId: finalMeetingId,
        meetingPasscode: finalPasscode,
        meetingUrl: meetingUrl || course.meetingUrl || `https://zoom.us/j/${finalMeetingId}`,
        agenda: agenda.length
          ? {
              create: agenda.map((ag: any, i: number) => ({
                title: ag.title,
                description: ag.description || "",
                startTime: ag.startTime || null,
                endTime: ag.endTime || null,
                duration: ag.duration || "15 min",
                order: i + 1
              }))
            }
          : undefined,
        topics: topics.length
          ? {
              create: topics.map((tp: any, i: number) => ({
                title: typeof tp === "string" ? tp : tp.title,
                description: tp.description || "",
                order: i + 1
              }))
            }
          : undefined,
        learningOutcomes: learningOutcomes.length
          ? {
              create: learningOutcomes.map((lo: any, i: number) => ({
                title: typeof lo === "string" ? lo : lo.title,
                order: i + 1
              }))
            }
          : undefined,
        activities: activities.length
          ? {
              create: activities.map((ac: any, i: number) => ({
                title: ac.title,
                instructions: ac.instructions || "",
                duration: ac.duration || "25 min",
                order: i + 1
              }))
            }
          : undefined,
        resources: resources.length
          ? {
              create: resources.map((res: any) => ({
                title: res.title,
                type: res.type || "URL",
                url: res.url
              }))
            }
          : undefined,
        homework: homework?.title
          ? {
              create: [
                {
                  title: homework.title,
                  description: homework.description || "",
                  dueDate: homework.dueDate || null
                }
              ]
            }
          : undefined
      },
      include: {
        agenda: true,
        topics: true,
        activities: true
      }
    });

    // Update total sessions count on course
    await prisma.liveCourse.update({
      where: { id: liveCourseId },
      data: { totalSessions: { increment: 1 } }
    });

    // If specific instructor is assigned to this session
    if (instructorId) {
      await prisma.sessionAssignment.create({
        data: {
          sessionId: createdSession.id,
          liveCourseId,
          instructorId,
          canView: instructorPermissions?.canView ?? true,
          canEdit: instructorPermissions?.canEdit ?? false,
          canEditAgenda: instructorPermissions?.canEditAgenda ?? false,
          canEditSchedule: instructorPermissions?.canEditSchedule ?? false,
          canEditResources: instructorPermissions?.canEditResources ?? false,
          canAddHomework: instructorPermissions?.canAddHomework ?? false,
          canReschedule: instructorPermissions?.canReschedule ?? false,
          canCancel: instructorPermissions?.canCancel ?? false,
          canManageAttendance: instructorPermissions?.canManageAttendance ?? true,
          canManageRecording: instructorPermissions?.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin"
        }
      });

      // Emit Domain Event for Notification Engine
      await emitDomainEvent({
        eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_ASSIGNED,
        actorId: session.id,
        payload: {
          sessionId: createdSession.id,
          sessionTitle: createdSession.title,
          liveCourseId: course.id,
          liveCourseTitle: course.title,
          instructorId,
          sessionNumber: sNum,
          date: date || undefined,
          startTime: startTime || undefined,
          assignedBy: session.name || "Super Admin",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin added Session ${sNum}: "${createdSession.title}" to Live Course "${course.title}"`,
        details: `Session ID: ${createdSession.id}, Date: ${date || "Unscheduled"}`
      }
    });

    return NextResponse.json({ session: createdSession }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Add Session Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}
