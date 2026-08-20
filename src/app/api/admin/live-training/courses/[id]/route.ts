import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;

    const course = await prisma.liveCourse.findUnique({
      where: { id },
      include: {
        leadInstructor: {
          select: { id: true, name: true, email: true }
        },
        sessions: {
          orderBy: { sessionNumber: "asc" },
          include: {
            agenda: { orderBy: { order: "asc" } },
            topics: { orderBy: { order: "asc" } },
            learningOutcomes: { orderBy: { order: "asc" } },
            activities: { orderBy: { order: "asc" } },
            resources: true,
            homework: true,
            assignments: {
              include: {
                instructor: {
                  select: { id: true, name: true, email: true }
                }
              }
            },
            changeHistory: {
              orderBy: { createdAt: "desc" }
            }
          }
        },
        assignments: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Live course not found" }, { status: 404 });
    }

    const formatted = {
      ...course,
      prerequisites: course.prerequisites ? JSON.parse(course.prerequisites) : [],
      objectives: course.objectives ? JSON.parse(course.objectives) : [],
      tags: course.tags ? JSON.parse(course.tags) : []
    };

    return NextResponse.json({ course: formatted });
  } catch (error: any) {
    console.error("Admin Get Live Course Error:", error);
    return NextResponse.json({ error: "Failed to fetch live course" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existingCourse = await prisma.liveCourse.findUnique({ where: { id } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Live course not found" }, { status: 404 });
    }

    const {
      title,
      shortDescription,
      description,
      category,
      level,
      duration,
      startDate,
      endDate,
      timezone,
      maxStudents,
      status,
      leadInstructorId,
      meetingPlatform,
      meetingUrl,
      prerequisites,
      objectives,
      tags,
      targetAudience,
      thumbnailGradient,
      recordingAvailable,
      attendanceTracking,
      visibility
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (maxStudents !== undefined) updateData.maxStudents = Number(maxStudents);
    if (status !== undefined) updateData.status = status;
    if (leadInstructorId !== undefined) updateData.leadInstructorId = leadInstructorId || null;
    if (meetingPlatform !== undefined) updateData.meetingPlatform = meetingPlatform;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (prerequisites !== undefined) updateData.prerequisites = JSON.stringify(prerequisites);
    if (objectives !== undefined) updateData.objectives = JSON.stringify(objectives);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (thumbnailGradient !== undefined) updateData.thumbnailGradient = thumbnailGradient;
    if (recordingAvailable !== undefined) updateData.recordingAvailable = recordingAvailable;
    if (attendanceTracking !== undefined) updateData.attendanceTracking = attendanceTracking;
    if (visibility !== undefined) updateData.visibility = visibility;

    const updated = await prisma.liveCourse.update({
      where: { id },
      data: updateData,
      include: {
        leadInstructor: { select: { id: true, name: true, email: true } },
        sessions: true
      }
    });

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin updated Live Course: "${updated.title}"`,
        details: `Updated fields: ${Object.keys(updateData).join(", ")}. Status is now ${updated.status}`
      }
    });

    return NextResponse.json({ course: updated });
  } catch (error: any) {
    console.error("Admin Update Live Course Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update live course" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const existing = await prisma.liveCourse.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.liveCourse.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: `Admin deleted Live Course: "${existing.title}"`,
        details: `Deleted live course ID: ${id}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Delete Live Course Error:", error);
    return NextResponse.json({ error: "Failed to delete live course" }, { status: 500 });
  }
}
