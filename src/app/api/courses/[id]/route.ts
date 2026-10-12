import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            instructorProfile: true
          }
        },
        modules: {
          include: {
            lectures: {
              include: { videoAsset: true },
              orderBy: { order: "asc" }
            }
          },
          orderBy: { order: "asc" }
        },
        enrollments: {
          select: { id: true }
        },
        courseApproval: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Safely parse JSON metadata fields
    const safeJsonParse = (val: string | null | undefined, fallback: any = null) => {
      if (!val) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    const formattedCourse = {
      ...course,
      learningOutcomes: safeJsonParse(course.learningOutcomes, []),
      projects: safeJsonParse(course.projects, []),
      faqs: safeJsonParse(course.faqs, []),
      features: safeJsonParse(course.features, []),
      learningJourney: safeJsonParse(course.learningJourney, [])
    };

    return NextResponse.json({
      success: true,
      data: formattedCourse,
      course: formattedCourse
    });
  } catch (err: any) {
    console.error("Fetch course detail error:", err);
    return NextResponse.json({ error: "Failed to fetch course details", details: err?.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Permission check
    if (session.role === "INSTRUCTOR") {
      if (existing.instructorId !== session.id) {
        return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
      }

      const { hasPermission } = await import("@/lib/permissions/instructorPermissions");
      const canEdit = await hasPermission(session, "COURSE_EDIT");
      if (!canEdit) {
        return NextResponse.json(
          {
            error: "COURSE_EDIT_PERMISSION_REQUIRED",
            message: "Administrative permission is required before you can edit courses."
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      price,
      originalPrice,
      category,
      level,
      duration,
      previewVideoUrl,
      learningOutcomes,
      projects,
      faqs,
      features,
      learningJourney,
      status,
      isPublished
    } = body;

    const serializeJson = (val: any) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      if (typeof val === "string") return val;
      return JSON.stringify(val);
    };

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = parseFloat(originalPrice);
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (previewVideoUrl !== undefined) updateData.previewVideoUrl = previewVideoUrl;
    if (learningOutcomes !== undefined) updateData.learningOutcomes = serializeJson(learningOutcomes);
    if (projects !== undefined) updateData.projects = serializeJson(projects);
    if (faqs !== undefined) updateData.faqs = serializeJson(faqs);
    if (features !== undefined) updateData.features = serializeJson(features);
    if (learningJourney !== undefined) updateData.learningJourney = serializeJson(learningJourney);

    if (session.role === "ADMIN" && status !== undefined) {
      updateData.status = status;
    }
    if (session.role === "ADMIN" && isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
      if (isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        modules: { include: { lectures: true } },
        instructor: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, course: updated });
  } catch (err: any) {
    console.error("Update course error:", err);
    return NextResponse.json({ error: "Failed to update course", details: err?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (session.role === "INSTRUCTOR" && existing.instructorId !== session.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this course" }, { status: 403 });
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete course", details: err?.message }, { status: 500 });
  }
}
