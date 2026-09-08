import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const decodedCourseId = decodeURIComponent(courseId);

    const baseDir = path.join(process.cwd(), "course", decodedCourseId);

    // 1. Read topics.json from filesystem if available
    const topicsPath = path.join(baseDir, "topics.json");
    let topicsData: any = null;
    if (fs.existsSync(topicsPath)) {
      const raw = fs.readFileSync(topicsPath, "utf-8");
      topicsData = JSON.parse(raw);
    }

    // 2. Read lessons.json from filesystem if available
    const lessonsPath = path.join(baseDir, "lessons.json");
    let lessonsData: any = null;
    if (fs.existsSync(lessonsPath)) {
      const raw = fs.readFileSync(lessonsPath, "utf-8");
      lessonsData = JSON.parse(raw);
    }

    // Extract modules list from topics.json
    let modules = topicsData?.modules || topicsData || [];
    let lessons = lessonsData?.lessons || lessonsData || [];

    // 3. If missing from disk, check PostgreSQL Course table
    if (!modules || modules.length === 0) {
      const dbCourse = await prisma.course.findFirst({
        where: {
          OR: [
            { id: decodedCourseId },
            { title: decodedCourseId },
          ],
        },
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lectures: { orderBy: { order: "asc" } },
            },
          },
        },
      });

      if (dbCourse && dbCourse.modules.length > 0) {
        modules = dbCourse.modules.map((m, mIdx) => ({
          id: m.id,
          module_id: `M${String(mIdx + 1).padStart(2, "0")}`,
          title: m.title,
          topics:
            m.lectures.length > 0
              ? m.lectures.map((l, lIdx) => ({
                  id: l.id || `lec-${mIdx}-${lIdx}`,
                  title: l.title,
                  duration: l.duration || "15m",
                  is_interactive: true,
                }))
              : [
                  {
                    id: m.id || `mod-${mIdx}`,
                    title: `${m.title} Overview`,
                    duration: "20m",
                    is_interactive: true,
                  },
                ],
        }));

        lessons = dbCourse.modules.flatMap((m, mIdx) =>
          (m.lectures.length > 0
            ? m.lectures
            : [{ id: m.id, title: m.title, description: m.description, videoUrl: null }]
          ).map((l: any, lIdx: number) => ({
            id: l.id || `lec-${mIdx}-${lIdx}`,
            title: l.title,
            module_id: m.id,
            stages: [
              {
                type: "concept",
                content: {
                  title: l.title,
                  explanation:
                    l.description ||
                    `${l.title} interactive curriculum breakdown and coding exercises.`,
                  videoUrl: l.videoUrl || undefined,
                },
              },
            ],
          }))
        );

        return NextResponse.json({
          success: true,
          topics: modules,
          lessons: lessons,
        });
      }

      // 4. Final Fallback: try flagship folder if missing
      const flagshipDir = path.join(process.cwd(), "course", "Generative_AI_Application_Engineer");
      const fallbackTopics = path.join(flagshipDir, "topics.json");
      const fallbackLessons = path.join(flagshipDir, "lessons.json");

      if (fs.existsSync(fallbackTopics) && fs.existsSync(fallbackLessons)) {
        const rawT = fs.readFileSync(fallbackTopics, "utf-8");
        const rawL = fs.readFileSync(fallbackLessons, "utf-8");
        const fTData = JSON.parse(rawT);
        const fLData = JSON.parse(rawL);

        return NextResponse.json({
          success: true,
          topics: fTData.modules || fTData,
          lessons: fLData.lessons || fLData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      topics: modules,
      lessons: lessons,
    });
  } catch (err: any) {
    console.error("Sidebar API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load sidebar data" },
      { status: 500 }
    );
  }
}
