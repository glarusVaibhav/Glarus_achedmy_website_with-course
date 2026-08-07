import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    
    // Safety check - cannot delete self
    if (session.id === id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    const user = await prisma.user.delete({
      where: { id }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE_USER",
        details: `Deleted user ${user.email}`,
        adminId: session.id || "admin"
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
