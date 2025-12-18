// app/api/chat/email/rewrite/route.ts
import { NextRequest } from 'next/server';
import { ChatService } from '@/lib/chatService';

const PYTHON_API_URL = process.env.PY_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const { email, tone} = await req.json();

    // Validate input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!tone || typeof tone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Tone is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward request to Python backend
    const backendRes = await fetch(`${PYTHON_API_URL}/email_assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        tone,
      }),
    });

    if (!backendRes.ok) {
      console.error('[POST /api/chat/email/rewrite] Python API error:', backendRes.status);
      return new Response("Backend error", { status: backendRes.status });
    }

    // Stream the backend response directly to the client
    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
    
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}