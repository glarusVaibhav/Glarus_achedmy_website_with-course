import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/dateTime";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        OR: [{ id }, { email: id }]
      },
      include: {
        enrollments: {
          include: { course: true }
        },
        liveCourseEnrollments: {
          include: { liveCourse: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Pick target course (body or first enrolled course)
    const targetCourseId = body.courseId || student.enrollments[0]?.courseId;
    const targetLiveCourseId = body.liveCourseId || (!targetCourseId ? student.liveCourseEnrollments[0]?.liveCourseId : undefined);

    if (!targetCourseId && !targetLiveCourseId) {
      return NextResponse.json({ error: "No course found to issue certificate for" }, { status: 400 });
    }

    const courseName = targetCourseId
      ? student.enrollments.find((e) => e.courseId === targetCourseId)?.course.title || "Course"
      : student.liveCourseEnrollments.find((e) => e.liveCourseId === targetLiveCourseId)?.liveCourse.title || "Cohort";

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const credentialId = `GLARUS-CERT-2026-${randomSuffix}`;

    // Upsert certificate
    let certificate;
    if (targetCourseId) {
      certificate = await prisma.certificate.upsert({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: targetCourseId
          }
        },
        update: {
          credentialId,
          issueDate: new Date(),
          certificateUrl: `/api/student/certificates/${credentialId}/download`
        },
        create: {
          userId: student.id,
          courseId: targetCourseId,
          credentialId,
          issueDate: new Date(),
          certificateUrl: `/api/student/certificates/${credentialId}/download`
        }
      });
    } else {
      certificate = await prisma.certificate.create({
        data: {
          userId: student.id,
          liveCourseId: targetLiveCourseId || null,
          credentialId,
          issueDate: new Date(),
          certificateUrl: `/api/student/certificates/${credentialId}/download`
        }
      });
    }

    // Notify student
    await prisma.notification.create({
      data: {
        recipientId: student.id,
        title: "Certificate Issued! 🎓",
        message: `Congratulations! Your verified completion certificate for ${courseName} has been officially issued by academic administration.`,
        category: "STUDENT",
        type: "SYSTEM_ANNOUNCEMENT",
        priority: "HIGH"
      }
    });

    return NextResponse.json({
      success: true,
      message: `Certificate issued successfully for ${courseName}`,
      certificate: {
        id: certificate.id,
        credentialId: certificate.credentialId,
        title: courseName,
        issueDate: formatDate(certificate.issueDate),
        status: "Issued"
      }
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/students/[id]/certificate:", err);
    return NextResponse.json({ error: "Failed to issue certificate", details: err?.message }, { status: 500 });
  }
}
