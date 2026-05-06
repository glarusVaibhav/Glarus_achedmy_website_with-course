import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Fetch student's current enrollments to find categories
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id as string },
      include: { course: true }
    });

    const categories = enrollments.map(en => en.course.description.includes("AI") ? "AI" : "Development"); // Simple logic for demo

    // Find other approved courses that the student is NOT enrolled in
    const enrolledIds = enrollments.map(en => en.courseId);

    const recommendations = await prisma.course.findMany({
      where: {
        status: "APPROVED",
        id: { notIn: enrolledIds },
      },
      take: 3,
      include: { instructor: { select: { name: true } } }
    });

    return NextResponse.json({ courses: recommendations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
