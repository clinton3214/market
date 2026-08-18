import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Use URL search params to extract wsToken
    const url = new URL(request.url);
    const wsToken = url.searchParams.get('wsToken');

    if (!id || !wsToken) {
      return NextResponse.json({ error: "Missing id or token" }, { status: 400 });
    }

    await dbConnect();
    const order = await OtpOrder.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.ws_auth_token !== wsToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      status: order.status,
      phone_number: order.phone_number,
      otp_code: order.otp_code,
      full_sms_text: order.full_sms_text,
      expires_at: order.expires_at,
    });
  } catch (error) {
    console.error('Status Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
