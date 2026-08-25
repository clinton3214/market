import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';
import { getLivePrice } from '@/lib/fiveSim';
import { getExchangeRate } from '@/lib/exchangeRate';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

export async function POST(request: Request) {
  try {
    const { email, country, service } = await request.json();

    if (!email || !country || !service) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch live price from 5sim
    const cost_price = await getLivePrice(country, service);
    
    if (cost_price === null) {
      return NextResponse.json({ error: "Out of stock on 5sim" }, { status: 404 });
    }

    // 2. Compute markup with live exchange rate
    let exchangeRate: number;
    try {
      exchangeRate = await getExchangeRate();
    } catch (err: any) {
      return NextResponse.json({ error: "Pricing currently unavailable. Please try again shortly." }, { status: 503 });
    }

    const cost_price_ngn = cost_price * exchangeRate;
    const base_sell = cost_price_ngn + 100;
    // Round to nearest 50 NGN
    const sell_price = Math.ceil(base_sell / 50) * 50; 

    await dbConnect();

    // 3. Create OtpOrder in pending state
    const order = new OtpOrder({
      customer_email: email,
      country,
      service,
      cost_price: cost_price_ngn, // NGN cost
      usd_cost: cost_price,       // USD cost
      exchange_rate_used: exchangeRate,
      sell_price,
      status: 'pending_payment',
    });

    await order.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // 4. Initialize Paystack transaction
    const params = {
      email,
      amount: sell_price * 100, // Paystack uses kobo
      callback_url: `${appUrl}/otp/status/${order._id.toString()}`,
      metadata: {
        order_type: 'otp',
        order_id: order._id.toString(),
      },
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data && data.status) {
      // Save paystack reference for idempotency tracking
      order.paystack_reference = data.data.reference;
      await order.save();
      
      return NextResponse.json({ 
        checkoutUrl: data.data.authorization_url,
        orderId: order._id.toString(),
        wsToken: order.ws_auth_token,
      });
    } else {
      return NextResponse.json({ error: "Failed to initialize payment", details: data.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Checkout Error:', err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
