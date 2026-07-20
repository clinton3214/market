import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { sendAccountCredentialsEmail } from '@/lib/mailer';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(bodyText)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === 'charge.success') {
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
