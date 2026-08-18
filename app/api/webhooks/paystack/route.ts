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
      const buyerEmail = event.data.customer?.email;

      if (!accountId || !buyerEmail) {
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      await dbConnect();
      
      const account = await Listing.findById(accountId);
      
      if (account && account.status === 'available') {
        account.status = 'sold';
        await account.save();
        
        console.log(`[Delivery] Account ${accountId} sold to ${buyerEmail}!`);
        
        // Send email with credentials
        await sendAccountCredentialsEmail(buyerEmail, account);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
