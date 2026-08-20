import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProgressStore } from "../route";

// In-memory note store
interface StudentNote {
  id: string;
  recordingId: string;
  userId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  content: string;
  createdAt: string;
}

const notesStore: Record<string, StudentNote[]> = {
  "rec-rag-vector-db": [
    {
      id: "note-1",
      recordingId: "rec-rag-vector-db",
      userId: "default",
      timestampSeconds: 1240,
      timestampFormatted: "20:40",
      content: "Voyage AI embeddings show 12% higher MRR on financial domain text compared to standard text-embedding-ada-002.",
      createdAt: "2026-08-16T10:15:00.000Z",
    },
    {
      id: "note-2",
      recordingId: "rec-rag-vector-db",
      userId: "default",
      timestampSeconds: 2538,
      timestampFormatted: "42:18",
      content: "Reciprocal Rank Fusion formula: RRF_Score = sum(1 / (k + rank_i)) where k=60 is standard.",
      createdAt: "2026-08-16T10:45:00.000Z",
    },
    {
      id: "note-3",
      recordingId: "rec-rag-vector-db",
      userId: "default",
      timestampSeconds: 4680,
      timestampFormatted: "1:18:00",
      content: "Always wrap self-query retrievers in a timeout retry block to handle transient OpenAI rate limits.",
      createdAt: "2026-08-16T11:10:00.000Z",
    },
  ],
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const userId = session?.id || "default";

    // Call recordings list to get recording
    const url = new URL(request.url);
    const recordingsRes = await fetch(`${url.origin}/api/student/recordings`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!recordingsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch recording data" }, { status: 500 });
    }

    const data = await recordingsRes.json();
    const recording = data.recordings?.find((r: any) => r.id === id);

    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    const userNotes = (notesStore[id] || []).filter((n) => n.userId === userId || n.userId === "default");

    return NextResponse.json({
      recording,
      notes: userNotes,
    });
  } catch (err) {
    console.error("[Recording Detail API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const userId = session?.id || "default";
    const body = await request.json();

    const { action } = body;

    // ACTION 1: UPDATE WATCH PROGRESS
    if (action === "UPDATE_PROGRESS") {
      const { secondsWatched, totalDurationSeconds } = body;
      const duration = totalDurationSeconds || 6000;
      const percent = Math.min(100, Math.round((secondsWatched / duration) * 100));

      const status: "UNWATCHED" | "IN_PROGRESS" | "WATCHED" =
        percent >= 95 ? "WATCHED" : percent > 0 ? "IN_PROGRESS" : "UNWATCHED";

      const userStore = getProgressStore(userId);
      userStore[id] = {
        secondsWatched: Math.round(secondsWatched),
        percent,
        status,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        progress: userStore[id],
      });
    }

    // ACTION 2: ADD NOTE
    if (action === "ADD_NOTE") {
      const { timestampSeconds, content } = body;
      if (!content || !content.trim()) {
        return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
      }

      const mins = Math.floor(timestampSeconds / 60);
      const secs = String(Math.floor(timestampSeconds % 60)).padStart(2, "0");
      const hrs = Math.floor(mins / 60);
      const formattedMins = String(mins % 60).padStart(2, "0");
      const timestampFormatted = hrs > 0 ? `${hrs}:${formattedMins}:${secs}` : `${mins}:${secs}`;

      const newNote: StudentNote = {
        id: `note-${Date.now()}`,
        recordingId: id,
        userId,
        timestampSeconds: Math.round(timestampSeconds),
        timestampFormatted,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      if (!notesStore[id]) {
        notesStore[id] = [];
      }
      notesStore[id].unshift(newNote);

      return NextResponse.json({
        success: true,
        note: newNote,
        notes: notesStore[id],
      });
    }

    // ACTION 3: DELETE NOTE
    if (action === "DELETE_NOTE") {
      const { noteId } = body;
      if (notesStore[id]) {
        notesStore[id] = notesStore[id].filter((n) => n.id !== noteId);
      }
      return NextResponse.json({
        success: true,
        notes: notesStore[id] || [],
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Recording Action API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
