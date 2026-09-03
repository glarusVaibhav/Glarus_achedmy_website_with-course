import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    // Find course
    const course = await prisma.liveCourse.findUnique({
      where: { id },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Live course not found" }, { status: 404 });
    }

    // Verify instructor ownership / assignment (admins can also trigger)
    if (
      session.role !== "ADMIN" &&
      course.leadInstructorId !== session.id
    ) {
      // Check if assigned to any session in this course
      const sessionAssignment = await prisma.sessionAssignment.findFirst({
        where: {
          liveCourseId: id,
          instructorId: session.id
        }
      });

      if (!sessionAssignment) {
        return NextResponse.json(
          { error: "You are not authorized to update this live course" },
          { status: 403 }
        );
      }
    }

    // Update course status to READY_TO_PUBLISH
    const updated = await prisma.liveCourse.update({
      where: { id },
      data: {
        status: "READY_TO_PUBLISH" as any
      },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Notify all admins that instructor marked course as READY_TO_PUBLISH
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true }
      });

      const instructorName = session.name || course.leadInstructor?.name || "Instructor";

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          actorId: session.id,
          type: "COURSE_SUBMITTED_FOR_REVIEW",
          category: "COURSE",
          priority: "HIGH",
          title: `Cohort Ready to Publish: ${course.title}`,
          message: `${instructorName} has reviewed the curriculum & sessions and marked "${course.title}" as Ready to Publish!`,
          linkUrl: `/admin/live-training/courses/${course.id}`,
          metadata: JSON.stringify({
            liveCourseId: course.id,
            courseTitle: course.title,
            instructorId: session.id,
            instructorName
          })
        }))
      });
    } catch (notifErr) {
      console.warn("Could not dispatch admin notifications for READY_TO_PUBLISH:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Course "${course.title}" marked as Ready to Publish!`,
      course: updated
    });
  } catch (err: any) {
    console.error("Error marking course as ready to publish:", err);
    return NextResponse.json(
      { error: err.message || "Failed to mark course as ready to publish" },
      { status: 500 }
    );
  }
}
