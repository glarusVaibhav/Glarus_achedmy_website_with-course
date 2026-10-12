import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/instructorPermissions";
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

/**
 * GET — List all live courses created or led by the current instructor
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {
      OR: [
        { leadInstructorId: session.id },
        { createdById: session.id },
        {
          sessions: {
            some: {
              assignments: {
                some: { instructorId: session.id }
              }
            }
          }
        }
      ]
    };

    if (status && status !== "ALL") {
      where.status = status;
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
        }
      }
    });

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      description: c.description,
      thumbnailGradient: c.thumbnailGradient,
      category: c.category,
      level: c.level,
      duration: c.duration,
      startDate: c.startDate,
      endDate: c.endDate,
      timezone: c.timezone,
      totalSessions: c.sessions.length,
      maxStudents: c.maxStudents,
      enrolledCount: c.enrolledCount,
      status: c.status,
      meetingPlatform: c.meetingPlatform,
      meetingUrl: c.meetingUrl,
      sessionsCount: c.sessions.length,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error: any) {
    console.error("GET /api/instructor/live-courses error:", error);
    return NextResponse.json({ error: "Failed to fetch instructor live courses" }, { status: 500 });
  }
}

/**
 * POST — Instructor creates a new Live Class & scheduled sessions
 * Auto-assigns instructor as lead instructor & host, and notifies Admins for approval.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Instructor role required." }, { status: 403 });
    }

    // Check LIVE_CLASS_CREATE permission
    const allowed = await hasPermission(session, "LIVE_CLASS_CREATE");
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Permission Denied: You do not have 'LIVE_CLASS_CREATE' authority. Please request permission from Administrator."
        },
        { status: 403 }
      );
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
      sessions = []
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const courseSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const normalizedTargetAudience = Array.isArray(targetAudience)
      ? targetAudience.join(", ")
      : typeof targetAudience === "object" && targetAudience !== null
      ? JSON.stringify(targetAudience)
      : targetAudience || null;

    // Create live course with instructor default assigned as lead instructor & creator
    const createdCourse = await prisma.liveCourse.create({
      data: {
        title,
        slug: courseSlug,
        shortDescription: typeof shortDescription === "object" ? JSON.stringify(shortDescription) : shortDescription || null,
        subtitle: typeof subtitle === "object" ? JSON.stringify(subtitle) : subtitle || null,
        description,
        price: Number(price) || 14999,
        originalPrice: originalPrice ? Number(originalPrice) : 24999,
        previewVideoUrl: previewVideoUrl || null,
        learningOutcomes: typeof learningOutcomes === "object" ? JSON.stringify(learningOutcomes) : learningOutcomes || null,
        projects: typeof projects === "object" ? JSON.stringify(projects) : projects || null,
        faqs: typeof faqs === "object" ? JSON.stringify(faqs) : faqs || null,
        features: typeof features === "object" ? JSON.stringify(features) : features || null,
        learningJourney: typeof learningJourney === "object" ? JSON.stringify(learningJourney) : learningJourney || null,
        batches: typeof batches === "object" ? JSON.stringify(batches) : batches || null,
        cohortLeadBio: typeof cohortLeadBio === "object" ? JSON.stringify(cohortLeadBio) : cohortLeadBio || null,
        heroBadges: typeof heroBadges === "object" ? JSON.stringify(heroBadges) : heroBadges || null,
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
        status: status as any, // Initial status DRAFT or READY_TO_PUBLISH pending Admin approval
        isPublished: false,
        leadInstructorId: session.id, // DEFAULT ASSIGNED TO CURRENT INSTRUCTOR
        createdById: session.id,
        meetingPlatform: meetingPlatform || "Zoom",
        meetingUrl: meetingUrl || null,
        prerequisites: typeof prerequisites === "object" ? JSON.stringify(prerequisites) : prerequisites || "[]",
        objectives: typeof objectives === "object" ? JSON.stringify(objectives) : objectives || "[]",
        tags: typeof tags === "object" ? JSON.stringify(tags) : tags || "[]",
        targetAudience: normalizedTargetAudience,
        thumbnailGradient: typeof thumbnailGradient === "string" ? thumbnailGradient : "from-purple-900 via-indigo-950 to-slate-950",
        recordingAvailable: recordingAvailable !== false,
        attendanceTracking: attendanceTracking !== false,
        visibility: visibility || "PUBLIC",
        sessions: {
          create: sessions.map((s: any, idx: number) => {
            const finalMeetingId = s.meetingId || s.zoomMeetingId || crypto.randomUUID();
            const finalPasscode =
              s.meetingPasscode ||
              s.passcode ||
              s.zoomPasscode ||
              crypto.randomBytes(4).toString("hex").toUpperCase();
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
                      description: typeof tp === "object" ? tp.description || "" : "",
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
                    create: s.activities.map((act: any, actIdx: number) => ({
                      title: act.title,
                      instructions: act.instructions || "",
                      duration: act.duration || "30 min",
                      order: actIdx + 1
                    }))
                  }
                : undefined,
              resources: s.resources?.length
                ? {
                    create: s.resources.map((res: any) => ({
                      title: res.title,
                      type: res.type || "PDF",
                      url: res.url
                    }))
                  }
                : undefined,
              homework: s.homework
                ? {
                    create: {
                      title: s.homework.title || "Session Homework Assignment",
                      description: s.homework.description || "",
                      dueDate: s.homework.dueDate ? new Date(s.homework.dueDate) : null
                    }
                  }
                : undefined,
              // Default session assignment assigning creating instructor
              assignments: {
                create: {
                  instructorId: session.id,
                  liveCourseId: "", // Prisma handles relation
                  canEditAgenda: true,
                  canEditSchedule: true,
                  canEditResources: true,
                  canAddHomework: true,
                  canReschedule: true,
                  canManageAttendance: true,
                  canManageRecording: true,
                  status: "ASSIGNED"
                }
              }
            };
          })
        }
      },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true }
        },
        sessions: true
      }
    });

    // Create Assignment records for sessions that have assignments configured
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

        const instructionsList = Array.isArray(assInput.instructions)
          ? assInput.instructions
          : typeof assInput.instructions === "string"
          ? [assInput.instructions]
          : [];

        if (assInput.externalStarterUrl) {
          instructionsList.push(`Starter Repository / Colab: ${assInput.externalStarterUrl}`);
        }
        if (assInput.fileName) {
          instructionsList.push(`Assignment Attachment: ${assInput.fileName}`);
        }

        await prisma.assignment.create({
          data: {
            liveCourseId: createdCourse.id,
            sessionId: dbSess.id,
            title: assInput.title || `Session ${dbSess.sessionNumber} Assignment`,
            description: assInput.description || "Complete the session practical assignment and submit deliverables.",
            moduleName: dbSess.title,
            instructions: instructionsList,
            totalMarks: Number(assInput.totalMarks) || 100,
            pointsLabel: `${Number(assInput.totalMarks) || 100} Pts`,
            dueDate
          }
        });
      }
    }

    // Dispatch notification to all active Administrators for quality review & approval
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true }
      });

      const instructorName = session.name || session.email || "Instructor";

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          recipientId: admin.id,
          actorId: session.id,
          type: "COURSE_SUBMITTED_FOR_REVIEW",
          category: "COURSE",
          priority: "HIGH",
          title: `New Live Class Submitted for Approval: ${title}`,
          message: `${instructorName} has created a new Live Class "${title}" (${sessions.length} sessions) and submitted it for Administrator approval.`,
          actionUrl: `/admin/instructors/${session.id}`,
          metadata: JSON.stringify({
            liveCourseId: createdCourse.id,
            courseTitle: title,
            instructorId: session.id,
            instructorName,
            totalSessions: sessions.length
          })
        }))
      });
    } catch (notifErr) {
      console.warn("Could not dispatch admin notifications:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Live Class "${title}" created and submitted for Administrator approval!`,
      course: createdCourse
    });
  } catch (error: any) {
    console.error("POST /api/instructor/live-courses error:", error);
    return NextResponse.json(
      { error: "Failed to create live class", details: error?.message },
      { status: 500 }
    );
  }
}
