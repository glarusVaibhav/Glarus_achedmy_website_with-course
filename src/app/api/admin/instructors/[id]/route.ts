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

    // Search in prisma User or InstructorApproval
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { email: id },
          { instructorApproval: { id } },
          { instructorApproval: { userId: id } }
        ]
      },
      include: {
        instructorApproval: true,
        instructorProfile: true,
        courses: {
          include: {
            modules: true,
            batches: true
          }
        },
        leadLiveCourses: {
          include: {
            sessions: true
          }
        },
        sessionAssignments: {
          include: {
            session: true,
            liveCourse: true
          }
        }
      }
    });

    if (user) {
      return NextResponse.json({ user, approval: user.instructorApproval });
    }

    // Also check instructor approval table directly if no user match
    const approval = await prisma.instructorApproval.findFirst({
      where: {
        OR: [{ id }, { userId: id }, { email: id }]
      },
      include: {
        user: true
      }
    });

    if (approval) {
      return NextResponse.json({ user: approval.user, approval });
    }

    return NextResponse.json({ error: "Instructor not found in database" }, { status: 404 });
  } catch (err) {
    console.error("Error fetching instructor details:", err);
    return NextResponse.json({ error: "Failed to fetch instructor" }, { status: 500 });
  }
}
