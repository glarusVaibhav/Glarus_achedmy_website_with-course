import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { PurchaseService } from '@/lib/services/purchaseService';

export async function GET() {
  try {
    const user = await verifyStudentSession();
    const data = await PurchaseService.getStudentPaymentHistory(user.id);
    return NextResponse.json(data);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Student Payments Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payment history.' } },
      { status: 500 }
    );
  }
}
