import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET — Return current instructor's verification status & profile data
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [approval, user] = await Promise.all([
      prisma.instructorApproval.findUnique({
        where: { userId: session.id },
      }),
      prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, name: true, email: true },
      }),
    ]);

    if (!approval) {
      // Split user's name for convenience
      const nameParts = (user?.name || "").trim().split(" ");
      const defaultFirstName = nameParts[0] || "";
      const defaultLastName = nameParts.slice(1).join(" ") || "";

      return NextResponse.json({
        status: "NOT_SUBMITTED",
        approval: {
          firstName: defaultFirstName,
          lastName: defaultLastName,
          email: user?.email || "",
          phone: "",
          photoUrl: "",
          experience: "",
          teachingLanguages: [],
          skills: "",
          opportunitySource: "",
          resumeUrl: "",
          resumeFileName: "",
          teachingVideoType: "LINK",
          teachingVideoUrl: "",
          teachingVideoFileName: "",
          areasOfExpertise: "",
          aboutInstructor: "",
          courseTeachingPlan: "",
          whyGlarusAcademy: "",
          teachesOnOtherPlatforms: false,
          otherPlatformDetails: "",
        },
      });
    }

    // Parse teachingLanguages if stored as JSON or string
    let parsedLanguages: string[] = [];
    if (approval.teachingLanguages) {
      try {
        const parsed = JSON.parse(approval.teachingLanguages);
        if (Array.isArray(parsed)) parsedLanguages = parsed;
        else parsedLanguages = [approval.teachingLanguages];
      } catch {
        parsedLanguages = approval.teachingLanguages.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const nameParts = (user?.name || "").trim().split(" ");

    return NextResponse.json({
      status: approval.status, // PENDING | APPROVED | REJECTED | CHANGES_REQUESTED
      approval: {
        id: approval.id,
        firstName: approval.firstName || nameParts[0] || "",
        lastName: approval.lastName || nameParts.slice(1).join(" ") || "",
        email: approval.email || user?.email || "",
        phone: approval.phone || "",
        photoUrl: approval.photoUrl || "",
        experience: approval.experience || "",
        teachingLanguages: parsedLanguages,
        skills: approval.skills || "",
        opportunitySource: approval.opportunitySource || "",
        resumeUrl: approval.resumeUrl || "",
        resumeFileName: approval.resumeFileName || "",
        teachingVideoType: approval.teachingVideoType || "LINK",
        teachingVideoUrl: approval.teachingVideoUrl || "",
        teachingVideoFileName: approval.teachingVideoFileName || "",
        areasOfExpertise: approval.areasOfExpertise || "",
        aboutInstructor: approval.aboutInstructor || approval.bio || "",
        courseTeachingPlan: approval.courseTeachingPlan || "",
        whyGlarusAcademy: approval.whyGlarusAcademy || "",
        teachesOnOtherPlatforms: Boolean(approval.teachesOnOtherPlatforms),
        otherPlatformDetails: approval.otherPlatformDetails || "",
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

// POST — Submit or update verification application
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      photoUrl,
      experience,
      teachingLanguages,
      skills,
      opportunitySource,
      resumeUrl,
      resumeFileName,
      teachingVideoType = "LINK",
      teachingVideoUrl,
      teachingVideoFileName,
      areasOfExpertise,
      aboutInstructor,
      courseTeachingPlan,
      whyGlarusAcademy,
      teachesOnOtherPlatforms = false,
      otherPlatformDetails,
    } = body;

    // Required Field Validations
    if (!firstName?.trim()) {
      return NextResponse.json({ error: "First Name is required" }, { status: 400 });
    }
    if (!lastName?.trim()) {
      return NextResponse.json({ error: "Last Name is required" }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid Email address is required" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!resumeUrl?.trim()) {
      return NextResponse.json({ error: "Upload Resume is required" }, { status: 400 });
    }
    if (!teachingVideoUrl?.trim()) {
      return NextResponse.json(
        { error: teachingVideoType === "UPLOAD" ? "Video sample upload is required" : "Teaching Video URL link is required" },
        { status: 400 }
      );
    }
    if (!areasOfExpertise?.trim()) {
      return NextResponse.json({ error: "Areas of Expertise is required" }, { status: 400 });
    }
    if (areasOfExpertise.trim().length > 100) {
      return NextResponse.json({ error: "Areas of Expertise cannot exceed 100 characters" }, { status: 400 });
    }
    if (!courseTeachingPlan?.trim()) {
      return NextResponse.json({ error: "Course Teaching Plan is required" }, { status: 400 });
    }
    if (courseTeachingPlan.trim().length > 2000) {
      return NextResponse.json({ error: "Course Teaching Plan cannot exceed 2,000 characters" }, { status: 400 });
    }

    // Format teachingLanguages and skills as strings
    const serializedLanguages = Array.isArray(teachingLanguages)
      ? JSON.stringify(teachingLanguages)
      : typeof teachingLanguages === "string"
      ? teachingLanguages
      : JSON.stringify([]);

    const serializedSkills = Array.isArray(skills)
      ? skills.join(", ")
      : typeof skills === "string"
      ? skills
      : "";

    // Check existing application
    const existing = await prisma.instructorApproval.findUnique({
      where: { userId: session.id },
    });

    const nextVersion = existing ? (existing.version || 1) + 1 : 1;

    // Upsert application record
    const approval = await prisma.instructorApproval.upsert({
      where: { userId: session.id },
      update: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl || null,
        experience: experience ? experience.toString() : null,
        teachingLanguages: serializedLanguages,
        skills: serializedSkills,
        opportunitySource: opportunitySource || null,
        resumeUrl: resumeUrl.trim(),
        resumeFileName: resumeFileName || null,
        teachingVideoType: teachingVideoType === "UPLOAD" ? "UPLOAD" : "LINK",
        teachingVideoUrl: teachingVideoUrl.trim(),
        teachingVideoFileName: teachingVideoFileName || null,
        areasOfExpertise: areasOfExpertise.trim(),
        aboutInstructor: aboutInstructor ? aboutInstructor.trim() : null,
        bio: aboutInstructor ? aboutInstructor.trim() : null,
        courseTeachingPlan: courseTeachingPlan.trim(),
        whyGlarusAcademy: whyGlarusAcademy ? whyGlarusAcademy.trim() : null,
        teachesOnOtherPlatforms: Boolean(teachesOnOtherPlatforms),
        otherPlatformDetails: teachesOnOtherPlatforms && otherPlatformDetails ? otherPlatformDetails.trim() : null,
        status: "PENDING",
        version: nextVersion,
        feedback: null,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photoUrl: photoUrl || null,
        experience: experience ? experience.toString() : null,
        teachingLanguages: serializedLanguages,
        skills: serializedSkills,
        opportunitySource: opportunitySource || null,
        resumeUrl: resumeUrl.trim(),
        resumeFileName: resumeFileName || null,
        teachingVideoType: teachingVideoType === "UPLOAD" ? "UPLOAD" : "LINK",
        teachingVideoUrl: teachingVideoUrl.trim(),
        teachingVideoFileName: teachingVideoFileName || null,
        areasOfExpertise: areasOfExpertise.trim(),
        aboutInstructor: aboutInstructor ? aboutInstructor.trim() : null,
        bio: aboutInstructor ? aboutInstructor.trim() : null,
        courseTeachingPlan: courseTeachingPlan.trim(),
        whyGlarusAcademy: whyGlarusAcademy ? whyGlarusAcademy.trim() : null,
        teachesOnOtherPlatforms: Boolean(teachesOnOtherPlatforms),
        otherPlatformDetails: teachesOnOtherPlatforms && otherPlatformDetails ? otherPlatformDetails.trim() : null,
        status: "PENDING",
        version: 1,
      },
    });

    // Update user's name
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await prisma.user.update({
        where: { id: session.id },
        data: { name: fullName },
      });
    } catch {
      /* ignore if user update fails */
    }

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
