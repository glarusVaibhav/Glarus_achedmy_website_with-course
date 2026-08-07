import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET — Return current instructor's verification status
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const approval = await prisma.instructorApproval.findUnique({
      where: { userId: session.id },
    });

    if (!approval) {
      return NextResponse.json({
        status: "NOT_SUBMITTED",
        approval: null,
      });
    }

    return NextResponse.json({
      status: approval.status, // PENDING | APPROVED | REJECTED | CHANGES_REQUESTED
      approval: {
        id: approval.id,
        experience: approval.experience,
        skills: approval.skills,
        bio: approval.bio,
        resumeUrl: approval.resumeUrl,
        version: approval.version || 1,
        feedback: approval.feedback,
        reviewedAt: approval.reviewedAt,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt,
      },
    });
  } catch (err) {
    console.error("Verification GET error:", err);
    return NextResponse.json({ error: "Failed to fetch verification status" }, { status: 500 });
  }
}

// POST — Submit or re-submit verification application
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { experience, skills, bio, resumeUrl } = body;

    if (!experience || !skills || !bio) {
      return NextResponse.json(
        { error: "Experience, skills, and bio are required" },
        { status: 400 }
      );
    }

    // Check existing application
    const existing = await prisma.instructorApproval.findUnique({
      where: { userId: session.id },
    });

    if (existing && existing.status === "APPROVED") {
      return NextResponse.json(
        { error: "Your account is already approved as an instructor." },
        { status: 409 }
      );
    }

    const nextVersion = existing ? (existing.version || 1) + 1 : 1;

    // Upsert application record
    const approval = await prisma.instructorApproval.upsert({
      where: { userId: session.id },
      update: {
        experience: experience.toString(),
        skills: typeof skills === "string" ? skills : JSON.stringify(skills),
        bio,
        resumeUrl: resumeUrl || null,
        status: "PENDING",
        version: nextVersion,
        feedback: null,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.id,
        experience: experience.toString(),
        skills: typeof skills === "string" ? skills : JSON.stringify(skills),
        bio,
        resumeUrl: resumeUrl || null,
        status: "PENDING",
        version: 1,
      },
    });

    return NextResponse.json({
      success: true,
      status: "PENDING",
      approval,
    });
  } catch (err) {
    console.error("Verification POST error:", err);
    return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 });
  }
}
