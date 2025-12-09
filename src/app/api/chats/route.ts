// app/api/chats/route.ts - Get all chats & Create new chat
import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/chatService';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth - replace with your auth logic
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    const chats = await ChatService.getUserChats(userId);
    
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const body = await request.json();
    const { message } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const chat = await ChatService.createChat(userId, message);
    
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}