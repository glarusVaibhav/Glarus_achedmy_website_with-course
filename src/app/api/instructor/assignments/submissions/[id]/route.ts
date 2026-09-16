import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: submissionId } = await context.params;
    const body = await req.json();
    const { score, feedback } = body;

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
            liveCourse: true
          }
        },
        user: true
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: "GRADED",
        scoreNumeric: Number(score),
        scoreLabel: `${score}/${submission.assignment.totalMarks}`,
        feedback: feedback || null,
        gradedById: session.id,
        gradedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Notify Student about graded assignment
    try {
      await emitDomainEvent({
        eventType: DOMAIN_EVENT_TYPES.ASSIGNMENT_GRADED,
        actorId: session.id,
        payload: {
          assignmentId: submission.assignmentId,
          assignmentTitle: submission.assignment.title,
          studentId: submission.userId,
          grade: Number(score),
          feedback: feedback || "",
          courseTitle: submission.assignment.course?.title || submission.assignment.liveCourse?.title || "Course"
        }
      });
    } catch (notifErr) {
      console.warn("Notice sending graded notification:", notifErr);
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (err: any) {
    console.error("[Instructor Grade Submission Error]:", err);
    return NextResponse.json({ error: "Failed to grade submission", details: err?.message }, { status: 500 });
  }
}
