import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();
    
    console.log('[Checkout API] Received accountId:', accountId);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();

    const user = await User.findById(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.email;
    
    // Ensure the listing is still available
    const account = await Listing.findOne({ 
      _id: accountId, 
      status: 'available',
      isSold: { $ne: true }
    });
    
    console.log('[Checkout API] Found account:', account);
    
    if (!account) {
      return NextResponse.json({ error: "Out of stock", redirectUrl: "/out-of-stock" }, { status: 400 });
    }

    // If reserved by someone else, block it
    if (account.reservedUntil && account.reservedUntil > new Date() && account.reservedBy !== user._id.toString()) {
      return NextResponse.json({ error: "Account is currently reserved by another buyer. Please try again later.", redirectUrl: "/out-of-stock" }, { status: 400 });
    }

    let masterHandle = null;

    if (account.aliasOfHandle) {
      // Check master listing
      const masterListing = await Listing.findOne({
          handle: account.aliasOfHandle,
          status: 'available',
          isSold: { $ne: true }
      });

      if (!masterListing) {
        return NextResponse.json({ 
          error: "Out of stock", 
          redirectUrl: `/out-of-stock?platform=${account.platform}` 
        }, { status: 400 });
      }

      if (masterListing.reservedUntil && masterListing.reservedUntil > new Date() && masterListing.reservedBy !== user._id.toString()) {
        return NextResponse.json({ 
          error: "Account is currently reserved by another buyer. Please try again later.", 
          redirectUrl: `/out-of-stock?platform=${account.platform}` 
        }, { status: 400 });
      }

      // Reserve the master listing
      await Listing.updateOne(
        { _id: masterListing._id },
        { $set: { reservedUntil: new Date(Date.now() + 2 * 60 * 1000), reservedBy: user._id.toString() } }
      );

      masterHandle = masterListing.handle;
    } else {
      // Reserve the current account if it's not an alias
      await Listing.updateOne(
        { _id: account._id },
        { $set: { reservedUntil: new Date(Date.now() + 2 * 60 * 1000), reservedBy: user._id.toString() } }
      );
    }
    
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    const params = {
      email: email || "customer@example.com",
      amount: account.price * 100, // Paystack amount is in kobo/cents
      metadata: { 
        account_id: account._id.toString(),
        ...(masterHandle ? { 
          master_handle: masterHandle, 
          alias_handle: account.handle 
        } : {})
      },
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
