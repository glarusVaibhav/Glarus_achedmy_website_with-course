import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();

    const [
      totalLiveCourses,
      draftCourses,
      publishedCourses,
      activeCourses,
      totalSessions,
      completedSessions,
      liveNowSessions,
      upcomingSessions,
      totalInstructors
    ] = await Promise.all([
      prisma.liveCourse.count(),
      prisma.liveCourse.count({ where: { status: "DRAFT" } }),
      prisma.liveCourse.count({ where: { status: "PUBLISHED" } }),
      prisma.liveCourse.count({ where: { status: "ACTIVE" } }),
      prisma.liveSession.count(),
      prisma.liveSession.count({ where: { status: "COMPLETED" } }),
      prisma.liveSession.count({ where: { status: "LIVE" } }),
      prisma.liveSession.count({
        where: {
          date: { gte: now },
          status: { in: ["SCHEDULED", "RESCHEDULED"] }
        }
      }),
      prisma.user.count({ where: { role: "INSTRUCTOR", status: "ACTIVE" } })
    ]);

    return NextResponse.json({
      stats: {
        totalLiveCourses,
        draftCourses,
        publishedCourses,
        activeCourses,
        totalSessions,
        completedSessions,
        liveNowSessions,
        upcomingSessions,
        totalInstructors
      }
    });
  } catch (error: any) {
    console.error("Admin Live Training Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch live training stats" }, { status: 500 });
  }
}
