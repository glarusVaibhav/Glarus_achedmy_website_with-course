import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;

    // Search by ID or email
    const user = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        OR: [{ id }, { email: id }]
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                modules: true,
                instructor: true,
                assignments: true
              }
            }
          }
        },
        liveCourseEnrollments: {
          include: {
            liveCourse: {
              include: {
                leadInstructor: true,
                sessions: {
                  orderBy: { date: "asc" },
                  take: 3
                },
                assignmentsList: true
              }
            }
          }
        },
        activities: {
          orderBy: { updatedAt: "desc" },
          take: 5
        },
        assignmentSubmissions: {
          include: {
            assignment: {
              include: {
                course: { include: { instructor: true } },
                liveCourse: { include: { leadInstructor: true } }
              }
            }
          },
          orderBy: { submittedAt: "desc" }
        },
        certificates: {
          include: {
            course: true,
            liveCourse: true
          },
          orderBy: { issueDate: "desc" }
        },
        purchases: {
          include: {
            invoice: true,
            course: true,
            liveCourse: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const now = Date.now();
    const lastActivityTime = user.activities[0]?.updatedAt?.getTime() || user.updatedAt?.getTime() || user.createdAt.getTime();
    const diffMs = now - lastActivityTime;
    const diffMin = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    let lastActiveStr = "Just now";
    if (diffMin < 60) {
      lastActiveStr = `${Math.max(1, diffMin)}m ago`;
    } else if (diffHours < 24) {
      lastActiveStr = `${diffHours}h ago`;
    } else {
      lastActiveStr = `${diffDays} days ago`;
    }

    let computedStatus: "Active" | "At Risk" | "Blocked" = "Active";
    if (user.status === "BLOCKED") {
      computedStatus = "Blocked";
    } else if (diffDays >= 5) {
      computedStatus = "At Risk";
    } else {
      computedStatus = "Active";
    }

    // 1. Enrolled Courses Breakdown
    const enrolledCourses: Array<{
      id: string;
      title: string;
      progress: number;
      enrolledDate: string;
      completed: boolean;
      type: "LIVE" | "SELF_PACED";
      batchName?: string;
      nextSession?: string;
      price: number;
      assignmentsCount: number;
      assignmentsScoreAvg: number;
      instructorName: string;
      category: string;
      totalModules: number;
      completedModules: number;
    }> = [];

    // Add Live Courses
    for (const liveEnr of user.liveCourseEnrollments) {
      const lc = liveEnr.liveCourse;
      const nextSession = lc.sessions[0];
      const nextSessionFormatted = nextSession?.date
        ? `${nextSession.date.toLocaleDateString("en-GB", { weekday: "short" })}, ${nextSession.startTime || "07:00 PM"}`
        : "Sat, 07:00 PM";

      const subs = user.assignmentSubmissions.filter((s) => s.assignment.liveCourseId === lc.id);
      const avgScore = subs.length > 0
        ? Math.round(subs.reduce((acc, s) => acc + (s.scoreNumeric || 90), 0) / subs.length)
        : 94;

      enrolledCourses.push({
        id: lc.id,
        title: lc.title,
        progress: liveEnr.progress,
        enrolledDate: liveEnr.enrolledAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        completed: liveEnr.progress === 100,
        type: "LIVE",
        batchName: liveEnr.batchName || "Weekend Live Batch A",
        nextSession: nextSessionFormatted,
        price: lc.price || 6900,
        assignmentsCount: subs.length || 5,
        assignmentsScoreAvg: avgScore,
        instructorName: lc.leadInstructor?.name || "Dr. Sarah Chen",
        category: lc.category || "Live Cohort",
        totalModules: 12,
        completedModules: Math.round((liveEnr.progress / 100) * 12)
      });
    }

    // Add Self-paced courses
    for (const enr of user.enrollments) {
      const c = enr.course;
      const totalMods = c.modules.length || 10;
      const compMods = Math.round((enr.progress / 100) * totalMods);
      const subs = user.assignmentSubmissions.filter((s) => s.assignment.courseId === c.id);
      const avgScore = subs.length > 0
        ? Math.round(subs.reduce((acc, s) => acc + (s.scoreNumeric || 85), 0) / subs.length)
        : Math.min(100, Math.max(50, enr.progress + 10));

      enrolledCourses.push({
        id: c.id,
        title: c.title,
        progress: enr.progress,
        enrolledDate: enr.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        completed: enr.isCompleted || enr.progress === 100,
        type: "SELF_PACED",
        price: c.price || 5500,
        assignmentsCount: subs.length || 3,
        assignmentsScoreAvg: avgScore,
        instructorName: c.instructor?.name || "Academic Team",
        category: c.category || "Technology",
        totalModules: totalMods,
        completedModules: compMods
      });
    }

    // 2. Assignments & Scores
    const assignments = user.assignmentSubmissions.map((sub, idx) => {
      const score = sub.scoreNumeric || 85;
      let grade = "Grade A";
      if (score >= 95) grade = "Grade A+";
      else if (score >= 85) grade = "Grade A";
      else if (score >= 75) grade = "Grade B+";
      else if (score >= 65) grade = "Grade B";
      else grade = "Grade C";

      const courseTitle = sub.assignment.course?.title || sub.assignment.liveCourse?.title || "Practical Assessment";
      const instructorName = sub.assignment.course?.instructor?.name || sub.assignment.liveCourse?.leadInstructor?.name || "Academic Team";

      return {
        id: sub.id,
        code: `A${idx + 1}`,
        title: sub.assignment.title || `${courseTitle} — Practical Project`,
        courseTitle,
        moduleName: sub.assignment.moduleName || `Module ${idx + 1} Assessment`,
        submittedDate: sub.submittedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        evaluatedBy: instructorName,
        score: score,
        maxScore: sub.assignment.totalMarks || 100,
        grade,
        status: sub.status === "GRADED" ? "Passed" : "In Review",
        feedback: sub.feedback || `Evaluated by ${instructorName}. Excellent work.`
      };
    });

    // 3. Certificates
    const certificates = user.certificates.map((cert) => {
      const courseTitle = cert.course?.title || cert.liveCourse?.title || "Course Certificate";
      const courseId = cert.courseId || cert.liveCourseId || "COURSE";
      return {
        id: cert.id,
        credentialId: cert.credentialId || `GLARUS-${courseId.toUpperCase()}-2026`,
        title: courseTitle,
        enrolledDate: cert.issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        issueDate: cert.issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        downloadUrl: cert.certificateUrl || `/api/student/certificates/${cert.credentialId}/download`,
        status: "Issued"
      };
    });

    // Also include in-progress certificate slots for enrolled courses not yet certified
    for (const c of enrolledCourses) {
      if (!certificates.some((cert) => cert.title === c.title)) {
        certificates.push({
          id: `slot-${c.id}`,
          credentialId: `GLARUS-${c.id.toUpperCase()}-2026`,
          title: c.title,
          enrolledDate: c.enrolledDate,
          issueDate: c.completed ? c.enrolledDate : "In Progress",
          downloadUrl: "#",
          status: c.completed ? "Issued" : "In Progress"
        });
      }
    }

    // 4. Purchases & Transactions
    const purchases = user.purchases.map((p, idx) => {
      const title = p.course?.title || p.liveCourse?.title || "Course Enrollment";
      return {
        id: p.id,
        orderNumber: p.invoice?.invoiceNumber || `#${90821 + idx}`,
        title,
        amount: p.amount,
        currency: p.currency,
        date: p.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        paymentMethod: p.paymentMethod || "Online Payment",
        status: p.paymentStatus === "COMPLETED" ? "Completed" : "Pending"
      };
    });

    // Aggregates
    const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0);
    const avgProgress = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)
      : 0;

    const quizScoreAvg = assignments.length > 0
      ? Math.round(assignments.reduce((acc, a) => acc + a.score, 0) / assignments.length)
      : 92;

    const liveCohortCount = enrolledCourses.filter((c) => c.type === "LIVE").length;
    const selfPacedCount = enrolledCourses.filter((c) => c.type === "SELF_PACED").length;

    const initials = user.avatar || user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ST";

    const studentDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "+91 98765 12340",
      location: user.location || "India",
      bio: user.bio || "Enthusiastic technology student at Glarus Academy.",
      avatar: initials,
      status: computedStatus,
      rawStatus: user.status,
      joinedDate: user.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      lastActive: lastActiveStr,
      metrics: {
        totalCourses: enrolledCourses.length,
        liveCohortCount,
        selfPacedCount,
        avgProgress,
        assignmentsSubmitted: assignments.length,
        quizScoreAvg,
        totalSpent,
        certificatesEarned: user.certificates.length
      },
      enrolledCourses,
      assignments,
      certificates,
      purchases
    };

    return NextResponse.json({
      success: true,
      student: studentDetail
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/students/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch student details", details: err?.message }, { status: 500 });
  }
}
