import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instructorId = session.id;

    // Get all assignments for this instructor
    const assignments = await prisma.sessionAssignment.findMany({
      where: { instructorId },
      include: {
        liveCourse: {
          include: {
            leadInstructor: {
              select: { id: true, name: true, email: true }
            },
            sessions: {
              orderBy: { sessionNumber: "asc" },
              include: {
                agenda: { orderBy: { order: "asc" } },
                topics: { orderBy: { order: "asc" } },
                learningOutcomes: { orderBy: { order: "asc" } },
                activities: { orderBy: { order: "asc" } },
                resources: true,
                homework: true,
                assignments: {
                  where: { instructorId }
                }
              }
            }
          }
        },
        session: {
          include: {
            liveCourse: {
              select: {
                id: true,
                title: true,
                category: true,
                thumbnailGradient: true
              }
            },
            agenda: { orderBy: { order: "asc" } },
            topics: { orderBy: { order: "asc" } },
            learningOutcomes: { orderBy: { order: "asc" } },
            activities: { orderBy: { order: "asc" } },
            resources: true,
            homework: true,
            assignments: {
              where: { instructorId }
            }
          }
        }
      }
    });

    // Group into courses and sessions
    const coursesMap = new Map<string, any>();
    const individualSessions: any[] = [];

    assignments.forEach((a) => {
      if (a.liveCourse && !coursesMap.has(a.liveCourse.id)) {
        coursesMap.set(a.liveCourse.id, {
          id: a.liveCourse.id,
          title: a.liveCourse.title,
          slug: a.liveCourse.slug,
          description: a.liveCourse.description,
          category: a.liveCourse.category,
          level: a.liveCourse.level,
          thumbnailGradient: a.liveCourse.thumbnailGradient,
          duration: a.liveCourse.duration,
          status: a.liveCourse.status,
          totalSessions: a.liveCourse.sessions.length,
          coursePermissions: {
            canView: a.canView,
            canEdit: a.canEdit,
            canEditAgenda: a.canEditAgenda,
            canEditSchedule: a.canEditSchedule,
            canEditResources: a.canEditResources,
            canAddHomework: a.canAddHomework,
            canReschedule: a.canReschedule,
            canCancel: a.canCancel,
            canManageAttendance: a.canManageAttendance,
            canManageRecording: a.canManageRecording
          },
          sessions: a.liveCourse.sessions.map((s) => {
            const sessAssign = s.assignments[0] || a;
            return {
              id: s.id,
              sessionNumber: s.sessionNumber,
              title: s.title,
              description: s.description,
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              duration: s.duration,
              status: s.status,
              meetingUrl: s.meetingUrl,
              recordingUrl: s.recordingUrl,
              recordingStatus: s.recordingStatus,
              agenda: s.agenda,
              topics: s.topics,
              learningOutcomes: s.learningOutcomes,
              activities: s.activities,
              resources: s.resources,
              homework: s.homework,
              permissions: {
                canView: sessAssign.canView,
                canEdit: sessAssign.canEdit,
                canEditAgenda: sessAssign.canEditAgenda,
                canEditSchedule: sessAssign.canEditSchedule,
                canEditResources: sessAssign.canEditResources,
                canAddHomework: sessAssign.canAddHomework,
                canReschedule: sessAssign.canReschedule,
                canCancel: sessAssign.canCancel,
                canManageAttendance: sessAssign.canManageAttendance,
                canManageRecording: sessAssign.canManageRecording
              }
            };
          })
        });
      }

      if (a.session && !coursesMap.has(a.session.liveCourseId)) {
        individualSessions.push({
          id: a.session.id,
          sessionNumber: a.session.sessionNumber,
          title: a.session.title,
          description: a.session.description,
          courseId: a.session.liveCourse.id,
          courseTitle: a.session.liveCourse.title,
          date: a.session.date,
          startTime: a.session.startTime,
          endTime: a.session.endTime,
          duration: a.session.duration,
          status: a.session.status,
          meetingUrl: a.session.meetingUrl,
          recordingUrl: a.session.recordingUrl,
          recordingStatus: a.session.recordingStatus,
          agenda: a.session.agenda,
          topics: a.session.topics,
          learningOutcomes: a.session.learningOutcomes,
          activities: a.session.activities,
          resources: a.session.resources,
          homework: a.session.homework,
          permissions: {
            canView: a.canView,
            canEdit: a.canEdit,
            canEditAgenda: a.canEditAgenda,
            canEditSchedule: a.canEditSchedule,
            canEditResources: a.canEditResources,
            canAddHomework: a.canAddHomework,
            canReschedule: a.canReschedule,
            canCancel: a.canCancel,
            canManageAttendance: a.canManageAttendance,
            canManageRecording: a.canManageRecording
          }
        });
      }
    });

    return NextResponse.json({
      courses: Array.from(coursesMap.values()),
      individualSessions
    });
  } catch (error: any) {
    console.error("Instructor Live Sessions Error:", error);
    return NextResponse.json({ error: "Failed to fetch instructor live sessions" }, { status: 500 });
  }
}
