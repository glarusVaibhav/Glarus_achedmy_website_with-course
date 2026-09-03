import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { AssignmentService } from '@/lib/services/assignmentService';
import { AssignmentSubmissionSchema } from '@/lib/validation/studentSchemas';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await verifyStudentSession();
    const body = await request.json();

    const validation = AssignmentSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message || 'Invalid assignment submission data',
          },
        },
        { status: 400 }
      );
    }

    const result = await AssignmentService.submitAssignment(user.id, id, validation.data);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Assignment Submission Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit assignment.' } },
      { status: 500 }
    );
  }
}
