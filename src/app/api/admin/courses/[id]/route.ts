import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { title: id }]
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            instructorProfile: true,
            instructorApproval: true
          }
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" }
            }
          }
        },
        batches: true,
        purchases: true,
        enrollments: true,
        courseApproval: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found in database" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err) {
    console.error("Failed to fetch course details", err);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}
