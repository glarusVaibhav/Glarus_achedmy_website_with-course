import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const myCourses = await prisma.course.findMany({
      where: session.role === "ADMIN" ? {} : { instructorId: session.id },
      include: {
        modules: {
          include: { lectures: true },
          orderBy: { order: "asc" }
        },
        courseApproval: true,
        enrollments: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ myCourses });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { courseId, action, feedback } = body;

    if (!courseId || !action) {
      return NextResponse.json({ error: "courseId and action are required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { courseApproval: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Permission check: instructor must own the course unless admin
    if (session.role === "INSTRUCTOR" && course.instructorId !== session.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
    }

    let updatedCourse = course;
    let approvalRecord = course.courseApproval;

    if (action === "SUBMIT_FOR_REVIEW") {
      // Instructor submits draft or resubmits after changes
      approvalRecord = await prisma.courseApproval.upsert({
        where: { courseId },
        create: {
          courseId,
          status: "PENDING",
          feedback: null
        },
        update: {
          status: "PENDING",
          feedback: null,
          reviewedAt: null,
          reviewedBy: null
        }
      });

      updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { status: "PENDING" },
        include: { courseApproval: true }
      });
    } else if (action === "ADMIN_APPROVE") {
      if (session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden: Only platform administrators can approve courses." }, { status: 403 });
      }
      // Admin approves course -> transitions approval to APPROVED (Awaiting Publication)
      approvalRecord = await prisma.courseApproval.upsert({
        where: { courseId },
        create: {
          courseId,
          status: "APPROVED",
          reviewedBy: session.name || "Admin",
          reviewedAt: new Date()
        },
        update: {
          status: "APPROVED",
          reviewedBy: session.name || "Admin",
          reviewedAt: new Date()
        }
      });

      updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { status: "APPROVED", isPublished: false },
        include: { courseApproval: true }
      });
    } else if (action === "ADMIN_REQUEST_CHANGES") {
      if (session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden: Only platform administrators can request changes." }, { status: 403 });
      }
      // Admin requests changes
      approvalRecord = await prisma.courseApproval.upsert({
        where: { courseId },
        create: {
          courseId,
          status: "CHANGES_REQUESTED",
          feedback: feedback || "Please address required curriculum revisions.",
          reviewedBy: session.name || "Admin",
          reviewedAt: new Date()
        },
        update: {
          status: "CHANGES_REQUESTED",
          feedback: feedback || "Please address required curriculum revisions.",
          reviewedBy: session.name || "Admin",
          reviewedAt: new Date()
        }
      });

      updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { status: "PENDING", isPublished: false },
        include: { courseApproval: true }
      });
    } else if (action === "PUBLISH") {
      // Enforce strict restriction: Instructors CANNOT publish courses under any circumstance.
      if (session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Instructors cannot publish courses. Only platform administrators can publish courses to catalog." },
          { status: 403 }
        );
      }

      // Course must be approved before publishing
      if (!approvalRecord || approvalRecord.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Course must be approved by Admin before publishing." },
          { status: 400 }
        );
      }

      updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          status: "PUBLISHED",
          isPublished: true,
          publishedAt: new Date()
        },
        include: { courseApproval: true }
      });
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      approval: approvalRecord
    });
  } catch (err: any) {
    console.error("Course status update error:", err);
    return NextResponse.json({ error: "Failed to update course status", details: err?.message }, { status: 500 });
  }
}
