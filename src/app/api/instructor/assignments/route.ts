import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Find courses taught by instructor
    const [courses, liveCourses] = await Promise.all([
      prisma.course.findMany({
        where: session.role === "ADMIN" ? {} : { instructorId: session.id },
        select: { id: true, title: true }
      }),
      prisma.liveCourse.findMany({
        where: session.role === "ADMIN" ? {} : { leadInstructorId: session.id },
        select: { id: true, title: true }
      })
    ]);

    const courseIds = courses.map((c) => c.id);
    const liveCourseIds = liveCourses.map((lc) => lc.id);

    // 2. Fetch Assignments and their Submissions
    const assignments = await prisma.assignment.findMany({
      where: session.role === "ADMIN" ? {} : {
        OR: [
          { courseId: { in: courseIds } },
          { liveCourseId: { in: liveCourseIds } }
        ]
      },
      include: {
        course: { select: { id: true, title: true } },
        liveCourse: { select: { id: true, title: true } },
        submissions: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          },
          orderBy: { submittedAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedAssignments = assignments.map((a) => {
      const submissions = a.submissions.map((sub) => ({
        id: sub.id,
        assignmentId: a.id,
        assignmentTitle: a.title,
        courseTitle: a.course?.title || a.liveCourse?.title || "General",
        studentId: sub.userId,
        studentName: sub.user?.name || "Student",
        studentEmail: sub.user?.email || "",
        studentAvatar: sub.user?.avatar || null,
        submissionTime: sub.submittedAt.toISOString(),
        score: sub.scoreNumeric,
        status: sub.status === "GRADED" ? "Graded" : "Pending Review",
        submittedText: sub.notes || "",
        submittedFileName: sub.fileName || undefined,
        fileUrl: sub.fileUrl || undefined,
        githubUrl: sub.githubUrl || undefined,
        liveUrl: sub.liveUrl || undefined,
        feedback: sub.feedback || undefined,
        gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : undefined
      }));

      const pendingCount = submissions.filter((s) => s.status === "Pending Review").length;
      const gradedScores = submissions.filter((s) => s.score !== null).map((s) => s.score as number);
      const avgScore = gradedScores.length > 0
        ? parseFloat((gradedScores.reduce((acc, s) => acc + s, 0) / gradedScores.length).toFixed(1))
        : 0;

      return {
        id: a.id,
        title: a.title,
        course: a.course?.title || a.liveCourse?.title || "General",
        courseId: a.courseId || a.liveCourseId || a.id,
        module: a.moduleName || "Core Curriculum",
        dueDate: a.dueDate.toISOString(),
        submissionsCount: submissions.length,
        totalStudents: Math.max(submissions.length, 30),
        pendingReviewCount: pendingCount,
        averageScore: avgScore,
        status: "Published",
        type: "Coding Assignment",
        totalMarks: a.totalMarks,
        submissions
      };
    });

    return NextResponse.json({ success: true, assignments: formattedAssignments });
  } catch (err: any) {
    console.error("[Instructor Assignments GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch assignments", details: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      courseId,
      liveCourseId,
      moduleName,
      dueDate,
      totalMarks = 100,
      pointsLabel = "100 Pts",
      instructions = []
    } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and Due Date are required" }, { status: 400 });
    }

    // Resolve course or liveCourse
    let targetCourseId = courseId;
    let targetLiveCourseId = liveCourseId;

    if (!targetCourseId && !targetLiveCourseId) {
      // Find instructor's first course or live course
      const firstCourse = await prisma.course.findFirst({
        where: session.role === "ADMIN" ? {} : { instructorId: session.id }
      });
      if (firstCourse) {
        targetCourseId = firstCourse.id;
      } else {
        const firstLiveCourse = await prisma.liveCourse.findFirst({
          where: session.role === "ADMIN" ? {} : { leadInstructorId: session.id }
        });
        if (firstLiveCourse) {
          targetLiveCourseId = firstLiveCourse.id;
        }
      }
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description: description || "Complete the assignment tasks and submit your solution.",
        moduleName: moduleName || "Core Curriculum",
        courseId: targetCourseId || undefined,
        liveCourseId: targetLiveCourseId || undefined,
        dueDate: new Date(dueDate),
        totalMarks: Number(totalMarks) || 100,
        pointsLabel: pointsLabel || `${totalMarks} Pts`,
        instructions: Array.isArray(instructions) ? instructions : []
      },
      include: {
        course: { select: { id: true, title: true } },
        liveCourse: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (err: any) {
    console.error("[Create Assignment POST Error]:", err);
    return NextResponse.json({ error: "Failed to create assignment", details: err?.message }, { status: 500 });
  }
}

