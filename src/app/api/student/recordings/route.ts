import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { RecordingService } from '@/lib/services/recordingService';

export interface RecordingItem {
  id: string;
  sessionTitle: string;
  courseName: string;
  courseId: string;
  instructor: string;
  instructorId: string;
  instructorAvatar?: string;
  module: string;
  sessionNumber: string;
  recordingUrl: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  completedAt: string;
  topics: string[];
  agenda: Array<{
    id: string;
    stepNumber: number;
    title: string;
    duration: string;
    timestampSeconds: number;
    timestampFormatted: string;
    description?: string;
  }>;
  takeaways: string[];
  resources: Array<{
    id: string;
    title: string;
    type: 'pdf' | 'github' | 'notebook' | 'cheatsheet';
    size?: string;
    url: string;
  }>;
  watchProgress: {
    secondsWatched: number;
    percent: number;
    status: 'UNWATCHED' | 'IN_PROGRESS' | 'WATCHED';
    lastWatchedFormatted?: string;
    resumeTimestampSeconds?: number;
    updatedAt: string;
  };
  notesCount: number;
}

export async function GET(request: Request) {
  try {
    const user = await verifyStudentSession();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const courseId = searchParams.get('courseId') || '';
    const instructor = searchParams.get('instructor') || '';
    const moduleFilter = searchParams.get('module') || '';
    const watchStatus = searchParams.get('watchStatus') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'RECENT';

    const data = await RecordingService.getStudentRecordings(user.id, {
      search,
      courseId,
      instructor,
      module: moduleFilter,
      watchStatus,
      sortBy,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Recordings API Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch recordings.' } },
      { status: 500 }
    );
  }
}
