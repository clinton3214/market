import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    let conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        userName: 'Guest User',
        lastMessageText: 'Hello! How can we assist you today?',
        unreadCountUser: 1,
      });

      // Add default welcome message for new chat
      await Message.create({
        conversationId: conversation._id,
        sender: 'admin',
        text: 'Hello! Welcome to Travis Pay Support. How can we assist you today?',
      });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error: any) {
    console.error('Error in GET /api/support:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { sessionId, userEmail, userName, text } = body;

    if (!sessionId || !text?.trim()) {
      return NextResponse.json({ error: 'sessionId and text are required' }, { status: 400 });
    }

    let conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        userEmail: userEmail || '',
        userName: userName || userEmail || 'Guest User',
      });
    } else if (userEmail && (!conversation.userEmail || conversation.userName === 'Guest User')) {
      conversation.userEmail = userEmail;
      if (userName) conversation.userName = userName;
      await conversation.save();
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: 'user',
      text: text.trim(),
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessageText = text.trim();
    conversation.unreadCountAdmin += 1;
    await conversation.save();

    return NextResponse.json({
      message,
      conversation,
    });
  } catch (error: any) {
    console.error('Error in POST /api/support:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
