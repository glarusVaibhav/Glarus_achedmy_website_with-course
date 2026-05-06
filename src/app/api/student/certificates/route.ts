import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.id as string },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    const formatted = certificates.map((cert) => ({
      id: cert.id,
      courseId: cert.courseId,
      courseTitle: cert.course.title,
      instructor: cert.course.instructor.name,
      issueDate: cert.issueDate,
      certificateUrl: cert.certificateUrl,
    }));

    return NextResponse.json({ certificates: formatted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
