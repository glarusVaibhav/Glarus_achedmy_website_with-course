import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
        orderBy: { createdAt: "desc" }
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

