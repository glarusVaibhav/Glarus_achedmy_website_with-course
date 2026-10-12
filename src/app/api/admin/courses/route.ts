import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ensure published courses have valid normalized displayOrder
    try {
      const { normalizePublishedCourseOrder } = await import("@/lib/courseOrdering");
      await normalizePublishedCourseOrder();
    } catch (normErr) {
      console.warn("Course order normalization note:", normErr);
    }

    const [allCourses, pendingCourses] = await Promise.all([
      prisma.course.findMany({
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          modules: true,
          batches: true,
          purchases: true,
          enrollments: true,
        },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" }
        ]
      }),
      prisma.course.findMany({
        where: { status: "PENDING" },
        include: { instructor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return NextResponse.json({ courses: allCourses, pendingCourses });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
  }
}

