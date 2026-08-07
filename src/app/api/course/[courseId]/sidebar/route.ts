import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const decodedCourseId = decodeURIComponent(courseId);

    const baseDir = path.join(process.cwd(), "course", decodedCourseId);

    // 1. Read topics.json
    const topicsPath = path.join(baseDir, "topics.json");
    let topicsData: any = null;
    if (fs.existsSync(topicsPath)) {
      const raw = fs.readFileSync(topicsPath, "utf-8");
      topicsData = JSON.parse(raw);
    }

    // 2. Read lessons.json
    const lessonsPath = path.join(baseDir, "lessons.json");
    let lessonsData: any = null;
    if (fs.existsSync(lessonsPath)) {
      const raw = fs.readFileSync(lessonsPath, "utf-8");
      lessonsData = JSON.parse(raw);
    }

    // Extract modules list from topics.json
    const modules = topicsData?.modules || topicsData || [];
    const lessons = lessonsData?.lessons || lessonsData || [];

    if (!modules || modules.length === 0) {
      // Fallback: try flagship folder or flat files if missing
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
