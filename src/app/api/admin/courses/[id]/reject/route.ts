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
      data: { status: "REJECTED" }
    });

    await prisma.auditLog.create({
      data: {
        action: "REJECT_COURSE",
        details: `Rejected course: ${course.title} (${course.id})`,
        adminId: session.id || "admin"
      }
    });

    return NextResponse.json({ success: true, course });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reject course" }, { status: 500 });
  }
}
