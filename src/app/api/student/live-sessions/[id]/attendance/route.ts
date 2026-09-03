import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { AttendanceService } from '@/lib/services/attendanceService';
import { AttendanceHeartbeatSchema } from '@/lib/validation/studentSchemas';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await verifyStudentSession();
    const body = await request.json();

    const parsed = AttendanceHeartbeatSchema.safeParse({
      sessionId: id,
      ...body,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid attendance payload',
          },
        },
        { status: 400 }
      );
    }

    const attendance = await AttendanceService.recordAttendance(
      user.id,
      id,
      parsed.data.durationMinutes,
      parsed.data.joinedLateMinutes,
      parsed.data.notes
    );

    return NextResponse.json({ success: true, attendance });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Attendance Logging Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record live attendance.' } },
      { status: 500 }
    );
  }
}
