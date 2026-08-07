import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "APPROVED" },
      include: { instructor: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ courses });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Instructors must be verified before creating courses (admins bypass)
    if (session.role === "INSTRUCTOR") {
      const approval = await prisma.instructorApproval.findUnique({
        where: { userId: session.id },
      });
      if (!approval || approval.status !== "APPROVED") {
        return NextResponse.json(
          { error: "You must complete instructor verification before creating courses." },
          { status: 403 }
        );
      }
    }

    const { title, description, price } = await req.json();

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        instructorId: session.id,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, course });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
