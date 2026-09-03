import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { StudentDashboardService } from '@/lib/services/studentDashboardService';

export async function GET() {
  try {
    const user = await verifyStudentSession();
    const data = await StudentDashboardService.getDashboardOverview(user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Dashboard Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to load student dashboard overview.' } },
      { status: 500 }
    );
  }
}
