import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { RecordingService } from '@/lib/services/recordingService';
import { RecordingProgressSchema, StudentNoteSchema } from '@/lib/validation/studentSchemas';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await verifyStudentSession();

    // 1. Get recordings list
    const { recordings } = await RecordingService.getStudentRecordings(user.id, {});
    const recording = recordings.find((r) => r.id === id);

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found or access expired.' }, { status: 404 });
    }

    // 2. Fetch notes from DB
    const dbNotes = await prisma.studentNote.findMany({
      where: {
        userId: user.id,
        sessionId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedNotes = dbNotes.map((n) => {
      const mins = Math.floor(n.timestampSeconds / 60);
      const secs = String(Math.floor(n.timestampSeconds % 60)).padStart(2, '0');
      const hrs = Math.floor(mins / 60);
      const formattedMins = String(mins % 60).padStart(2, '0');
      const timestampFormatted = hrs > 0 ? `${hrs}:${formattedMins}:${secs}` : `${mins}:${secs}`;

      return {
        id: n.id,
        recordingId: id,
        userId: n.userId,
        timestampSeconds: n.timestampSeconds,
        timestampFormatted,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      recording,
      notes: formattedNotes,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[Recording Detail API Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await verifyStudentSession();
    const body = await request.json();
    const { action } = body;

    // ACTION 1: UPDATE WATCH PROGRESS
    if (action === 'UPDATE_PROGRESS') {
      const parsed = RecordingProgressSchema.safeParse({
        sessionId: id,
        secondsWatched: Number(body.secondsWatched || 0),
        totalDurationSeconds: Number(body.totalDurationSeconds || 6000),
      });

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const progress = await RecordingService.updateWatchProgress(
        user.id,
        id,
        parsed.data.secondsWatched,
        parsed.data.totalDurationSeconds,
        parsed.data.percent,
        parsed.data.resumeTimestampSeconds,
        parsed.data.status
      );

      return NextResponse.json({
        success: true,
        progress: {
          secondsWatched: progress.secondsWatched,
          percent: progress.percent,
          status: progress.status,
          updatedAt: progress.updatedAt.toISOString(),
        },
      });
    }

    // ACTION 2: ADD NOTE
    if (action === 'ADD_NOTE') {
      const parsed = StudentNoteSchema.safeParse({
        sessionId: id,
        timestampSeconds: Number(body.timestampSeconds || 0),
        content: String(body.content || '').trim(),
      });

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      const note = await prisma.studentNote.create({
        data: {
          userId: user.id,
          sessionId: id,
          timestampSeconds: Math.round(parsed.data.timestampSeconds),
          content: parsed.data.content,
        },
      });

      const mins = Math.floor(note.timestampSeconds / 60);
      const secs = String(Math.floor(note.timestampSeconds % 60)).padStart(2, '0');
      const hrs = Math.floor(mins / 60);
      const formattedMins = String(mins % 60).padStart(2, '0');
      const timestampFormatted = hrs > 0 ? `${hrs}:${formattedMins}:${secs}` : `${mins}:${secs}`;

      return NextResponse.json({
        success: true,
        note: {
          id: note.id,
          recordingId: id,
          userId: note.userId,
          timestampSeconds: note.timestampSeconds,
          timestampFormatted,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
        },
      });
    }

    // ACTION 3: DELETE NOTE
    if (action === 'DELETE_NOTE') {
      const { noteId } = body;
      if (noteId) {
        await prisma.studentNote.deleteMany({
          where: { id: noteId, userId: user.id },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[Recording Action Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
