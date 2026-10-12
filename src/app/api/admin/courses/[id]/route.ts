import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { extractVideoAssetId } from "@/lib/video/lessonVideoLink";
import { parseYouTubeVideoId } from "@/lib/video/youtubeService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { title: id }]
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            instructorProfile: true,
            instructorApproval: true
          }
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" }
            }
          }
        },
        batches: true,
        purchases: true,
        enrollments: true,
        courseApproval: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found in database" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err) {
    console.error("Failed to fetch course details", err);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingCourse = await prisma.course.findFirst({
      where: { OR: [{ id }, { title: id }] },
      include: { modules: { include: { lectures: true } } }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const serializeJson = (val: any) => {
      if (!val) return null;
      if (typeof val === "string") return val;
      return JSON.stringify(val);
    };

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
      isPublished,
      modules
    } = body;

    const courseId = existingCourse.id;

    // Use transaction to update course metadata, modules, and lectures cleanly
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // If modules array is provided, replace modules and lectures
      if (modules && Array.isArray(modules)) {
        // Delete existing modules (cascades to lectures)
        await tx.module.deleteMany({
          where: { courseId }
        });

        // Recreate modules and lectures with all multimedia & quiz data
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
          const m = modules[mIdx];
          const newModule = await tx.module.create({
            data: {
              title: m.title || `Module ${mIdx + 1}`,
              order: mIdx + 1,
              courseId
            }
          });

          const lessons = m.lessons || m.items || [];
          if (Array.isArray(lessons)) {
            for (let lIdx = 0; lIdx < lessons.length; lIdx++) {
              const l = lessons[lIdx];
              const isObj = typeof l === "object" && l !== null;
              const createdLecture = await tx.lecture.create({
                data: {
                  moduleId: newModule.id,
                  title: isObj ? l.title || `Lecture ${lIdx + 1}` : l,
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
                  resources: isObj && l.resources ? l.resources : (isObj && l.resourceFileUrl ? [{ id: `res-${lIdx}`, title: l.title || "Resource", url: l.resourceFileUrl, type: l.fileType || "PDF" }] : undefined),
                  deliverables: isObj && l.deliverables ? l.deliverables : undefined,
                  starterFileName: isObj ? l.starterFileName || null : null,
                  starterFileUrl: isObj ? l.starterFileUrl || null : null,
                  assignmentBrief: isObj ? l.assignmentBrief || null : null,
                  order: lIdx + 1
                }
              });

              // Link VideoAsset if present or referenced in videoUrl
              const targetVideoAssetId = isObj ? extractVideoAssetId(l) : null;
              if (targetVideoAssetId) {
                await tx.videoAsset.update({
                  where: { id: targetVideoAssetId },
                  data: {
                    lectureId: createdLecture.id,
                    courseId,
                  },
                }).catch(() => {});
              } else if (isObj && l.videoUrl) {
                const ytId = parseYouTubeVideoId(l.videoUrl);
                if (ytId) {
                  await tx.videoAsset.create({
                    data: {
                      provider: "YOUTUBE",
                      providerVideoId: ytId,
                      courseId,
                      lectureId: createdLecture.id,
                      status: "READY",
                      thumbnailKey: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
                    },
                  }).catch(() => {});
                }
              }
            }
          }
        }
      }

      // Update course main fields
      const updated = await tx.course.update({
        where: { id: courseId },
        data: {
          title: title !== undefined ? title : existingCourse.title,
          subtitle: subtitle !== undefined ? subtitle : existingCourse.subtitle,
          description: description !== undefined ? description : existingCourse.description,
          price: price !== undefined ? (parseFloat(price) || 0) : existingCourse.price,
          originalPrice: originalPrice !== undefined ? (parseFloat(originalPrice) || 0) : existingCourse.originalPrice,
          category: category !== undefined ? category : existingCourse.category,
          level: level !== undefined ? level : existingCourse.level,
          duration: duration !== undefined ? duration : existingCourse.duration,
          previewVideoUrl: previewVideoUrl !== undefined ? previewVideoUrl : existingCourse.previewVideoUrl,
          learningOutcomes: learningOutcomes !== undefined ? serializeJson(learningOutcomes) : existingCourse.learningOutcomes,
          projects: projects !== undefined ? serializeJson(projects) : existingCourse.projects,
          faqs: faqs !== undefined ? serializeJson(faqs) : existingCourse.faqs,
          features: features !== undefined ? serializeJson(features) : existingCourse.features,
          learningJourney: learningJourney !== undefined ? serializeJson(learningJourney) : existingCourse.learningJourney,
          status: status !== undefined ? status : existingCourse.status,
          isPublished: isPublished !== undefined ? isPublished : existingCourse.isPublished,
          publishedAt: isPublished === true ? new Date() : isPublished === false ? null : existingCourse.publishedAt
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              instructorProfile: true
            }
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lectures: {
                orderBy: { order: "asc" }
              }
            }
          },
          courseApproval: true
        }
      });

      // Update or create course approval record
      if (status !== undefined || modules !== undefined) {
        await tx.courseApproval.upsert({
          where: { courseId },
          update: {
            status: status === "PUBLISHED" || status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
            contentPreview: modules ? serializeJson({ modules }) : undefined,
            reviewedBy: session.id,
            reviewedAt: new Date()
          },
          create: {
            courseId,
            status: status === "PUBLISHED" || status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
            contentPreview: modules ? serializeJson({ modules }) : undefined,
            reviewedBy: session.id,
            reviewedAt: new Date()
          }
        });
      }

      // Update ordering if publish state changed
      const wasPublished = existingCourse.isPublished && existingCourse.status === "PUBLISHED";
      const nowPublished = (isPublished !== undefined ? isPublished : existingCourse.isPublished) && (status !== undefined ? status === "PUBLISHED" : existingCourse.status === "PUBLISHED");

      if (!wasPublished && nowPublished) {
        const { assignNextPublishedCourseOrder } = await import("@/lib/courseOrdering");
        await assignNextPublishedCourseOrder(courseId, tx);
      } else if (wasPublished && !nowPublished) {
        const { removeCourseFromPublishedOrder } = await import("@/lib/courseOrdering");
        await removeCourseFromPublishedOrder(courseId, tx);
      }

      // Log Audit
      try {
        await tx.auditLog.create({
          data: {
            action: "ADMIN_COURSE_UPDATED",
            details: `Admin ${session.email} updated course "${updated.title}" (${courseId}) with full permissions.`,
            adminId: session.id
          }
        });
      } catch {
        /* ignore audit log failure */
      }

      return updated;
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (err: any) {
    console.error("Failed to update course by admin:", err);
    return NextResponse.json({ error: "Failed to update course", details: err?.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(request, props);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id }, { title: id }] }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: course.id }
    });

    try {
      const { normalizePublishedCourseOrder } = await import("@/lib/courseOrdering");
      await normalizePublishedCourseOrder();
    } catch (normErr) {
      console.warn("Post-deletion course order normalization:", normErr);
    }

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (err: any) {
    console.error("Failed to delete course by admin:", err);
    return NextResponse.json({ error: "Failed to delete course", details: err?.message }, { status: 500 });
  }
}

