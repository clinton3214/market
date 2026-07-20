import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { accountId, email } = await request.json();
    
    console.log('[Checkout API] Received accountId:', accountId);
    
    await dbConnect();
    
    // Ensure the listing is still available
    const account = await Listing.findOne({ _id: accountId, status: 'available' });
    
    console.log('[Checkout API] Found account:', account);
    
    if (!account) {
      return NextResponse.json({ error: "Out of stock" }, { status: 400 });
    }
    
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    const params = {
      email: email || "customer@example.com",
      amount: account.price * 100, // Paystack amount is in kobo/cents
      metadata: { account_id: account._id.toString() },
      callback_url: `${origin}/success`
    };
    
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      const data = await response.json();
      
      if (data && data.status) {
        return NextResponse.json({ checkoutUrl: data.data.authorization_url });
      } else {
        return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 400 });
      }
    } catch (fetchErr) {
      console.error('Paystack Fetch Error:', fetchErr);
      return NextResponse.json({ error: "Failed to connect to payment gateway" }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
