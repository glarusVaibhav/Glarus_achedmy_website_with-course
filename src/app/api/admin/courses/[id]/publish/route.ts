import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isPublished, action } = body;

    const shouldPublish =
      typeof isPublished === "boolean"
        ? isPublished
        : action === "PUBLISH"
        ? true
        : action === "UNPUBLISH"
        ? false
        : true;

    // Check course existence
    const existing = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { title: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update course status and publish flags
    const updated = await prisma.course.update({
      where: { id: existing.id },
      data: {
        isPublished: shouldPublish,
        status: shouldPublish ? "PUBLISHED" : "DRAFT",
        publishedAt: shouldPublish ? new Date() : null
      },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: true,
        purchases: true,
        enrollments: true
      }
    });

    // Update display order safely based on publish status
    if (shouldPublish) {
      const { assignNextPublishedCourseOrder } = await import("@/lib/courseOrdering");
      await assignNextPublishedCourseOrder(existing.id);
    } else {
      const { removeCourseFromPublishedOrder } = await import("@/lib/courseOrdering");
      await removeCourseFromPublishedOrder(existing.id);
    }

    // Refresh course data with updated displayOrder
    const finalCourse = await prisma.course.findUnique({
      where: { id: existing.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: true,
        purchases: true,
        enrollments: true
      }
    });

    // Record AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: shouldPublish ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
          details: JSON.stringify({
            courseId: existing.id,
            courseTitle: existing.title,
            previousStatus: existing.status,
            newStatus: updated.status,
            isPublished: updated.isPublished
          })
        }
      });
    } catch (auditErr) {
      console.warn("AuditLog entry skipped:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: shouldPublish
        ? `"${existing.title}" is now published and live on the landing page!`
        : `"${existing.title}" has been unpublished and hidden from the landing page.`,
      course: finalCourse || updated,
      isPublished: (finalCourse || updated).isPublished,
      status: (finalCourse || updated).status,
      displayOrder: (finalCourse || updated).displayOrder
    });
  } catch (err: any) {
    console.error("Failed to toggle course publish status:", err);
    return NextResponse.json(
      { error: "Failed to update publish status", details: err?.message },
      { status: 500 }
    );
  }
}
