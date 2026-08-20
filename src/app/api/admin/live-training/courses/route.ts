import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const courses = await prisma.liveCourse.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true }
        },
        sessions: {
          orderBy: { sessionNumber: "asc" },
          include: {
            assignments: {
              include: {
                instructor: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
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

    const now = new Date();

    const formattedCourses = courses.map((course) => {
      const upcomingSessions = course.sessions.filter(
        (s) => s.date && new Date(s.date) >= now && s.status !== "CANCELLED"
      );
      const nextSession = upcomingSessions.sort(
        (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
      )[0] || null;

      const liveNowSession = course.sessions.find((s) => s.status === "LIVE") || null;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        thumbnailGradient: course.thumbnailGradient,
        category: course.category,
        level: course.level,
        duration: course.duration,
        startDate: course.startDate,
        endDate: course.endDate,
        timezone: course.timezone,
        totalSessions: course.sessions.length,
        maxStudents: course.maxStudents,
        enrolledCount: course.enrolledCount,
        status: course.status,
        leadInstructor: course.leadInstructor,
        meetingPlatform: course.meetingPlatform,
        meetingUrl: course.meetingUrl,
        prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
        objectives: course.objectives ? JSON.parse(course.objectives) : [],
        tags: course.tags ? JSON.parse(course.tags) : [],
        targetAudience: course.targetAudience,
        recordingAvailable: course.recordingAvailable,
        attendanceTracking: course.attendanceTracking,
        visibility: course.visibility,
        sessionsCount: course.sessions.length,
        nextSession: nextSession
          ? {
              id: nextSession.id,
              sessionNumber: nextSession.sessionNumber,
              title: nextSession.title,
              date: nextSession.date,
              startTime: nextSession.startTime,
              endTime: nextSession.endTime,
              status: nextSession.status
            }
          : null,
        isLiveNow: !!liveNowSession,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
    });

    return NextResponse.json({ courses: formattedCourses });
  } catch (error: any) {
    console.error("Admin Live Courses GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch live courses" }, { status: 500 });
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
      title,
      slug,
      shortDescription,
      description,
      category = "Generative AI",
      level = "Intermediate",
      duration,
      startDate,
      endDate,
      timezone = "Asia/Kolkata (IST)",
      maxStudents = 50,
      status = "DRAFT",
      leadInstructorId,
      meetingPlatform = "Zoom",
      meetingUrl,
      prerequisites = [],
      objectives = [],
      tags = [],
      targetAudience,
      thumbnailGradient = "from-purple-900 via-indigo-950 to-slate-950",
      recordingAvailable = true,
      attendanceTracking = true,
      visibility = "PUBLIC",
      sessions = [],
      leadInstructorPermissions = {
        canView: true,
        canEdit: false,
        canEditAgenda: false,
        canEditSchedule: false,
        canEditResources: false,
        canAddHomework: false,
        canReschedule: false,
        canCancel: false,
        canManageAttendance: true,
        canManageRecording: true
      }
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const createdCourse = await prisma.liveCourse.create({
      data: {
        title,
        slug: courseSlug,
        shortDescription,
        description,
        category,
        level,
        duration: duration || `${sessions.length} Live Sessions`,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        timezone,
        totalSessions: sessions.length,
        maxStudents: Number(maxStudents),
        status: status as any,
        leadInstructorId: leadInstructorId || null,
        createdById: session.id,
        meetingPlatform,
        meetingUrl,
        prerequisites: JSON.stringify(prerequisites),
        objectives: JSON.stringify(objectives),
        tags: JSON.stringify(tags),
        targetAudience,
        thumbnailGradient,
        recordingAvailable,
        attendanceTracking,
        visibility,
        sessions: {
          create: sessions.map((s: any, idx: number) => ({
            sessionNumber: s.sessionNumber || idx + 1,
            title: s.title || `Session ${idx + 1}`,
            description: s.description || "",
            date: s.date ? new Date(s.date) : null,
            startTime: s.startTime || "07:00 PM",
            endTime: s.endTime || "09:00 PM",
            timezone: s.timezone || timezone,
            duration: s.duration || "120 min",
            status: (s.status || "SCHEDULED") as any,
            meetingUrl: s.meetingUrl || meetingUrl || null,
            agenda: s.agenda?.length
              ? {
                  create: s.agenda.map((ag: any, agIdx: number) => ({
                    title: ag.title,
                    description: ag.description || "",
                    startTime: ag.startTime || null,
                    endTime: ag.endTime || null,
                    duration: ag.duration || "15 min",
                    order: agIdx + 1
                  }))
                }
              : undefined,
            topics: s.topics?.length
              ? {
                  create: s.topics.map((tp: any, tpIdx: number) => ({
                    title: typeof tp === "string" ? tp : tp.title,
                    description: tp.description || "",
                    order: tpIdx + 1
                  }))
                }
              : undefined,
            learningOutcomes: s.learningOutcomes?.length
              ? {
                  create: s.learningOutcomes.map((lo: any, loIdx: number) => ({
                    title: typeof lo === "string" ? lo : lo.title,
                    order: loIdx + 1
                  }))
                }
              : undefined,
            activities: s.activities?.length
              ? {
                  create: s.activities.map((ac: any, acIdx: number) => ({
                    title: ac.title,
                    instructions: ac.instructions || "",
                    duration: ac.duration || "25 min",
                    order: acIdx + 1
                  }))
                }
              : undefined,
            resources: s.resources?.length
              ? {
                  create: s.resources.map((res: any) => ({
                    title: res.title,
                    type: res.type || "URL",
                    url: res.url
                  }))
                }
              : undefined,
            homework: s.homework?.title
              ? {
                  create: [
                    {
                      title: s.homework.title,
                      description: s.homework.description || "",
                      dueDate: s.homework.dueDate || null
                    }
                  ]
                }
              : undefined
          }))
        }
      },
      include: {
        sessions: true
      }
    });

    // If lead instructor is assigned, create course-level and session-level assignments
    if (leadInstructorId) {
      await prisma.sessionAssignment.create({
        data: {
          liveCourseId: createdCourse.id,
          instructorId: leadInstructorId,
          canView: leadInstructorPermissions.canView ?? true,
          canEdit: leadInstructorPermissions.canEdit ?? false,
          canEditAgenda: leadInstructorPermissions.canEditAgenda ?? false,
          canEditSchedule: leadInstructorPermissions.canEditSchedule ?? false,
          canEditResources: leadInstructorPermissions.canEditResources ?? false,
          canAddHomework: leadInstructorPermissions.canAddHomework ?? false,
          canReschedule: leadInstructorPermissions.canReschedule ?? false,
          canCancel: leadInstructorPermissions.canCancel ?? false,
          canManageAttendance: leadInstructorPermissions.canManageAttendance ?? true,
          canManageRecording: leadInstructorPermissions.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin"
        }
      });

      // Also assign to each individual session
      for (const sess of createdCourse.sessions) {
        await prisma.sessionAssignment.create({
          data: {
            sessionId: sess.id,
            liveCourseId: createdCourse.id,
            instructorId: leadInstructorId,
            canView: leadInstructorPermissions.canView ?? true,
            canEdit: leadInstructorPermissions.canEdit ?? false,
            canEditAgenda: leadInstructorPermissions.canEditAgenda ?? false,
            canEditSchedule: leadInstructorPermissions.canEditSchedule ?? false,
            canEditResources: leadInstructorPermissions.canEditResources ?? false,
            canAddHomework: leadInstructorPermissions.canAddHomework ?? false,
            canReschedule: leadInstructorPermissions.canReschedule ?? false,
            canCancel: leadInstructorPermissions.canCancel ?? false,
            canManageAttendance: leadInstructorPermissions.canManageAttendance ?? true,
            canManageRecording: leadInstructorPermissions.canManageRecording ?? true,
            assignedBy: session.name || "Super Admin"
          }
        });
      }

      // Create notification for instructor
      await prisma.notification.create({
        data: {
          userId: leadInstructorId,
          type: "LIVE_COURSE_ASSIGNED",
          message: `You have been assigned as lead instructor for live course: "${createdCourse.title}". (${createdCourse.sessions.length} live sessions scheduled)`
        }
      });
    }

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin created Live Course: "${createdCourse.title}" [${status}]`,
        details: `Created course with ${createdCourse.sessions.length} sessions, assigned lead instructor: ${leadInstructorId || "None"}. Status: ${status}`
      }
    });

    return NextResponse.json({ course: createdCourse }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Create Live Course Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create live course" }, { status: 500 });
  }
}
