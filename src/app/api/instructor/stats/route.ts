import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instructorId = session.id as string;

    const [totalCourses, approvedCourses, totalStudents, totalRevenue] = await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.course.count({ where: { instructorId, status: "APPROVED" } }),
      prisma.enrollment.count({
        where: { course: { instructorId } }
      }),
      prisma.purchase.findMany({
        where: { course: { instructorId } },
        include: { course: { select: { price: true } } }
      })
    ]);

    const revenue = totalRevenue.reduce((sum, p) => sum + (p.course?.price || 0), 0);

    return NextResponse.json({
      totalCourses,
      approvedCourses,
      pendingCourses: totalCourses - approvedCourses,
      totalStudents,
      totalRevenue: revenue
    });
  } catch (err) {
    console.error("Instructor stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
