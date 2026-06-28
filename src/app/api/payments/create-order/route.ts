import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { getSystemSetting } from '@/lib/access-control';

export async function POST(req: Request) {
  try {
    const { auditId } = await req.json();

    if (!auditId) {
      return NextResponse.json({ success: false, error: 'Missing auditId' }, { status: 400 });
    }

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit not found' }, { status: 404 });
    }

    // Initialize Razorpay (Requires valid API keys in production)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    // Get pricing from settings (Default to Launch Price 199)
    const priceStr = await getSystemSetting('LAUNCH_PRICE', '199');
    const amountInPaise = parseInt(priceStr, 10) * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_audit_${auditId}`,
      notes: {
        auditId: auditId,
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
