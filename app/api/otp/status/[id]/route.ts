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
