import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";
import crypto from "crypto";

function safeJsonParse(val: string | null | undefined, fallback: any = []) {
  if (!val) return fallback;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return typeof val === "string" ? [val] : fallback;
  }
}

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
        registrationStartDate: course.registrationStartDate,
        registrationEndDate: course.registrationEndDate,
        timezone: course.timezone,
        totalSessions: course.sessions.length,
        maxStudents: course.maxStudents,
        enrolledCount: course.enrolledCount,
        status: course.status,
        leadInstructor: course.leadInstructor,
        meetingPlatform: course.meetingPlatform,
        meetingUrl: course.meetingUrl,
        prerequisites: safeJsonParse(course.prerequisites),
        objectives: safeJsonParse(course.objectives),
        tags: safeJsonParse(course.tags),
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
        sessions: course.sessions.map((s) => ({
          id: s.id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          description: s.description,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
          duration: s.duration,
          meetingId: s.meetingId,
          meetingPasscode: s.meetingPasscode,
          meetingUrl: s.meetingUrl,
          assignments: s.assignments
        })),
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
      subtitle,
      description,
      price = 14999,
      originalPrice = 24999,
      previewVideoUrl,
      learningOutcomes,
      projects,
      faqs,
      features,
      learningJourney,
      batches,
      cohortLeadBio,
      heroBadges,
      category = "Generative AI",
      level = "Intermediate",
      duration,
      startDate,
      endDate,
      registrationStartDate,
      registrationEndDate,
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

    const normalizedTargetAudience = Array.isArray(targetAudience)
      ? targetAudience.join(", ")
      : typeof targetAudience === "object" && targetAudience !== null
      ? JSON.stringify(targetAudience)
      : targetAudience || null;

    const createdCourse = await prisma.liveCourse.create({
      data: {
        title,
        slug: courseSlug,
        shortDescription: typeof shortDescription === "object" ? JSON.stringify(shortDescription) : (shortDescription || null),
        subtitle: typeof subtitle === "object" ? JSON.stringify(subtitle) : (subtitle || null),
        description,
        price: Number(price) || 14999,
        originalPrice: originalPrice ? Number(originalPrice) : 24999,
        previewVideoUrl: previewVideoUrl || null,
        learningOutcomes: typeof learningOutcomes === "object" ? JSON.stringify(learningOutcomes) : (learningOutcomes || null),
        projects: typeof projects === "object" ? JSON.stringify(projects) : (projects || null),
        faqs: typeof faqs === "object" ? JSON.stringify(faqs) : (faqs || null),
        features: typeof features === "object" ? JSON.stringify(features) : (features || null),
        learningJourney: typeof learningJourney === "object" ? JSON.stringify(learningJourney) : (learningJourney || null),
        batches: typeof batches === "object" ? JSON.stringify(batches) : (batches || null),
        cohortLeadBio: typeof cohortLeadBio === "object" ? JSON.stringify(cohortLeadBio) : (cohortLeadBio || null),
        heroBadges: typeof heroBadges === "object" ? JSON.stringify(heroBadges) : (heroBadges || null),
        category: category || "Generative AI",
        level: level || "Intermediate",
        duration: duration || `${sessions.length || 0} Live Sessions`,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : null,
        registrationEndDate: registrationEndDate ? new Date(registrationEndDate) : null,
        timezone: timezone || "Asia/Kolkata (IST)",
        totalSessions: sessions.length,
        maxStudents: Number(maxStudents) || 50,
        status: status as any,
        leadInstructorId: leadInstructorId || null,
        createdById: session.id,
        meetingPlatform: meetingPlatform || "Zoom",
        meetingUrl: meetingUrl || null,
        prerequisites: typeof prerequisites === "object" ? JSON.stringify(prerequisites) : (prerequisites || "[]"),
        objectives: typeof objectives === "object" ? JSON.stringify(objectives) : (objectives || "[]"),
        tags: typeof tags === "object" ? JSON.stringify(tags) : (tags || "[]"),
        targetAudience: normalizedTargetAudience,
        thumbnailGradient: typeof thumbnailGradient === "string" ? thumbnailGradient : "from-purple-900 via-indigo-950 to-slate-950",
        recordingAvailable: recordingAvailable !== false,
        attendanceTracking: attendanceTracking !== false,
        visibility: visibility || "PUBLIC",
        sessions: {
          create: sessions.map((s: any, idx: number) => {
            const finalMeetingId = s.meetingId || s.zoomMeetingId || crypto.randomUUID();
            const finalPasscode = s.meetingPasscode || s.passcode || s.zoomPasscode || crypto.randomBytes(4).toString("hex").toUpperCase();
            const finalMeetingUrl = s.meetingUrl || meetingUrl || `https://zoom.us/j/${finalMeetingId}`;

            return {
              sessionNumber: s.sessionNumber || idx + 1,
              title: s.title || `Session ${idx + 1}`,
              description: s.description || "",
              date: s.date ? new Date(s.date) : null,
              startTime: s.startTime || "07:00 PM",
              endTime: s.endTime || "09:00 PM",
              timezone: s.timezone || timezone,
              duration: s.duration || "120 min",
              status: (s.status || "SCHEDULED") as any,
              meetingId: finalMeetingId,
              meetingPasscode: finalPasscode,
              meetingUrl: finalMeetingUrl,
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
            };
          })
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

      // Emit Domain Event for Notification Engine
      await emitDomainEvent({
        eventType: DOMAIN_EVENT_TYPES.LIVE_COURSE_ASSIGNED,
        actorId: session.id,
        payload: {
          liveCourseId: createdCourse.id,
          liveCourseTitle: createdCourse.title,
          instructorId: leadInstructorId,
          assignedBy: session.name || "Super Admin",
          totalSessions: createdCourse.sessions.length,
        },
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
