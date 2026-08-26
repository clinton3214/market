import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import OtpOrder from '@/models/OtpOrder';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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

    // Get purchases from the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const purchases = await Listing.find({
      buyerEmail: user.email,
      status: 'sold',
      purchasedAt: { $gte: sixtyDaysAgo }
    }).sort({ purchasedAt: -1 });

    // Mask credentials before sending to the client
    const maskedPurchases = purchases.map((purchase) => {
      const p = purchase.toJSON();
      return {
        id: p.id,
        platform: p.platform,
        handle: p.handle,
        category: p.category || 'Account',
        price: p.price,
        status: p.status,
        purchasedAt: p.purchasedAt,
        // Mask credentials heavily
        credentials: {
          accountUsername: p.credentials?.accountUsername ? '••••••••' : null,
          accountPassword: p.credentials?.accountPassword ? '••••••••' : null,
          accountEmail: p.credentials?.accountEmail ? '••••••••' : null,
          emailPassword: p.credentials?.emailPassword ? '••••••••' : null,
          twoFactorAuth: p.credentials?.twoFactorAuth ? '••••••••' : null,
          backupCode: p.credentials?.backupCode ? '••••••••' : null,
        }
      };
    });

    // Fetch OTP Orders
    const otpOrders = await OtpOrder.find({
      customer_email: user.email
    }).sort({ createdAt: -1 });

    const mappedOtpOrders = otpOrders.map((order) => {
      const o = order.toJSON();
      return {
        id: o._id,
        platform: o.service,
        handle: o.phone_number || o.country,
        category: 'Foreign Number',
        price: o.amount,
        status: o.status, // Can be 'pending_payment', 'paid', 'purchasing', 'code_delivered', etc.
        purchasedAt: o.createdAt || new Date(),
        isOtp: true,
      };
    });

    const combinedPurchases = [...maskedPurchases, ...mappedOtpOrders]
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    return NextResponse.json({ purchases: combinedPurchases });
  } catch (error) {
    console.error('Purchases API Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
