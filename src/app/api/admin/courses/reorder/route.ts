import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { reorderPublishedCourses } from "@/lib/courseOrdering";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to reorder courses." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { courseIds } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'courseIds' must be a non-empty array of course IDs." },
        { status: 400 }
      );
    }

    // Call shared reorder service
    const result = await reorderPublishedCourses(courseIds);

    // Record AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: "COURSES_REORDERED",
          details: JSON.stringify({
            reorderedCount: result.courses.length,
            orderSequence: result.courses.map((c) => ({ id: c.id, order: c.displayOrder })),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log write skipped:", auditErr);
    }

    // Invalidate caches to refresh landing page and catalog immediately
    try {
      revalidatePath("/");
      revalidatePath("/courses");
      revalidatePath("/admin/courses");
    } catch (cacheErr) {
      console.warn("Cache revalidation skipped:", cacheErr);
    }

    return NextResponse.json({
      success: true,
      message: "Published courses successfully reordered.",
      courses: result.courses,
    });
  } catch (err: any) {
    console.error("Course reorder error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to reorder courses." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
