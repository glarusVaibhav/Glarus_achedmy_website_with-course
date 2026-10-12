import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to access this course" },
        { status: 401 }
      );
    }

    // 1. Fetch Course with Instructor, Modules, and Lectures
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { title: decodeURIComponent(id) }],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            instructorProfile: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" },
              include: {
                videoAsset: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 2. Check Enrollment or Admin / Instructor ownership
    const isOwner = session.id === course.instructorId;
    const isAdmin = session.role === "ADMIN";
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId: course.id,
        },
      },
    });

    // If user is not enrolled and not admin/instructor owner, check if course is published or allow preview
    const isEnrolled = Boolean(enrollment || isOwner || isAdmin);

    // 3. Fetch Student's VideoProgress for all lectures in this course
    const allLectureIds = course.modules.flatMap((m) => m.lectures.map((l) => l.id));
    const userProgressList = await prisma.videoProgress.findMany({
      where: {
        userId: session.id,
        lectureId: { in: allLectureIds },
      },
    });

    const progressMap: Record<string, { progressSeconds: number; isCompleted: boolean }> = {};
    userProgressList.forEach((p) => {
      progressMap[p.lectureId] = {
        progressSeconds: p.progressSeconds,
        isCompleted: p.isCompleted,
      };
    });

    // 4. Fetch Student Notes for this course's lectures
    const studentNotes = await prisma.studentNote.findMany({
      where: {
        userId: session.id,
        lectureId: { in: allLectureIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Fetch User Activity (last accessed lecture)
    const userActivity = await prisma.userActivity.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId: course.id,
        },
      },
    });

    // 6. Helper to parse JSON fields safely
    const safeJsonParse = (val: any, fallback: any = null) => {
      if (!val) return fallback;
      if (typeof val === "object") return val;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    // Format modules & lectures
    const formattedModules = course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lectures: m.lectures.map((l: any) => {
        const prog = progressMap[l.id];
        return {
          id: l.id,
          title: l.title,
          type: l.type || "video",
          duration: l.duration || "15 min",
          videoUrl: l.videoUrl || null,
          videoAsset: l.videoAsset
            ? {
                id: l.videoAsset.id,
                status: l.videoAsset.status,
                masterPlaylistKey: l.videoAsset.masterPlaylistKey,
                thumbnailKey: l.videoAsset.thumbnailKey,
                durationSeconds: l.videoAsset.durationSeconds,
                width: l.videoAsset.width,
                height: l.videoAsset.height,
                resolutions: safeJsonParse(l.videoAsset.resolutions, []),
              }
            : null,
          description: l.description || null,
          notesContent: l.notesContent || null,
          articleContent: l.articleContent || null,
          imageUrl1: l.imageUrl1 || null,
          imageUrl2: l.imageUrl2 || null,
          imageCaption: l.imageCaption || null,
          sandboxLang: l.sandboxLang || "python",
          sandboxCode: l.sandboxCode || null,
          quizQuestions: safeJsonParse(l.quizQuestions, []),
          resources: safeJsonParse(l.resources, []),
          deliverables: safeJsonParse(l.deliverables, []),
          starterFileName: l.starterFileName || null,
          starterFileUrl: l.starterFileUrl || null,
          assignmentBrief: l.assignmentBrief || null,
          order: l.order,
          isCompleted: Boolean(prog?.isCompleted),
          progressSeconds: prog?.progressSeconds || 0,
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        instructor: {
          id: course.instructor?.id,
          name: course.instructor?.name || "Glarus Instructor",
          email: course.instructor?.email,
          avatar: course.instructor?.avatar,
        },
        learningOutcomes: safeJsonParse(course.learningOutcomes, []),
        projects: safeJsonParse(course.projects, []),
        faqs: safeJsonParse(course.faqs, []),
        features: safeJsonParse(course.features, []),
        modules: formattedModules,
      },
      enrollment: {
        isEnrolled,
        progress: enrollment?.progress || 0,
        isCompleted: enrollment?.isCompleted || false,
      },
      user: {
        id: session.id,
        name: session.name || "Student",
        email: session.email,
        role: session.role,
      },
      notes: studentNotes.map((n) => ({
        id: n.id,
        lectureId: n.lectureId,
        timestampSeconds: n.timestampSeconds,
        content: n.content,
        createdAt: n.createdAt,
      })),
      lastLectureId: userActivity?.lastLectureId || formattedModules[0]?.lectures[0]?.id || null,
      lastTimestamp: userActivity?.lastTimestamp || 0,
    });
  } catch (err: any) {
    console.error("[Course Learn API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch course learning studio data", details: err?.message },
      { status: 500 }
    );
  }
}
