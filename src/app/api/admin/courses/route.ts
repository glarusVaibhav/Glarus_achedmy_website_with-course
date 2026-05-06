import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pendingCourses = await prisma.course.findMany({
      where: { status: "PENDING" },
      include: { instructor: { select: { name: true } } },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ pendingCourses });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load approval queue" }, { status: 500 });
  }
}
