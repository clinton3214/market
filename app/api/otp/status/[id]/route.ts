import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';
import User from '@/models/User';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Use URL search params to extract wsToken (for legacy/guest access)
    const url = new URL(request.url);
    const wsToken = url.searchParams.get('wsToken');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await dbConnect();
    const order = await OtpOrder.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let isAuthorized = false;

    // 1. Try session auth
    if (token) {
      const user = await User.findById(token);
      if (user && order.customer_email === user.email) {
        isAuthorized = true;
      }
    }

    // 2. Fallback to wsToken auth
    if (!isAuthorized && wsToken && order.ws_auth_token === wsToken) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RESILIENCE FALLBACK: 
    // If we're waiting for an SMS, directly check the 5sim API right now.
    // This guarantees the frontend gets the SMS even if the backend server.js crashed or missed it.
    if (order.status === 'awaiting_sms' && order.five_sim_order_id) {
      try {
        const { checkOrderStatus } = await import('@/lib/fiveSim');
        const statusResult = await checkOrderStatus(order.five_sim_order_id);
        
        let stateChanged = false;
        
        if (statusResult.sms && statusResult.sms.length > 0) {
          const latestSms = statusResult.sms[0];
          order.status = 'code_delivered';
          order.otp_code = latestSms.code;
          order.full_sms_text = latestSms.text;
          order.state_transitions.push({ status: 'code_delivered', timestamp: new Date() });
          stateChanged = true;
        } else if (statusResult.status === 'CANCELED' || statusResult.status === 'TIMEOUT' || statusResult.status === 'BANNED') {
          order.status = 'failed_timeout';
          order.state_transitions.push({ status: 'failed_timeout', timestamp: new Date(), note: `5sim status: ${statusResult.status} (frontend check)` });
          stateChanged = true;
        } else if (order.expires_at && new Date() > new Date(order.expires_at)) {
          order.status = 'failed_timeout';
          order.state_transitions.push({ status: 'failed_timeout', timestamp: new Date(), note: '15 min timeout (frontend check)' });
          stateChanged = true;
        }

        if (stateChanged) {
          await order.save();
        }
      } catch (checkErr) {
        console.error(`[Frontend Polling] Failed to check 5sim status for ${id}:`, checkErr);
      }
    }

    return NextResponse.json({
      status: order.status,
      phone_number: order.phone_number,
      otp_code: order.otp_code,
      full_sms_text: order.full_sms_text,
      expires_at: order.expires_at,
      wsToken: order.ws_auth_token, // securely pass token back to client so it can join WebSocket
    });
  } catch (error) {
    console.error('Status Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
