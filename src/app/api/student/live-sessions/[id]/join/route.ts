import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { LiveSessionService } from '@/lib/services/liveSessionService';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await verifyStudentSession();

    const access = await LiveSessionService.getLiveSessionJoinAccess(user.id, id);
    return NextResponse.json(access);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Live Join Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'JOIN_FAILED',
          message: err.message || 'Unable to join live classroom at this time.',
        },
      },
      { status: 400 }
    );
  }
}
