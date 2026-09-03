import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { AssignmentService } from '@/lib/services/assignmentService';

export async function GET(request: Request) {
  try {
    const user = await verifyStudentSession();
    const { searchParams } = new URL(request.url);

    const course = searchParams.get('course') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const query = searchParams.get('q') || '';

    const data = await AssignmentService.getStudentAssignments(user.id, course, status, query);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Assignments Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch assignments.' } },
      { status: 500 }
    );
  }
}
