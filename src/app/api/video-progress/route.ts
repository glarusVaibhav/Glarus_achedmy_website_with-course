import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { lectureId, progressSeconds, isCompleted } = await req.json();

    if (!lectureId) return NextResponse.json({ error: "lectureId required" }, { status: 400 });

    const progress = await prisma.videoProgress.upsert({
      where: { userId_lectureId: { userId: session.id, lectureId } },
      update: { progressSeconds, isCompleted: isCompleted || undefined }, // only mark complete if passed explicitly
      create: {
        userId: session.id,
        lectureId,
        progressSeconds,
        isCompleted: isCompleted || false
      }
    });

    return NextResponse.json({ success: true, progress });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const url = new URL(req.url);
    const lectureId = url.searchParams.get("lectureId");

    if (!session || !lectureId) return NextResponse.json({ error: "Bad Request" }, { status: 400 });

    const progress = await prisma.videoProgress.findUnique({
      where: { userId_lectureId: { userId: session.id, lectureId } }
    });

    return NextResponse.json({ progressSeconds: progress?.progressSeconds || 0, isCompleted: progress?.isCompleted || false });
  } catch (err) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
