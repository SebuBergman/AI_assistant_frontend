// app/api/chats/route.ts - Get all chats & Create new chat
import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@lib/chatService';

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

    // ADD THESE DEBUG LOGS:
    console.log('POST /api/chats called');
    console.log('userId:', userId);
    console.log('message:', message);
    console.log('Full body:', body);
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    console.log('About to call ChatService.createChat');
    const chat = await ChatService.createChat(userId, message);
    console.log('Chat created:', chat);
    
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}