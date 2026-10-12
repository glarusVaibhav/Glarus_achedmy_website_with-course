import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseYouTubeVideoId } from "@/lib/video/youtubeService";
import { checkInstructorCourseCreationPermission } from "@/lib/permissions/courseCreationPermission";

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
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" }
      ]
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

    // Instructors must have course-creation permission APPROVED (admins bypass)
    if (session.role === "INSTRUCTOR") {
      const permissionCheck = await checkInstructorCourseCreationPermission(session.id);
      if (!permissionCheck.allowed) {
        return NextResponse.json(
          {
            error: "COURSE_CREATION_PERMISSION_REQUIRED",
            message: permissionCheck.message || "Admin permission is required before you can create courses.",
            status: permissionCheck.status
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
      instructorId,
      modules,
      isPublished
    } = body;

    // Newly created courses are always created as unpublished.
    // Admins publish them explicitly from Course Management (/admin/courses) to assign display order.
    const initialStatus = status === "DRAFT" ? "DRAFT" : session.role === "ADMIN" ? "APPROVED" : "PENDING";

    let targetInstructorId = session.id;
    if (session.role === "ADMIN" && instructorId && instructorId !== "admin-official") {
      const instructorUser = await prisma.user.findUnique({
        where: { id: instructorId }
      });
      if (instructorUser) {
        targetInstructorId = instructorUser.id;
      }
    }

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
        duration: duration || "30 Hours",
        previewVideoUrl: previewVideoUrl || null,
        learningOutcomes: serializeJson(learningOutcomes),
        projects: serializeJson(projects),
        faqs: serializeJson(faqs),
        features: serializeJson(features),
        learningJourney: serializeJson(learningJourney),
        instructorId: targetInstructorId,
        status: initialStatus,
        isPublished: false,
        publishedAt: null,
        displayOrder: null,
        modules: modules && Array.isArray(modules) && modules.length > 0 ? {
          create: modules.map((m: any, mIdx: number) => ({
            title: m.title || `Module ${mIdx + 1}`,
            order: mIdx + 1,
            lectures: m.lessons && Array.isArray(m.lessons) ? {
              create: m.lessons.map((l: any, lIdx: number) => {
                const isObj = typeof l === "object" && l !== null;
                return {
                  title: isObj ? l.title || `Lesson ${lIdx + 1}` : l,
                  videoUrl: isObj ? l.videoUrl || null : null,
                  type: isObj ? l.type || "video" : "video",
                  duration: isObj ? l.duration || l.videoDuration || "15m 00s" : "15m 00s",
                  description: isObj ? l.description || null : null,
                  notesContent: isObj ? l.notesContent || l.notes || null : null,
                  articleContent: isObj ? l.articleContent || null : null,
                  imageUrl1: isObj ? l.imageUrl1 || null : null,
                  imageUrl2: isObj ? l.imageUrl2 || null : null,
                  imageCaption: isObj ? l.imageCaption || null : null,
                  sandboxLang: isObj ? l.sandboxLang || null : null,
                  sandboxCode: isObj ? l.sandboxCode || null : null,
                  quizQuestions: isObj && l.quizQuestions ? l.quizQuestions : undefined,
                  resources: isObj && l.resources ? l.resources : (isObj && l.resourceFileUrl ? [{ id: `res-${lIdx}`, title: l.title || "Resource File", url: l.resourceFileUrl, type: l.fileType || "PDF" }] : undefined),
                  deliverables: isObj && l.deliverables ? l.deliverables : undefined,
                  starterFileName: isObj ? l.starterFileName || null : null,
                  starterFileUrl: isObj ? l.starterFileUrl || null : null,
                  assignmentBrief: isObj ? l.assignmentBrief || null : null,
                  order: lIdx + 1
                };
              })
            } : undefined
          }))
        } : undefined,
        courseApproval: {
          create: {
            status: initialStatus === "APPROVED" ? "APPROVED" : "PENDING",
            contentPreview: serializeJson({ modules })
          }
        }
      },
      include: {
        modules: {
          include: { lectures: true }
        },
        instructor: { select: { name: true, email: true } },
        courseApproval: true
      }
    });

    // Link any newly uploaded VideoAssets to their created lecture IDs and course ID
    if (modules && Array.isArray(modules) && course.modules) {
      for (const m of course.modules) {
        for (const createdLec of m.lectures) {
          const sourceModule = modules.find((sm: any) => sm.title === m.title || sm.order === m.order);
          const sourceLesson = sourceModule?.lessons?.find(
            (sl: any) => (typeof sl === "object" ? sl.title === createdLec.title : sl === createdLec.title)
          );
          if (sourceLesson && typeof sourceLesson === "object" && sourceLesson.videoAssetId) {
            await prisma.videoAsset.update({
              where: { id: sourceLesson.videoAssetId },
              data: {
                lectureId: createdLec.id,
                courseId: course.id
              }
            }).catch((err) => {
              console.warn(`[Course Creator] Notice linking videoAsset ${sourceLesson.videoAssetId}:`, err?.message);
            });
          } else if (createdLec.videoUrl) {
            // Auto-create YouTube VideoAsset if lecture URL is a YouTube link
            const ytId = parseYouTubeVideoId(createdLec.videoUrl);
            if (ytId) {
              await prisma.videoAsset.create({
                data: {
                  provider: "YOUTUBE",
                  providerVideoId: ytId,
                  status: "READY",
                  lectureId: createdLec.id,
                  courseId: course.id,
                  thumbnailKey: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                }
              }).catch((err) => {
                console.warn(`[Course Creator] Notice auto-creating YouTube videoAsset:`, err?.message);
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    console.error("Course creation error:", err);
    return NextResponse.json({ error: "Failed to create course", details: err?.message }, { status: 500 });
  }
}
