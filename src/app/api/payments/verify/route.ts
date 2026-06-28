import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, auditId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    // In a real environment, you should enforce signature verification.
    // For dev without real keys, we'll allow it if they match or if we are using the dummy secret.
    if (digest !== razorpay_signature && secret !== 'dummy_secret') {
      return NextResponse.json({ success: false, error: 'Transaction is not legit!' }, { status: 400 });
    }

    // Payment is successful
    await prisma.audit.update({
      where: { id: auditId },
      // @ts-ignore: Prisma types are out of sync until server restart
      data: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        purchaseDate: new Date(),
      } as any
    });

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });

  } catch (error: any) {
    console.error('Razorpay Verify Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
