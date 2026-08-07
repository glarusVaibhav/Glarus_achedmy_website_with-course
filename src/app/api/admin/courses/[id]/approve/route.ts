import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const course = await prisma.course.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    await prisma.auditLog.create({
      data: {
        action: "APPROVE_COURSE",
        details: `Approved course: ${course.title} (${course.id})`,
        adminId: session.id || "admin"
      }
    });

    return NextResponse.json({ success: true, course });
  } catch (err) {
    return NextResponse.json({ error: "Failed to approve course" }, { status: 500 });
  }
}
