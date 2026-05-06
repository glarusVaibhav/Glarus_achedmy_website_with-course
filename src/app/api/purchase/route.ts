import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    // Check if course exists and is APPROVED
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "APPROVED") {
      return NextResponse.json({ error: "Course unavailable" }, { status: 404 });
    }

    // Check if already purchased
    const existing = await prisma.purchase.findFirst({
      where: { userId: session.id, courseId }
    });

    if (existing) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    // Perform purchase and enrollment inside a transaction
    await prisma.$transaction([
      prisma.purchase.create({
        data: { userId: session.id, courseId }
      }),
      prisma.enrollment.create({
        data: { userId: session.id, courseId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
  }
}
