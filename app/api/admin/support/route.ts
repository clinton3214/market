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

    // Deduplicate by userId (since they are sorted by lastMessageAt desc, we keep the latest)
    const seenUsers = new Set();
    const deduplicatedConversations = [];
    
    for (const conv of conversations) {
      const uId = conv.userId ? conv.userId.toString() : conv.sessionId;
      if (!seenUsers.has(uId)) {
        seenUsers.add(uId);
        deduplicatedConversations.push(conv);
      }
    }

    const formatted = deduplicatedConversations.map((conv: any) => ({
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
