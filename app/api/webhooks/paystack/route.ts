import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { sendAccountCredentialsEmail } from '@/lib/mailer';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY || '')
      .update(bodyText)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === 'charge.success') {
      const orderType = event.data.metadata?.order_type;

      if (orderType === 'otp') {
        const orderId = event.data.metadata?.order_id;
        if (!orderId) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

        await dbConnect();
        const OtpOrder = require('@/models/OtpOrder').default;
        
        const order = await OtpOrder.findById(orderId);
        
        if (order && order.status === 'pending_payment') {
          // Idempotency: only process if it is pending_payment
          order.status = 'paid';
          await order.save();
          
          console.log(`[OTP] Order ${orderId} paid successfully!`);
          
          // Trigger the detached background process on server.js
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}` : 'http://localhost:5000';
          const triggerBackend = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
              try {
                const res = await fetch(`${backendUrl}/api/internal/start-otp-process`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'x-internal-secret': process.env.INTERNAL_SECRET_KEY || 'default_secret'
                  },
                  body: JSON.stringify({ orderId }),
                });
                if (res.ok) return;
              } catch (err) {
                console.error(`Trigger backend attempt ${i + 1} failed:`, err);
              }
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1s backoff
            }
          };
          triggerBackend();
        }
        
        // Fast response
        return NextResponse.json({ received: true });
      }

      const accountId = event.data.metadata?.account_id;
      const masterHandle = event.data.metadata?.master_handle;
      const aliasHandle = event.data.metadata?.alias_handle;
      const buyerEmail = event.data.customer?.email;

      if (!accountId || !buyerEmail) {
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      await dbConnect();
      
      const account = await Listing.findById(accountId);
      
      if (account && account.status === 'available') {
        account.status = 'sold';
        account.isSold = true;
        account.buyerEmail = buyerEmail;
        account.purchasedAt = new Date();
        await account.save();
        
        console.log(`[Delivery] Account ${accountId} sold to ${buyerEmail}!`);
        
        let accountDetailsToEmail = account;

        if (masterHandle) {
          // Mark master and all its aliases as sold
          await Listing.updateMany(
            { $or: [{ handle: masterHandle }, { aliasOfHandle: masterHandle }] },
            { $set: { status: 'sold', isSold: true } }
          );

          // Fetch master listing to get credentials
          const masterListing = await Listing.findOne({ handle: masterHandle });
          if (masterListing) {
            // Override handle to what the buyer purchased
            accountDetailsToEmail = {
              ...masterListing.toObject(),
              handle: aliasHandle,
              platform: account.platform
            };
          }
        }
        
        // Send email with credentials
        await sendAccountCredentialsEmail(buyerEmail, accountDetailsToEmail);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
