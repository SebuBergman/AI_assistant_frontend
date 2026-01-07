// app/api/chats/[chatId]/messages/route.ts - Get/Add messages
import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/chatService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    console.log("Fetching messages for chatId:", chatId);
    const messages = await ChatService.getChatMessages(chatId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const { role, content, references } = await request.json();

    if (!role || !content || !["user", "assistant"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role or content" },
        { status: 400 }
      );
    }

    const message = await ChatService.addMessage(chatId, role, content, references);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}