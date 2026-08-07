import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    let settings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const data = await req.json();

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: {
        platformName: data.platformName,
        currency: data.currency,
        commissionPercent: parseFloat(data.commissionPercent)
      },
      create: {
        id: "global",
        platformName: data.platformName,
        currency: data.currency,
        commissionPercent: parseFloat(data.commissionPercent)
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SETTINGS",
        details: "Platform settings updated",
        adminId: session.id || "admin"
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
