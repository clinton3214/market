import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { sendAccountCredentialsEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data && data.status && data.data.status === 'success') {
      const accountId = data.data.metadata?.account_id;
      const masterHandle = data.data.metadata?.master_handle;
      const aliasHandle = data.data.metadata?.alias_handle;

      if (!accountId) {
        return NextResponse.json({ error: "Account ID not found in transaction" }, { status: 400 });
      }

      await dbConnect();
      const account = await Listing.findById(accountId);

      if (!account) {
        return NextResponse.json({ error: "Account not found in database" }, { status: 404 });
      }

      let credentialsToReturn = account.credentials;
      let accountDetailsToEmail = account;

      // If the webhook hasn't fired yet, we can mark it as sold here too
      if (account.status === 'available') {
        account.status = 'sold';
        account.isSold = true;
        if (data.data.customer?.email) {
          account.buyerEmail = data.data.customer.email;
        }
        account.purchasedAt = new Date();
        await account.save();
        
        if (masterHandle) {
          // Mark master and all its aliases as sold
          await Listing.updateMany(
            { $or: [{ handle: masterHandle }, { aliasOfHandle: masterHandle }] },
            { $set: { status: 'sold', isSold: true } }
          );

          // Fetch master listing to get credentials
          const masterListing = await Listing.findOne({ handle: masterHandle });
          if (masterListing) {
            credentialsToReturn = masterListing.credentials;
            accountDetailsToEmail = {
              ...masterListing.toObject(),
              handle: aliasHandle,
              platform: account.platform
            };
          }
        }

        // Also trigger the email securely from the backend so it works locally without webhook
        if (data.data.customer?.email) {
          try {
            await sendAccountCredentialsEmail(data.data.customer.email, accountDetailsToEmail);
            console.log(`[Delivery] Account ${accountId} sold and email sent to ${data.data.customer.email}`);
          } catch(e) {
            console.error('Failed to send email:', e);
          }
        }
      } else {
         // If it is already sold (webhook beat us), we still need to return correct credentials
         if (masterHandle) {
            const masterListing = await Listing.findOne({ handle: masterHandle });
            if (masterListing) {
              credentialsToReturn = masterListing.credentials;
            }
         }
      }

      return NextResponse.json({
        success: true,
        credentials: credentialsToReturn,
        platform: account.platform,
        handle: account.handle
      });
    } else {
      return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify Transaction Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
