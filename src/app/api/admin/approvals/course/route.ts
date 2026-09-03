import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, decision, feedback } = body;

    if (!courseId || !decision) {
      return NextResponse.json({ error: "Missing required fields (courseId, decision)" }, { status: 400 });
    }

    // Determine target CourseStatus & isPublished flag
    let targetCourseStatus: "APPROVED" | "PUBLISHED" | "PENDING" | "REJECTED" = "APPROVED";
    let isPublished = false;
    let publishedAt: Date | null = null;
    let approvalStatus: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" = "APPROVED";

    if (decision === "PUBLISH" || decision === "PUBLISHED") {
      targetCourseStatus = "PUBLISHED";
      isPublished = true;
      publishedAt = new Date();
      approvalStatus = "APPROVED";
    } else if (decision === "APPROVE" || decision === "APPROVED") {
      targetCourseStatus = "APPROVED";
      isPublished = false;
      approvalStatus = "APPROVED";
    } else if (decision === "UNPUBLISH") {
      targetCourseStatus = "APPROVED";
      isPublished = false;
      approvalStatus = "APPROVED";
    } else if (decision === "CHANGES_REQUESTED") {
      targetCourseStatus = "PENDING";
      isPublished = false;
      approvalStatus = "CHANGES_REQUESTED";
    } else if (decision === "REJECT" || decision === "REJECTED") {
      targetCourseStatus = "REJECTED";
      isPublished = false;
      approvalStatus = "REJECTED";
    }

    // 1. Update Course Status & Publish flags
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: targetCourseStatus,
        isPublished,
        ...(publishedAt ? { publishedAt } : {})
      },
      include: {
        instructor: { select: { id: true, name: true, email: true } }
      }
    });

    // 2. Upsert CourseApproval record
    await prisma.courseApproval.upsert({
      where: { courseId },
      create: {
        courseId,
        status: approvalStatus,
        feedback: feedback || null,
        reviewedBy: session.email || session.name || "Admin",
        reviewedAt: new Date()
      },
      update: {
        status: approvalStatus,
        feedback: feedback || null,
        reviewedBy: session.email || session.name || "Admin",
        reviewedAt: new Date()
      }
    });

    // 3. Emit Domain Event for Notification Engine
    if (course.instructorId) {
      const eventType =
        targetCourseStatus === "PUBLISHED" || targetCourseStatus === "APPROVED"
          ? DOMAIN_EVENT_TYPES.COURSE_APPROVED
          : decision === "CHANGES_REQUESTED"
          ? DOMAIN_EVENT_TYPES.COURSE_CHANGES_REQUESTED
          : DOMAIN_EVENT_TYPES.COURSE_REJECTED;

      await emitDomainEvent({
        eventType,
        actorId: session.id,
        payload: {
          courseId: course.id,
          courseTitle: course.title,
          instructorId: course.instructorId,
          isPublished: targetCourseStatus === "PUBLISHED",
          feedback: feedback || null,
        },
      });
    }

    // 4. Log in AuditLog
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `COURSE_${decision.toUpperCase()}`,
        details: `Admin ${session.email} set course "${course.title}" (${courseId}) status to ${targetCourseStatus} (isPublished: ${isPublished}). Feedback: ${feedback || "None"}`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Course status successfully updated to ${targetCourseStatus} (isPublished: ${isPublished}).`,
      course
    });
  } catch (err: any) {
    console.error("Course approval decision error:", err);
    return NextResponse.json(
      { error: "Failed to process course approval", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}


