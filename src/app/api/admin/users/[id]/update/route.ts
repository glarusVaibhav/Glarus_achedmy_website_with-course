import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const { role, status } = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: { role, status }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER",
        details: `Role or Status updated for ${user.email}`,
        adminId: session.id
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
