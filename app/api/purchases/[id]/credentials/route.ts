import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const purchase = await Listing.findOne({
      _id: id,
      buyerEmail: user.email,
      status: 'sold'
    });

    if (!purchase) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    // Check if it's older than 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    if (purchase.purchasedAt && purchase.purchasedAt < sixtyDaysAgo) {
      return NextResponse.json({ error: "Credentials expired" }, { status: 410 });
    }

    let credentialsToReturn = purchase.credentials;

    if (purchase.aliasOfHandle) {
      const masterListing = await Listing.findOne({ handle: purchase.aliasOfHandle });
      if (masterListing && masterListing.credentials) {
        credentialsToReturn = masterListing.credentials;
      }
    }

    return NextResponse.json({ 
      success: true, 
      credentials: credentialsToReturn 
    });
  } catch (error) {
    console.error('Credentials API Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
