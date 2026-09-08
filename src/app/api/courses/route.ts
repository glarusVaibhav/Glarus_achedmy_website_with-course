import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        status: "PUBLISHED"
      },
      include: {
        instructor: { select: { name: true, email: true } },
        modules: {
          include: { lectures: true },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ courses });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Instructors must be verified before creating courses (admins bypass)
    if (session.role === "INSTRUCTOR") {
      const approval = await prisma.instructorApproval.findUnique({
        where: { userId: session.id },
      });
      if (!approval || approval.status !== "APPROVED") {
        return NextResponse.json(
          { error: "You must complete instructor verification before creating courses." },
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
      instructorId,
      modules,
      isPublished
    } = body;

    const courseStatus =
      session.role === "ADMIN" && status
        ? status
        : session.role === "ADMIN"
        ? "APPROVED"
        : "PENDING";

    let targetInstructorId = session.id;
    if (session.role === "ADMIN" && instructorId && instructorId !== "admin-official") {
      const instructorUser = await prisma.user.findUnique({
        where: { id: instructorId }
      });
      if (instructorUser) {
        targetInstructorId = instructorUser.id;
      }
    }

    // Verify targetInstructorId exists in DB to prevent foreign key errors
    const verifiedInstructor = await prisma.user.findUnique({
      where: { id: targetInstructorId }
    });

    if (!verifiedInstructor) {
      const fallbackUser = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "INSTRUCTOR"] } }
      }) || await prisma.user.findFirst();

      if (!fallbackUser) {
        return NextResponse.json({ error: "No valid instructor or administrator account found in database." }, { status: 400 });
      }
      targetInstructorId = fallbackUser.id;
    }

    const shouldPublish = session.role === "ADMIN" && Boolean(isPublished);

    // Helper to stringify JSON fields if passed as objects/arrays
    const serializeJson = (val: any) => {
      if (!val) return null;
      if (typeof val === "string") return val;
      return JSON.stringify(val);
    };

    const course = await prisma.course.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || "",
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
        category: category || "AI Engineering",
        level: level || "All Levels",
        duration: duration || "30 Hours VOD",
        previewVideoUrl: previewVideoUrl || null,
        learningOutcomes: serializeJson(learningOutcomes),
        projects: serializeJson(projects),
        faqs: serializeJson(faqs),
        features: serializeJson(features),
        learningJourney: serializeJson(learningJourney),
        instructorId: targetInstructorId,
        status: shouldPublish ? "PUBLISHED" : courseStatus,
        isPublished: shouldPublish,
        publishedAt: shouldPublish ? new Date() : null,
        modules: modules && Array.isArray(modules) && modules.length > 0 ? {
          create: modules.map((m: any, mIdx: number) => ({
            title: m.title || `Module ${mIdx + 1}`,
            order: mIdx + 1,
            lectures: m.lessons && Array.isArray(m.lessons) ? {
              create: m.lessons.map((l: any, lIdx: number) => ({
                title: typeof l === "string" ? l : (l.title || `Lesson ${lIdx + 1}`),
                videoUrl: typeof l === "object" ? l.videoUrl || null : null,
                order: lIdx + 1
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        modules: {
          include: { lectures: true }
        },
        instructor: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    console.error("Course creation error:", err);
    return NextResponse.json({ error: "Failed to create course", details: err?.message }, { status: 500 });
  }
}
