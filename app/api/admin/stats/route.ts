import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OtpOrder from '@/models/OtpOrder';

export const dynamic = 'force-dynamic';

function isAuthenticated(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.includes('admin_token=true');
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Count successful OTP orders
    const successStatuses = ['code_delivered', 'completed'];
    
    const otpCount = await OtpOrder.countDocuments({ status: { $in: successStatuses } });
    
    // Aggregate OTP revenue
    const revenueAggregation = await OtpOrder.aggregate([
      { $match: { status: { $in: successStatuses } } },
      { $group: { _id: null, totalRevenue: { $sum: '$sell_price' } } }
    ]);
    
    const otpRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    return NextResponse.json({ otpCount, otpRevenue });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
