import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Fetch only available listings that are not currently reserved, exclude credentials
    const listings = await Listing.find({ 
      status: 'available',
      isSold: { $ne: true },
      $or: [
        { reservedUntil: { $exists: false } },
        { reservedUntil: { $lt: new Date() } }
      ]
    }).select('-credentials -__v');
    
    // Create a map of available master handles
    const availableHandles = new Set(listings.map(l => l.handle));

    const formattedListings = listings
      .filter(l => !l.aliasOfHandle || availableHandles.has(l.aliasOfHandle))
      .map(l => ({
        ...l.toObject(),
        id: l._id.toString()
      }));

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
