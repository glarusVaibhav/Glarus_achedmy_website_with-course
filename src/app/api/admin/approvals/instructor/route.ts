import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emitDomainEvent } from "@/lib/notifications/eventDispatcher";
import { DOMAIN_EVENT_TYPES } from "@/lib/notifications/events";

// GET — Fetch all instructor approval applications for admin
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const approvals = await prisma.instructorApproval.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "INSTRUCTOR" },
          { instructorApproval: { isNot: null } }
        ]
      },
      include: {
        instructorApproval: true,
        instructorProfile: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ approvals, instructors });
  } catch (err) {
    console.error("Admin approvals GET error:", err);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

// POST — Admin approves, rejects, or requests changes on an instructor application
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { instructorId, decision, feedback } = body;

    const validDecisions = ["APPROVED", "REJECTED", "CHANGES_REQUESTED"];
    if (!instructorId || !validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: `instructorId and decision (${validDecisions.join("/")}) are required` },
        { status: 400 }
      );
    }

    // Find the approval record
    const existing = await prisma.instructorApproval.findUnique({
      where: { userId: instructorId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No approval application found for this instructor" },
        { status: 404 }
      );
    }

    // Update approval status and optional feedback
    const updated = await prisma.instructorApproval.update({
      where: { userId: instructorId },
      data: {
        status: decision,
        feedback: feedback || null,
        reviewedBy: session.id,
        reviewedAt: new Date(),
      },
    });

    // If approved, ensure user has INSTRUCTOR role
    if (decision === "APPROVED") {
      await prisma.user.update({
        where: { id: instructorId },
        data: { role: "INSTRUCTOR" }
      });
    }

    // Emit Domain Event for Notification Engine
    await emitDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.VERIFICATION_APPROVED,
      actorId: session.id,
      payload: {
        instructorId,
        decision,
        feedback: feedback || null,
      },
    });

    // Log the admin action
    await prisma.auditLog.create({
      data: {
        action: `INSTRUCTOR_${decision}`,
        details: `Instructor ${instructorId} verification set to ${decision}${feedback ? `: ${feedback}` : ''}`,
        adminId: session.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Instructor status set to ${decision}.`,
      approval: updated,
    });
  } catch (err) {
    console.error("Admin approvals POST error:", err);
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}

