import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Get all INSTRUCTOR_LED enrollments with batch + upcoming live class data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.id as string,
        course: { type: "INSTRUCTOR_LED" },
      },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            batches: {
              include: {
                liveClasses: {
                  orderBy: { date: "asc" },
                },
              },
            },
          },
        },
      },
    });

    const courses = enrollments.map((en) => {
      const nextClass = en.course.batches
        .flatMap((b) => b.liveClasses)
        .filter((lc) => new Date(lc.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      const currentBatch = en.course.batches[0];

      return {
        id: en.course.id,
        title: en.course.title,
        instructor: en.course.instructor.name,
        batchName: currentBatch?.name || "No batch assigned",
        nextClass: nextClass
          ? {
              id: nextClass.id,
              title: nextClass.title,
              date: nextClass.date,
              meetingLink: nextClass.meetingLink,
            }
          : null,
        totalClasses: en.course.batches.flatMap((b) => b.liveClasses).length,
      };
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
