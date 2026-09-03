import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { LiveSessionService } from '@/lib/services/liveSessionService';

export async function GET() {
  try {
    const user = await verifyStudentSession();
    const data = await LiveSessionService.getEnrolledLiveCoursesAndClasses(user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Live Courses Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch live training courses.' } },
      { status: 500 }
    );
  }
}
