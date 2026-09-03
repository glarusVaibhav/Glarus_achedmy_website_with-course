import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const instructorId = searchParams.get("instructorId");

    const where: any = {};
    if (courseId) where.liveCourseId = courseId;
    if (instructorId) where.instructorId = instructorId;

    const assignments = await prisma.sessionAssignment.findMany({
      where,
      orderBy: { assignedAt: "desc" },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            instructorProfile: true
          }
        },
        liveCourse: {
          select: {
            id: true,
            title: true,
            category: true,
            thumbnailGradient: true,
            status: true
          }
        },
        session: {
          select: {
            id: true,
            sessionNumber: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            duration: true
          }
        }
      }
    });

    // Also get all available instructors for assignment dropdowns
    const instructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR", status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        instructorProfile: true,
        instructorApproval: {
          select: {
            skills: true,
            areasOfExpertise: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ assignments, instructors });
  } catch (error: any) {
    console.error("Admin Get Assignments Error:", error);
    return NextResponse.json({ error: "Failed to fetch instructor assignments" }, { status: 500 });
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
      type = "SESSION", // "COURSE" | "SESSION" | "BULK_COURSE_PERMISSIONS" | "CHANGE_LEAD"
      liveCourseId,
      sessionId,
      instructorId,
      targetInstructorId,
      assignToAllSessions = true,
      overwriteExisting = true,
      reassignReason = "",
      permissions = {
        canView: true,
        canEdit: true,
        canEditAgenda: true,
        canEditSchedule: true,
        canEditResources: true,
        canAddHomework: true,
        canReschedule: true,
        canCancel: false,
        canManageAttendance: true,
        canManageRecording: true
      }
    } = body;

    if (!liveCourseId) {
      return NextResponse.json({ error: "Live Course ID is required" }, { status: 400 });
    }

    const course = await prisma.liveCourse.findUnique({
      where: { id: liveCourseId },
      include: {
        sessions: {
          orderBy: { sessionNumber: "asc" }
        },
        leadInstructor: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Live Course not found" }, { status: 404 });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 1: BULK PERMISSION UPDATE ACROSS ALL SESSIONS OF A COURSE
    // ─────────────────────────────────────────────────────────────
    if (type === "BULK_COURSE_PERMISSIONS" || type === "COURSE_PERMISSIONS") {
      const whereCondition: any = { liveCourseId };
      if (targetInstructorId && targetInstructorId !== "ALL") {
        whereCondition.instructorId = targetInstructorId;
      }

      // Update all session assignments for this course
      const updatedBatch = await prisma.sessionAssignment.updateMany({
        where: whereCondition,
        data: {
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? true,
          canEditAgenda: permissions.canEditAgenda ?? true,
          canEditSchedule: permissions.canEditSchedule ?? false,
          canEditResources: permissions.canEditResources ?? true,
          canAddHomework: permissions.canAddHomework ?? true,
          canReschedule: permissions.canReschedule ?? false,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin updated permissions for all sessions in Live Course: "${course.title}"`,
          details: `Updated ${updatedBatch.count} session assignments. canEdit=${permissions.canEdit}, canEditSchedule=${permissions.canEditSchedule}, canReschedule=${permissions.canReschedule}`
        }
      });

      // Notify unique instructors in this course via Domain Event
      const allCourseAssignments = await prisma.sessionAssignment.findMany({
        where: whereCondition,
        select: { id: true, instructorId: true },
        distinct: ["instructorId"]
      });

      for (const item of allCourseAssignments) {
        await emitDomainEvent({
          eventType: DOMAIN_EVENT_TYPES.PERMISSIONS_UPDATED,
          actorId: session.id,
          payload: {
            assignmentId: item.id,
            liveCourseId: course.id,
            targetTitle: course.title,
            instructorId: item.instructorId,
            permissions,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Updated permissions for ${updatedBatch.count} session assignments in "${course.title}"`,
        count: updatedBatch.count
      });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: ASSIGN LEAD INSTRUCTOR / CHANGE LEAD & APPLY TO SESSIONS
    // ─────────────────────────────────────────────────────────────
    if (type === "COURSE" || type === "CHANGE_LEAD") {
      if (!instructorId) {
        return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 });
      }

      const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
      if (!instructor) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
      }

      // Update lead instructor on the Live Course record
      await prisma.liveCourse.update({
        where: { id: liveCourseId },
        data: { leadInstructorId: instructorId }
      });

      // Upsert course-level assignment
      await prisma.sessionAssignment.deleteMany({
        where: { liveCourseId, sessionId: null, instructorId }
      });

      const courseAssignment = await prisma.sessionAssignment.create({
        data: {
          liveCourseId,
          instructorId,
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? true,
          canEditAgenda: permissions.canEditAgenda ?? true,
          canEditSchedule: permissions.canEditSchedule ?? true,
          canEditResources: permissions.canEditResources ?? true,
          canAddHomework: permissions.canAddHomework ?? true,
          canReschedule: permissions.canReschedule ?? true,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin"
        }
      });

      // If assignToAllSessions is true, assign to all sessions of this class
      if (assignToAllSessions && course.sessions.length > 0) {
        for (const sess of course.sessions) {
          if (overwriteExisting) {
            // Remove previous assignments for this session to make the lead the dedicated instructor
            await prisma.sessionAssignment.deleteMany({
              where: { sessionId: sess.id }
            });
          } else {
            // Only remove if this instructor already had an assignment
            await prisma.sessionAssignment.deleteMany({
              where: { sessionId: sess.id, instructorId }
            });
          }

          // Create new session assignment for the lead instructor
          await prisma.sessionAssignment.create({
            data: {
              sessionId: sess.id,
              liveCourseId,
              instructorId,
              canView: permissions.canView ?? true,
              canEdit: permissions.canEdit ?? true,
              canEditAgenda: permissions.canEditAgenda ?? true,
              canEditSchedule: permissions.canEditSchedule ?? true,
              canEditResources: permissions.canEditResources ?? true,
              canAddHomework: permissions.canAddHomework ?? true,
              canReschedule: permissions.canReschedule ?? true,
              canCancel: permissions.canCancel ?? false,
              canManageAttendance: permissions.canManageAttendance ?? true,
              canManageRecording: permissions.canManageRecording ?? true,
              assignedBy: session.name || "Super Admin"
            }
          });
        }
      }

      await emitDomainEvent({
        eventType: DOMAIN_EVENT_TYPES.LIVE_COURSE_ASSIGNED,
        actorId: session.id,
        payload: {
          liveCourseId: course.id,
          liveCourseTitle: course.title,
          instructorId,
          assignedBy: session.name || "Super Admin",
          totalSessions: course.sessions.length,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin assigned ${instructor.name} as Lead Instructor for "${course.title}"`,
          details: `Assigned to all ${course.sessions.length} sessions: ${assignToAllSessions}. Overwrite: ${overwriteExisting}. Reason: ${reassignReason || "Lead mentor assignment"}. Permissions: canEdit=${permissions.canEdit}`
        }
      });

      return NextResponse.json({
        success: true,
        message: `Lead mentor ${instructor.name} successfully assigned to "${course.title}" and all sessions!`,
        assignment: courseAssignment
      });
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 3: INDIVIDUAL SESSION ASSIGNMENT
    // ─────────────────────────────────────────────────────────────
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required for session assignment" }, { status: 400 });
    }

    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 });
    }

    const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const targetSession = await prisma.liveSession.findUnique({ where: { id: sessionId } });
    if (!targetSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const existing = await prisma.sessionAssignment.findFirst({
      where: { sessionId, instructorId }
    });

    let assignment;
    if (existing) {
      assignment = await prisma.sessionAssignment.update({
        where: { id: existing.id },
        data: {
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? true,
          canEditAgenda: permissions.canEditAgenda ?? true,
          canEditSchedule: permissions.canEditSchedule ?? false,
          canEditResources: permissions.canEditResources ?? true,
          canAddHomework: permissions.canAddHomework ?? true,
          canReschedule: permissions.canReschedule ?? false,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin",
          assignedAt: new Date()
        }
      });
    } else {
      assignment = await prisma.sessionAssignment.create({
        data: {
          sessionId,
          liveCourseId,
          instructorId,
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? true,
          canEditAgenda: permissions.canEditAgenda ?? true,
          canEditSchedule: permissions.canEditSchedule ?? false,
          canEditResources: permissions.canEditResources ?? true,
          canAddHomework: permissions.canAddHomework ?? true,
          canReschedule: permissions.canReschedule ?? false,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin"
        }
      });
    }

    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_ASSIGNED,
      actorId: session.id,
      payload: {
        sessionId: targetSession.id,
        sessionTitle: targetSession.title,
        liveCourseId: course.id,
        liveCourseTitle: course.title,
        instructorId,
        sessionNumber: targetSession.sessionNumber,
        date: targetSession.date,
        startTime: targetSession.startTime,
        assignedBy: session.name || "Super Admin",
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin assigned ${instructor.name} to Session ${targetSession.sessionNumber}: "${targetSession.title}"`,
        details: `Course: ${course.title}. Permissions: canEdit=${permissions.canEdit}, canEditAgenda=${permissions.canEditAgenda}`
      }
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("Admin Create Assignment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create assignment" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      assignmentId,
      liveCourseId,
      newInstructorId,
      reassignReason,
      permissions
    } = body;

    // Bulk Course Permissions Update via PUT
    if (liveCourseId && permissions && !assignmentId) {
      const updated = await prisma.sessionAssignment.updateMany({
        where: { liveCourseId },
        data: {
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? true,
          canEditAgenda: permissions.canEditAgenda ?? true,
          canEditSchedule: permissions.canEditSchedule ?? false,
          canEditResources: permissions.canEditResources ?? true,
          canAddHomework: permissions.canAddHomework ?? true,
          canReschedule: permissions.canReschedule ?? false,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true
        }
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin updated permissions for all sessions in Live Course ID: ${liveCourseId}`,
          details: `Updated ${updated.count} assignments.`
        }
      });

      return NextResponse.json({ success: true, count: updated.count });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID or Live Course ID is required" }, { status: 400 });
    }

    const currentAssignment = await prisma.sessionAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        instructor: true,
        session: { include: { liveCourse: true } },
        liveCourse: true
      }
    });

    if (!currentAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Reassignment (changing instructor from Current -> New)
    if (newInstructorId && newInstructorId !== currentAssignment.instructorId) {
      const newInstructor = await prisma.user.findUnique({ where: { id: newInstructorId } });
      if (!newInstructor) {
        return NextResponse.json({ error: "New instructor not found" }, { status: 404 });
      }

      const updatedAssignment = await prisma.sessionAssignment.update({
        where: { id: assignmentId },
        data: {
          instructorId: newInstructorId,
          canView: permissions?.canView ?? currentAssignment.canView,
          canEdit: permissions?.canEdit ?? currentAssignment.canEdit,
          canEditAgenda: permissions?.canEditAgenda ?? currentAssignment.canEditAgenda,
          canEditSchedule: permissions?.canEditSchedule ?? currentAssignment.canEditSchedule,
          canEditResources: permissions?.canEditResources ?? currentAssignment.canEditResources,
          canAddHomework: permissions?.canAddHomework ?? currentAssignment.canAddHomework,
          canReschedule: permissions?.canReschedule ?? currentAssignment.canReschedule,
          canCancel: permissions?.canCancel ?? currentAssignment.canCancel,
          canManageAttendance: permissions?.canManageAttendance ?? currentAssignment.canManageAttendance,
          canManageRecording: permissions?.canManageRecording ?? currentAssignment.canManageRecording,
          assignedBy: session.name || "Super Admin",
          assignedAt: new Date()
        }
      });

      // Record in SessionChangeHistory if this is a session assignment
      if (currentAssignment.sessionId) {
        await prisma.sessionChangeHistory.create({
          data: {
            sessionId: currentAssignment.sessionId,
            changedBy: session.name || "Super Admin",
            changeType: "INSTRUCTOR_REASSIGNED",
            previousValue: `${currentAssignment.instructor.name} (${currentAssignment.instructor.email})`,
            newValue: `${newInstructor.name} (${newInstructor.email})`,
            reason: reassignReason || "Administrative reassignment"
          }
        });
      }

      // Notify new instructor via Domain Event
      if (currentAssignment.sessionId && currentAssignment.session) {
        await emitDomainEvent({
          eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_ASSIGNED,
          actorId: session.id,
          payload: {
            sessionId: currentAssignment.sessionId,
            sessionTitle: currentAssignment.session.title,
            liveCourseId: currentAssignment.liveCourseId || "",
            liveCourseTitle: currentAssignment.session.liveCourse?.title || "",
            instructorId: newInstructorId,
            sessionNumber: currentAssignment.session.sessionNumber,
            assignedBy: session.name || "Super Admin",
          },
        });
      } else if (currentAssignment.liveCourseId && currentAssignment.liveCourse) {
        await emitDomainEvent({
          eventType: DOMAIN_EVENT_TYPES.LIVE_COURSE_ASSIGNED,
          actorId: session.id,
          payload: {
            liveCourseId: currentAssignment.liveCourseId,
            liveCourseTitle: currentAssignment.liveCourse.title,
            instructorId: newInstructorId,
            assignedBy: session.name || "Super Admin",
          },
        });
      }

      // Log to Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin reassigned instructor from ${currentAssignment.instructor.name} to ${newInstructor.name}`,
          details: `Target: ${currentAssignment.session?.title || currentAssignment.liveCourse?.title}. Reason: ${reassignReason || "None provided"}`
        }
      });

      return NextResponse.json({ success: true, assignment: updatedAssignment });
    } else if (permissions) {
      // Just updating permissions
      const updatedAssignment = await prisma.sessionAssignment.update({
        where: { id: assignmentId },
        data: {
          canView: permissions.canView ?? currentAssignment.canView,
          canEdit: permissions.canEdit ?? currentAssignment.canEdit,
          canEditAgenda: permissions.canEditAgenda ?? currentAssignment.canEditAgenda,
          canEditSchedule: permissions.canEditSchedule ?? currentAssignment.canEditSchedule,
          canEditResources: permissions.canEditResources ?? currentAssignment.canEditResources,
          canAddHomework: permissions.canAddHomework ?? currentAssignment.canAddHomework,
          canReschedule: permissions.canReschedule ?? currentAssignment.canReschedule,
          canCancel: permissions.canCancel ?? currentAssignment.canCancel,
          canManageAttendance: permissions.canManageAttendance ?? currentAssignment.canManageAttendance,
          canManageRecording: permissions.canManageRecording ?? currentAssignment.canManageRecording
        }
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin updated permissions for ${currentAssignment.instructor.name}`,
          details: `Target: ${currentAssignment.session?.title || currentAssignment.liveCourse?.title}. Permissions: canEdit=${permissions.canEdit}, canReschedule=${permissions.canReschedule}`
        }
      });

      return NextResponse.json({ success: true, assignment: updatedAssignment });
    }

    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Update Assignment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const existing = await prisma.sessionAssignment.findUnique({
      where: { id },
      include: { instructor: true, session: true, liveCourse: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await prisma.sessionAssignment.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin removed assignment for ${existing.instructor.name}`,
        details: `Removed from ${existing.session?.title || existing.liveCourse?.title}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Delete Assignment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove assignment" }, { status: 500 });
  }
}
