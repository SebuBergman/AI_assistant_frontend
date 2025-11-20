import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PY_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const { email, tone } = await req.json();

    console.log('[POST /api/email/rewrite] Received request');
    console.log('Email length:', email?.length);
    console.log('Tone:', tone);

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }
    
    if (!tone || typeof tone !== 'string') {
      return NextResponse.json(
        { error: 'Tone is required' },
        { status: 400 }
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
        tone
      }),
    });

    if (!backendRes.ok) {
      console.error('[POST /api/email/rewrite] Python API error:', backendRes.status);
      throw new Error(`Python API error: ${backendRes.status}`);
    }

    const data = await backendRes.json();

    console.log('[POST /api/email/rewrite] Success');

    // Stream the backend response directly to the client
    return NextResponse.json({
      rewritten_email: data.rewritten_email || 'No response received.',
    });
    
  } catch (error) {
    console.error('[POST /api/email/rewrite] Error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite email. Please try again.' },
      { status: 500 }
    );
  }
}