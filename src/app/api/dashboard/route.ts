import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            id: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ enrollments });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
