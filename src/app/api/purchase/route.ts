import { NextResponse } from 'next/server';
import { verifyStudentSession, AuthError } from '@/lib/services/studentAuthService';
import { PurchaseService, CheckoutItemInput } from '@/lib/services/purchaseService';

export async function POST(req: Request) {
  try {
    const user = await verifyStudentSession();
    const body = await req.json();

    let itemsToProcess: CheckoutItemInput[] = [];

    if (Array.isArray(body.items) && body.items.length > 0) {
      itemsToProcess = body.items.map((it: any) => ({
        id: it.id,
        type: it.type === 'LIVE_COURSE' ? 'LIVE_COURSE' : 'SELF_PACED_COURSE',
      }));
    } else if (body.courseId) {
      const isLive = Boolean(body.isLive || body.itemType === 'LIVE_COURSE');
      itemsToProcess = [
        {
          id: body.courseId,
          type: isLive ? 'LIVE_COURSE' : 'SELF_PACED_COURSE',
        },
      ];
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PAYLOAD', message: 'Cart items or courseId is required.' } },
        { status: 400 }
      );
    }

    const result = await PurchaseService.processCheckout(
      user.id,
      itemsToProcess,
      body.paymentMethod || 'CARD',
      body.billingDetails,
      body.transactionId
    );

    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    console.error('[Purchase API Error]:', err);
    return NextResponse.json(
      { success: false, error: { code: 'PURCHASE_FAILED', message: err.message || 'Payment processing failed.' } },
      { status: 400 }
    );
  }
}
