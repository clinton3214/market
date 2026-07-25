import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import User from '@/models/User';

async function getAuthenticatedUser(request: Request) {
  const authCookie = request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('auth_token='))
  const userId = authCookie ? authCookie.split('=')[1] : null
  if (!userId) return null
  const user = await User.findById(userId)
  return user
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to contact support.' }, { status: 401 });
    }

    let conversation = await Conversation.findOne({ userId: user._id });

    if (!conversation) {
      conversation = await Conversation.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name || 'User',
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
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to send a message.' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    let conversation = await Conversation.findOne({ userId: user._id });

    if (!conversation) {
      conversation = await Conversation.create({
        userId: user._id,
        userEmail: user.email,
        userName: user.name || 'User',
      });
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
