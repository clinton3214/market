import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Fetch only available listings, exclude credentials
    const listings = await Listing.find({ status: 'available' }).select('-credentials -__v');
    
    const formattedListings = listings.map(l => ({
      ...l.toObject(),
      id: l._id.toString()
    }));

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
