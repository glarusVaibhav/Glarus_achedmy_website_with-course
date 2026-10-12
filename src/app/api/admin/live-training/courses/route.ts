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

    const courseSlug = slug || (typeof title === "string" ? title : String(title)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const normalizedDescription = Array.isArray(description)
      ? description.join("\n\n")
      : typeof description === "object" && description !== null
      ? JSON.stringify(description)
      : String(description || "");

    const normalizedShortDescription = Array.isArray(shortDescription)
      ? shortDescription.join(" ")
      : typeof shortDescription === "object" && shortDescription !== null
      ? JSON.stringify(shortDescription)
      : (shortDescription || null);

    const normalizedSubtitle = Array.isArray(subtitle)
      ? subtitle.join(" ")
      : typeof subtitle === "object" && subtitle !== null
      ? JSON.stringify(subtitle)
      : (subtitle || null);

    const normalizedTargetAudience = Array.isArray(targetAudience)
      ? targetAudience.join(", ")
      : typeof targetAudience === "object" && targetAudience !== null
      ? JSON.stringify(targetAudience)
      : targetAudience || null;

    const normalizedCohortLeadBio = Array.isArray(cohortLeadBio)
      ? cohortLeadBio.join("\n\n")
      : typeof cohortLeadBio === "object" && cohortLeadBio !== null
      ? JSON.stringify(cohortLeadBio)
      : cohortLeadBio || null;

    const createdCourse = await prisma.liveCourse.create({
      data: {
        title: typeof title === "string" ? title : String(title),
        slug: courseSlug,
        shortDescription: normalizedShortDescription,
        subtitle: normalizedSubtitle,
        description: normalizedDescription,
        price: Number(price) || 14999,
        originalPrice: originalPrice ? Number(originalPrice) : 24999,
        previewVideoUrl: previewVideoUrl || null,
        learningOutcomes: typeof learningOutcomes === "object" ? JSON.stringify(learningOutcomes) : (learningOutcomes || null),
        projects: typeof projects === "object" ? JSON.stringify(projects) : (projects || null),
        faqs: typeof faqs === "object" ? JSON.stringify(faqs) : (faqs || null),
        features: typeof features === "object" ? JSON.stringify(features) : (features || null),
        learningJourney: typeof learningJourney === "object" ? JSON.stringify(learningJourney) : (learningJourney || null),
        batches: typeof batches === "object" ? JSON.stringify(batches) : (batches || null),
        cohortLeadBio: normalizedCohortLeadBio,
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
            const sessDesc = Array.isArray(s.description)
              ? s.description.join("\n\n")
              : typeof s.description === "object" && s.description !== null
              ? JSON.stringify(s.description)
              : (s.description || "");

            const finalMeetingId = s.meetingId || s.zoomMeetingId || crypto.randomUUID();
            const finalPasscode = s.meetingPasscode || s.passcode || s.zoomPasscode || crypto.randomBytes(4).toString("hex").toUpperCase();
            const finalMeetingUrl = s.meetingUrl || meetingUrl || `https://zoom.us/j/${finalMeetingId}`;

            return {
              sessionNumber: s.sessionNumber || idx + 1,
              title: typeof s.title === "string" ? s.title : (s.title?.title || `Session ${idx + 1}`),
              description: sessDesc,
              date: s.date ? new Date(s.date) : null,
              startTime: s.startTime || "07:00 PM",
              endTime: s.endTime || "09:00 PM",
              timezone: s.timezone || timezone,
              duration: s.duration || "120 min",
              status: (s.status || "SCHEDULED") as any,
              meetingId: finalMeetingId,
              meetingPasscode: finalPasscode,
              meetingUrl: finalMeetingUrl,
              recordingUrl: s.videoUrl || s.recordingUrl || null,
              recordingStatus: s.recordingStatus || (s.videoUrl || s.recordingUrl ? "available" : "unavailable"),
              agenda: s.agenda?.length
                ? {
                    create: s.agenda.map((ag: any, agIdx: number) => ({
                      title: typeof ag === "string" ? ag : (ag.title || `Agenda item ${agIdx + 1}`),
                      description: Array.isArray(ag.description)
                        ? ag.description.join("\n")
                        : typeof ag.description === "object" && ag.description !== null
                        ? JSON.stringify(ag.description)
                        : (ag.description || ""),
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
                      title: typeof tp === "string" ? tp : (tp.title || tp.name || `Topic ${tpIdx + 1}`),
                      description: Array.isArray(tp?.description)
                        ? tp.description.join("\n")
                        : typeof tp?.description === "object" && tp?.description !== null
                        ? JSON.stringify(tp.description)
                        : (tp?.description || ""),
                      order: tpIdx + 1
                    }))
                  }
                : undefined,
              learningOutcomes: s.learningOutcomes?.length
                ? {
                    create: s.learningOutcomes.map((lo: any, loIdx: number) => ({
                      title: typeof lo === "string" ? lo : (lo.title || lo.description || lo.outcome || `Outcome ${loIdx + 1}`),
                      order: loIdx + 1
                    }))
                  }
                : undefined,
              activities: s.activities?.length
                ? {
                    create: s.activities.map((ac: any, acIdx: number) => ({
                      title: typeof ac === "string" ? ac : (ac.title || `Activity ${acIdx + 1}`),
                      instructions: Array.isArray(ac.instructions)
                        ? ac.instructions.join("\n")
                        : typeof ac.instructions === "object" && ac.instructions !== null
                        ? JSON.stringify(ac.instructions)
                        : (ac.instructions || ""),
                      duration: ac.duration || "25 min",
                      order: acIdx + 1
                    }))
                  }
                : undefined,
              resources: s.resources?.length
                ? {
                    create: s.resources.filter((res: any) => res && (res.title || res.url)).map((res: any) => ({
                      title: typeof res.title === "string" ? res.title : "Resource",
                      type: res.type || "URL",
                      url: res.url || "#"
                    }))
                  }
                : undefined,
              homework: (() => {
                const homeworkList: any[] = Array.isArray(s.homework)
                  ? s.homework
                  : s.homework && typeof s.homework === "object"
                  ? [s.homework]
                  : [];

                const homeworkRecords: any[] = [];
                for (const hw of homeworkList) {
                  if (hw && (hw.title || hw.description)) {
                    homeworkRecords.push({
                      title: typeof hw.title === "string" ? hw.title : "Homework",
                      description: Array.isArray(hw.description)
                        ? hw.description.join("\n")
                        : typeof hw.description === "object" && hw.description !== null
                        ? JSON.stringify(hw.description)
                        : String(hw.description || ""),
                      dueDate: typeof hw.dueDate === "string" ? hw.dueDate : null
                    });
                  }
                }

                if (s.assignment && (s.assignment.title || s.assignment.description || s.assignment.instructions)) {
                  const asgnDesc = Array.isArray(s.assignment.instructions || s.assignment.description)
                    ? (s.assignment.instructions || s.assignment.description).join("\n")
                    : typeof (s.assignment.instructions || s.assignment.description) === "object" && (s.assignment.instructions || s.assignment.description) !== null
                    ? JSON.stringify(s.assignment.instructions || s.assignment.description)
                    : String(s.assignment.instructions || s.assignment.description || "");

                  // Avoid exact duplicates if homework already contains this
                  if (!homeworkRecords.some((hr) => hr.title === s.assignment.title)) {
                    homeworkRecords.push({
                      title: typeof s.assignment.title === "string" ? s.assignment.title : "Assignment",
                      description: asgnDesc,
                      dueDate: typeof s.assignment.dueDate === "string" ? s.assignment.dueDate : null
                    });
                  }
                }

                if (s.quizzes?.length) {
                  homeworkRecords.push({
                    title: `Session ${s.sessionNumber || idx + 1} Knowledge Check Quiz (${s.quizzes.length} Questions)`,
                    description: JSON.stringify(s.quizzes),
                    dueDate: "Post Session"
                  });
                }

                return homeworkRecords.length ? { create: homeworkRecords } : undefined;
              })()
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

    // Create database Assignment records for sessions that have assignments configured
    for (let i = 0; i < createdCourse.sessions.length; i++) {
      const dbSess = createdCourse.sessions[i];
      const sessInput = sessions[i];
      const assInput = sessInput?.assignment;

      if (assInput && (assInput.title || assInput.description || assInput.fileUrl)) {
        const dueDate = assInput.dueDate
          ? new Date(assInput.dueDate)
          : dbSess.date
          ? new Date(new Date(dbSess.date).getTime() + (assInput.daysAfterSession || 7) * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const rawInstructions = Array.isArray(assInput.instructions)
          ? assInput.instructions
          : typeof assInput.instructions === "string"
          ? [assInput.instructions]
          : [];

        const instructionsList: string[] = rawInstructions.map((inst: any) =>
          typeof inst === "string" ? inst : JSON.stringify(inst)
        );

        if (assInput.externalStarterUrl) {
          instructionsList.push(`Starter Repository / Colab: ${assInput.externalStarterUrl}`);
        }
        if (assInput.fileName) {
          instructionsList.push(`Assignment Attachment: ${assInput.fileName}`);
        }

        const assDesc = Array.isArray(assInput.description)
          ? assInput.description.join("\n\n")
          : typeof assInput.description === "object" && assInput.description !== null
          ? JSON.stringify(assInput.description)
          : (assInput.description || "Complete the session practical assignment and submit deliverables.");

        await prisma.assignment.create({
          data: {
            liveCourseId: createdCourse.id,
            sessionId: dbSess.id,
            title: typeof assInput.title === "string" ? assInput.title : `Session ${dbSess.sessionNumber} Assignment`,
            description: assDesc,
            moduleName: dbSess.title,
            instructions: instructionsList,
            totalMarks: Number(assInput.totalMarks) || 100,
            pointsLabel: `${Number(assInput.totalMarks) || 100} Pts`,
            dueDate
          }
        });
      }
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
