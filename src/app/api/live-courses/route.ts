import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const courses = await prisma.liveCourse.findMany({
      where: {
        status: {
          in: ["PUBLISHED", "ACTIVE"]
        }
      },
      include: {
        leadInstructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sessions: {
          orderBy: { sessionNumber: "asc" }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        description: c.description,
        price: c.price,
        category: c.category,
        level: c.level,
        duration: c.duration,
        startDate: c.startDate,
        endDate: c.endDate,
        timezone: c.timezone,
        totalSessions: c.totalSessions || c.sessions.length,
        maxStudents: c.maxStudents,
        enrolledCount: c.enrolledCount,
        status: c.status,
        isPublished: c.isPublished,
        thumbnail: c.thumbnail,
        thumbnailGradient: c.thumbnailGradient,
        meetingPlatform: c.meetingPlatform,
        leadInstructor: c.leadInstructor,
        sessions: c.sessions
      }))
    });
  } catch (error: any) {
    console.error("Public Fetch Live Courses Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch published live courses" },
      { status: 500 }
    );
  }
}
