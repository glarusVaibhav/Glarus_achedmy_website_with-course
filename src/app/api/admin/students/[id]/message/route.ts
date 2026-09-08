import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
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
    const messageContent = (body.message || "").trim();

    if (!messageContent) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        OR: [{ id }, { email: id }]
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create persistent Notification in database
    const notification = await prisma.notification.create({
      data: {
        recipientId: student.id,
        actorId: session?.id || undefined,
        title: body.subject || "Message from Academic Administration",
        message: messageContent,
        category: "STUDENT",
        type: "ADMIN_INSTRUCTION",
        priority: "HIGH",
        isRead: false
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: "MESSAGE_STUDENT",
        details: `Direct message sent to ${student.name} (${student.email}): "${messageContent.slice(0, 100)}"`,
        adminId: session?.id || student.id
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Message sent successfully to ${student.email}`,
      notificationId: notification.id
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/students/[id]/message:", err);
    return NextResponse.json({ error: "Failed to send message", details: err?.message }, { status: 500 });
  }
}
