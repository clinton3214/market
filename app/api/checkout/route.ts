import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy';

export async function POST(request: Request) {
  try {
    const { accountId, email } = await request.json();
    
    await dbConnect();
    
    // Ensure the listing is still available
    const account = await Listing.findOne({ _id: accountId, status: 'available' });
    
    if (!account) {
      return NextResponse.json({ error: "Out of stock" }, { status: 400 });
    }
    
    const params = {
      email: email || "customer@example.com",
      amount: account.price * 100, // Paystack amount is in kobo/cents
      metadata: { account_id: account._id.toString() }
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
        if (PAYSTACK_SECRET_KEY === 'sk_test_dummy') {
          return NextResponse.json({ checkoutUrl: 'https://checkout.paystack.com/dummy' });
        }
        return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
      }
    } catch (fetchErr) {
      // If network is completely down for fetch, but using dummy key
      if (PAYSTACK_SECRET_KEY === 'sk_test_dummy') {
        return NextResponse.json({ checkoutUrl: 'https://checkout.paystack.com/dummy' });
      }
      throw fetchErr;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
