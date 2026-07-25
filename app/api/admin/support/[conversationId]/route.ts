import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await dbConnect();
    const { conversationId } = await params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Mark admin unread count as 0
    if (conversation.unreadCountAdmin > 0) {
      conversation.unreadCountAdmin = 0;
      await conversation.save();
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    return NextResponse.json(
      {
        conversation,
        messages,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/support/[conversationId]:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: 'admin',
      text: text.trim(),
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessageText = text.trim();
    conversation.unreadCountUser += 1;
    await conversation.save();

    return NextResponse.json(
      {
        message,
        conversation,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error in POST /api/admin/support/[conversationId]:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
