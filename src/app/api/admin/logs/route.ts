import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        admin: { select: { email: true } }
      },
      take: 100
    });

    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
