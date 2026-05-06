import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.id as string,
        course: { type: "SELF_PACED" },
      },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: {
              orderBy: { order: "asc" },
              include: {
                lectures: { orderBy: { order: "asc" } },
              },
            },
          },
        },
      },
    });

    const courses = await Promise.all(
      enrollments.map(async (en) => {
        const allLectures = en.course.modules.flatMap((m) => m.lectures);
        const totalLectures = allLectures.length;

        const completedCount = await prisma.videoProgress.count({
          where: {
            userId: session.id as string,
            isCompleted: true,
            lectureId: { in: allLectures.map((l) => l.id) },
          },
        });

        const progressPercent =
          totalLectures > 0
            ? Math.round((completedCount / totalLectures) * 100)
            : 0;

        // Find the last watched lecture
        const lastWatched = await prisma.videoProgress.findFirst({
          where: {
            userId: session.id as string,
            lectureId: { in: allLectures.map((l) => l.id) },
          },
          orderBy: { updatedAt: "desc" },
          include: { lecture: true },
        });

        return {
          id: en.course.id,
          title: en.course.title,
          instructor: en.course.instructor.name,
          progress: progressPercent,
          totalLectures,
          completedLectures: completedCount,
          lastWatchedLecture: lastWatched?.lecture?.title || null,
          status:
            progressPercent === 100
              ? "COMPLETED"
              : progressPercent > 0
              ? "IN_PROGRESS"
              : "NOT_STARTED",
        };
      })
    );

    return NextResponse.json({ courses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
