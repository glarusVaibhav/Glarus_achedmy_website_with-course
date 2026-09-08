import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
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
    
    // Find student
    const student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        OR: [{ id }, { email: id }]
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Determine target status
    let targetStatus: "ACTIVE" | "BLOCKED" = student.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    if (body.status && (body.status === "ACTIVE" || body.status === "BLOCKED")) {
      targetStatus = body.status;
    } else if (body.status === "Active") {
      targetStatus = "ACTIVE";
    } else if (body.status === "Blocked") {
      targetStatus = "BLOCKED";
    }

    // Update student status
    const updatedUser = await prisma.user.update({
      where: { id: student.id },
      data: { status: targetStatus }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: targetStatus === "BLOCKED" ? "BLOCK_STUDENT" : "UNBLOCK_STUDENT",
        details: `Admin changed student ${student.name} (${student.email}) status to ${targetStatus}`,
        adminId: session?.id || student.id
      }
    }).catch((e) => console.warn("Could not log audit:", e));

    return NextResponse.json({
      success: true,
      message: `Student account successfully ${targetStatus === "BLOCKED" ? "blocked" : "unblocked"}`,
      status: targetStatus === "BLOCKED" ? "Blocked" : "Active",
      rawStatus: targetStatus
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/students/[id]/status:", err);
    return NextResponse.json({ error: "Failed to update student status", details: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  return PATCH(req, props);
}
