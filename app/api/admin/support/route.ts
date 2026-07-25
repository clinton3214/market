import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET() {
  try {
    await dbConnect();

    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1 })
      .lean();

    const formatted = conversations.map((conv: any) => ({
      ...conv,
      id: conv._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return NextResponse.json({ conversations: formatted }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error in GET /api/admin/support:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
