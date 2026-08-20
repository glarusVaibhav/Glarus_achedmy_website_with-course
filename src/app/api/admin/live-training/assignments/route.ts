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
      type = "SESSION", // "COURSE" | "SESSION"
      liveCourseId,
      sessionId,
      instructorId,
      permissions = {
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

    if (!instructorId || !liveCourseId) {
      return NextResponse.json({ error: "Instructor ID and Live Course ID are required" }, { status: 400 });
    }

    const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const course = await prisma.liveCourse.findUnique({
      where: { id: liveCourseId },
      include: { sessions: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (type === "COURSE") {
      // Assign lead instructor to course
      await prisma.liveCourse.update({
        where: { id: liveCourseId },
        data: { leadInstructorId: instructorId }
      });

      // Upsert course-level assignment
      const courseAssignment = await prisma.sessionAssignment.create({
        data: {
          liveCourseId,
          instructorId,
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit ?? false,
          canEditAgenda: permissions.canEditAgenda ?? false,
          canEditSchedule: permissions.canEditSchedule ?? false,
          canEditResources: permissions.canEditResources ?? false,
          canAddHomework: permissions.canAddHomework ?? false,
          canReschedule: permissions.canReschedule ?? false,
          canCancel: permissions.canCancel ?? false,
          canManageAttendance: permissions.canManageAttendance ?? true,
          canManageRecording: permissions.canManageRecording ?? true,
          assignedBy: session.name || "Super Admin"
        }
      });

      // Also assign to all sessions in this course
      for (const sess of course.sessions) {
        await prisma.sessionAssignment.deleteMany({
          where: { sessionId: sess.id, instructorId }
        });

        await prisma.sessionAssignment.create({
          data: {
            sessionId: sess.id,
            liveCourseId,
            instructorId,
            canView: permissions.canView ?? true,
            canEdit: permissions.canEdit ?? false,
            canEditAgenda: permissions.canEditAgenda ?? false,
            canEditSchedule: permissions.canEditSchedule ?? false,
            canEditResources: permissions.canEditResources ?? false,
            canAddHomework: permissions.canAddHomework ?? false,
            canReschedule: permissions.canReschedule ?? false,
            canCancel: permissions.canCancel ?? false,
            canManageAttendance: permissions.canManageAttendance ?? true,
            canManageRecording: permissions.canManageRecording ?? true,
            assignedBy: session.name || "Super Admin"
          }
        });
      }

      await prisma.notification.create({
        data: {
          userId: instructorId,
          type: "COURSE_ASSIGNED",
          message: `You were assigned as lead instructor for the entire live course: "${course.title}". (${course.sessions.length} sessions)`
        }
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin assigned ${instructor.name} to entire Live Course: "${course.title}"`,
          details: `Granted permissions: canEdit=${permissions.canEdit}, canReschedule=${permissions.canReschedule}`
        }
      });

      return NextResponse.json({ success: true, assignment: courseAssignment });
    } else {
      // Individual session assignment
      if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required for session assignment" }, { status: 400 });
      }

      const targetSession = await prisma.liveSession.findUnique({ where: { id: sessionId } });
      if (!targetSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Check if already assigned
      const existing = await prisma.sessionAssignment.findFirst({
        where: { sessionId, instructorId }
      });

      let assignment;
      if (existing) {
        assignment = await prisma.sessionAssignment.update({
          where: { id: existing.id },
          data: {
            canView: permissions.canView ?? true,
            canEdit: permissions.canEdit ?? false,
            canEditAgenda: permissions.canEditAgenda ?? false,
            canEditSchedule: permissions.canEditSchedule ?? false,
            canEditResources: permissions.canEditResources ?? false,
            canAddHomework: permissions.canAddHomework ?? false,
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
            canEdit: permissions.canEdit ?? false,
            canEditAgenda: permissions.canEditAgenda ?? false,
            canEditSchedule: permissions.canEditSchedule ?? false,
            canEditResources: permissions.canEditResources ?? false,
            canAddHomework: permissions.canAddHomework ?? false,
            canReschedule: permissions.canReschedule ?? false,
            canCancel: permissions.canCancel ?? false,
            canManageAttendance: permissions.canManageAttendance ?? true,
            canManageRecording: permissions.canManageRecording ?? true,
            assignedBy: session.name || "Super Admin"
          }
        });
      }

      await prisma.notification.create({
        data: {
          userId: instructorId,
          type: "SESSION_ASSIGNED",
          message: `You were assigned to Live Session ${targetSession.sessionNumber}: "${targetSession.title}" in course "${course.title}".`
        }
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: `Admin assigned ${instructor.name} to Session ${targetSession.sessionNumber}: "${targetSession.title}"`,
          details: `Course: ${course.title}. Permissions: canEdit=${permissions.canEdit}, canEditAgenda=${permissions.canEditAgenda}`
        }
      });

      return NextResponse.json({ success: true, assignment });
    }
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
      newInstructorId,
      reassignReason,
      permissions
    } = body;

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const currentAssignment = await prisma.sessionAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        instructor: true,
        session: true,
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

      // Notify old instructor
      await prisma.notification.create({
        data: {
          userId: currentAssignment.instructorId,
          type: "INSTRUCTOR_REASSIGNED",
          message: `Your assignment for ${currentAssignment.session ? `Live Session "${currentAssignment.session.title}"` : `Live Course "${currentAssignment.liveCourse?.title}"`} was reassigned to ${newInstructor.name}.`
        }
      });

      // Notify new instructor
      await prisma.notification.create({
        data: {
          userId: newInstructorId,
          type: "SESSION_ASSIGNED",
          message: `You were assigned to ${currentAssignment.session ? `Live Session "${currentAssignment.session.title}"` : `Live Course "${currentAssignment.liveCourse?.title}"`}.`
        }
      });

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
