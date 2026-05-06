import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instructorId = session.id as string;

    const students = await prisma.enrollment.findMany({
      where: { course: { instructorId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ students });
  } catch (err) {
    console.error("Instructor students error:", err);
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}
