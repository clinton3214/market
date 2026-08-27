import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { reference } = await request.json();

    if (!id || !reference) {
      return NextResponse.json({ error: 'Missing order ID or reference' }, { status: 400 });
    }

    await dbConnect();
    const order = await OtpOrder.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If already past pending_payment, the webhook (or a previous call) already handled it
    if (order.status !== 'pending_payment') {
      return NextResponse.json({
        status: order.status,
        phone_number: order.phone_number,
        otp_code: order.otp_code,
        full_sms_text: order.full_sms_text,
        expires_at: order.expires_at,
        already_processed: true,
      });
    }

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData?.status || verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment not yet confirmed by Paystack' }, { status: 402 });
    }

    // Double-check: re-fetch the order to avoid race with webhook
    const freshOrder = await OtpOrder.findById(id);
    if (!freshOrder || freshOrder.status !== 'pending_payment') {
      return NextResponse.json({
        status: freshOrder?.status || 'unknown',
        already_processed: true,
      });
    }

    // Transition to paid
    freshOrder.status = 'paid';
    if (!freshOrder.paystack_reference) {
      freshOrder.paystack_reference = reference;
    }
    await freshOrder.save();

    // Execute 5sim purchase directly in frontend
    const { executeOtpPurchase } = await import('@/lib/otpLogic');
    await executeOtpPurchase(id);

    console.log(`[OTP Verify-Activate] Order ${id} verified, paid, and 5sim triggered via client fallback`);

    // Trigger the backend server.js to start polling
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
      : 'http://localhost:5000';

    const triggerBackend = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(`${backendUrl}/api/internal/start-otp-process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.INTERNAL_SECRET_KEY || 'default_secret',
            },
            body: JSON.stringify({ orderId: id }),
          });
          if (res.ok) return;
        } catch (err) {
          console.error(`[OTP Verify-Activate] Backend trigger attempt ${i + 1} failed:`, err);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    // Fire and forget - don't block the response
    triggerBackend();

    // Return the actual current state of the order after purchase attempt
    const updatedOrder = await OtpOrder.findById(id);
    return NextResponse.json({
      status: updatedOrder?.status || 'paid',
      phone_number: updatedOrder?.phone_number,
      expires_at: updatedOrder?.expires_at,
      activated: true,
    });
  } catch (error) {
    console.error('[OTP Verify-Activate] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
