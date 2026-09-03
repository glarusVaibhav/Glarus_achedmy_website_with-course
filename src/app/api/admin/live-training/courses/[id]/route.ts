import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

function safeJsonParse(val: string | null | undefined, fallback: any = []) {
  if (!val) return fallback;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return typeof val === "string" ? [val] : fallback;
  }
}

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
      // Fallback mock live course detail
      const mockLiveCourse = {
        id,
        title: id === "live-crs-202"
          ? "Production Agentic AI & LangGraph Bootcamp"
          : id === "live-crs-203"
          ? "Full-Stack AI SaaS Engineering with Next.js 15 & Python"
          : "FAANG Generative AI & Large Language Models Immersion",
        shortDescription: "Live interactive cohort covering advanced systems engineering, evaluation suites, and scalable deployments.",
        description: "An intensive live training program with real-time workshops, code reviews, and industry mentor guidance.",
        category: "Generative AI",
        level: "Intermediate",
        duration: "6 Weeks",
        startDate: "2026-03-01T13:30:00.000Z",
        endDate: "2026-04-12T15:30:00.000Z",
        timezone: "Asia/Kolkata (IST)",
        totalSessions: 12,
        maxStudents: 50,
        enrolledCount: 48,
        status: "ACTIVE",
        meetingPlatform: "Zoom",
        meetingUrl: "https://zoom.us/j/9812739123",
        leadInstructor: {
          id: "inst-1",
          name: "Dr. Sarah Chen",
          email: "sarah.chen@glarus.edu"
        },
        prerequisites: [
          "Python 3.10+ and async programming",
          "Understanding of LLM tool-calling and API keys",
          "Basic vector search concepts"
        ],
        objectives: [
          "Master direct LLM prompt alignment & structured tool calling",
          "Build multi-agent stateful graph swarms with LangGraph",
          "Deploy enterprise RAG pipelines with self-correcting retrieval",
          "Deploy containerized microservices to Kubernetes clusters"
        ],
        tags: ["Agentic AI", "LangGraph", "Python", "RAG", "Production AI"],
        sessions: [
          {
            id: `sess-${id}-1`,
            sessionNumber: 1,
            title: "Cohort Kickoff: Architecture of Agentic AI Loops",
            description: "Deep dive into ReAct loops, deterministic execution traces, and structured outputs.",
            date: "2026-03-01T13:30:00.000Z",
            startTime: "07:00 PM",
            endTime: "09:00 PM",
            duration: "120 min",
            status: "COMPLETED",
            meetingPlatform: "Zoom",
            meetingUrl: "https://zoom.us/j/9812739123",
            recordingUrl: "https://zoom.us/rec/play/sample-recording-1",
            agenda: [
              { id: "ag-1", title: "Introductions & Cohort Roadmap", duration: "15 min", order: 1 },
              { id: "ag-2", title: "ReAct Loop Deep Dive & Token Conservation", duration: "45 min", order: 2 },
              { id: "ag-3", title: "Hands-on Coding: Tool Calling with Pydantic", duration: "45 min", order: 3 },
              { id: "ag-4", title: "Live Q&A & Assignment 1 Brief", duration: "15 min", order: 4 }
            ],
            topics: [
              { id: "tp-1", name: "ReAct Framework", order: 1 },
              { id: "tp-2", name: "Tool Binding", order: 2 }
            ],
            learningOutcomes: [
              { id: "lo-1", outcome: "Implement robust tool calling with schema validation", order: 1 }
            ],
            assignments: [
              {
                id: `asg-${id}-1`,
                instructor: { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah.chen@glarus.edu" },
                canEditAgenda: true,
                canManageAttendance: true,
                canManageRecording: true
              }
            ],
            changeHistory: []
          },
          {
            id: `sess-${id}-2`,
            sessionNumber: 2,
            title: "Multi-Agent Collaboration with LangGraph",
            description: "State synchronization, supervisor routers, and cyclical graph workflows.",
            date: "2026-03-08T13:30:00.000Z",
            startTime: "07:00 PM",
            endTime: "09:00 PM",
            duration: "120 min",
            status: "SCHEDULED",
            meetingPlatform: "Zoom",
            meetingUrl: "https://zoom.us/j/9812739123",
            agenda: [
              { id: "ag-5", title: "LangGraph State Machine Fundamentals", duration: "30 min", order: 1 },
              { id: "ag-6", title: "Supervisor Agent Routing & Sub-workers", duration: "50 min", order: 2 },
              { id: "ag-7", title: "Live Code Walkthrough: Code Reviewer Swarm", duration: "40 min", order: 3 }
            ],
            topics: [
              { id: "tp-3", name: "LangGraph", order: 1 },
              { id: "tp-4", name: "Multi-Agent Swarms", order: 2 }
            ],
            learningOutcomes: [
              { id: "lo-2", outcome: "Build cyclic graph workflows with human-in-the-loop approvals", order: 1 }
            ],
            assignments: [
              {
                id: `asg-${id}-2`,
                instructor: { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah.chen@glarus.edu" },
                canEditAgenda: true,
                canManageAttendance: true,
                canManageRecording: true
              }
            ],
            changeHistory: []
          }
        ],
        assignments: [
          {
            id: `asg-lead-${id}`,
            instructor: { id: "inst-1", name: "Dr. Sarah Chen", email: "sarah.chen@glarus.edu" }
          }
        ]
      };

      return NextResponse.json({ course: mockLiveCourse });
    }

    const formatted = {
      ...course,
      prerequisites: safeJsonParse(course.prerequisites),
      objectives: safeJsonParse(course.objectives),
      tags: safeJsonParse(course.tags)
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
    if (status !== undefined) {
      updateData.status = status;
    } else if (body.isPublished !== undefined) {
      updateData.status = body.isPublished ? "PUBLISHED" : "DRAFT";
    }
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
