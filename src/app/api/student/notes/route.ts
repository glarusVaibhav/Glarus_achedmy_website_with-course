import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/student/notes?lectureId=...
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");

    const whereClause: any = { userId: session.id };
    if (lectureId) whereClause.lectureId = lectureId;

    const notes = await prisma.studentNote.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, notes });
  } catch (err: any) {
    console.error("[Student Notes GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST /api/student/notes (create or update a note)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lectureId, timestampSeconds, content, noteId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
    }

    if (noteId) {
      const existing = await prisma.studentNote.findUnique({ where: { id: noteId } });
      if (!existing || existing.userId !== session.id) {
        return NextResponse.json({ error: "Note not found or forbidden" }, { status: 403 });
      }

      const updated = await prisma.studentNote.update({
        where: { id: noteId },
        data: {
          content: content.trim(),
          timestampSeconds: typeof timestampSeconds === "number" ? timestampSeconds : existing.timestampSeconds,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, note: updated });
    }

    if (!lectureId) {
      return NextResponse.json({ error: "lectureId is required" }, { status: 400 });
    }

    const note = await prisma.studentNote.create({
      data: {
        userId: session.id,
        lectureId,
        timestampSeconds: typeof timestampSeconds === "number" ? Math.floor(timestampSeconds) : 0,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    console.error("[Student Notes POST Error]:", err);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// DELETE /api/student/notes?noteId=...
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
    }

    const existing = await prisma.studentNote.findUnique({ where: { id: noteId } });
    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Note not found or forbidden" }, { status: 403 });
    }

    await prisma.studentNote.delete({ where: { id: noteId } });
    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (err: any) {
    console.error("[Student Notes DELETE Error]:", err);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
