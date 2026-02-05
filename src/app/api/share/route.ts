import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demo purposes
// In production, this would be Supabase
const shareCodes: Map<string, {
  code: string;
  scores: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  usedBy: string | null;
}> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores } = body;

    if (!scores) {
      return NextResponse.json(
        { error: 'Missing scores data' },
        { status: 400 }
      );
    }

    // Generate a short, readable share code
    const code = uuidv4().split('-')[0].toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    shareCodes.set(code, {
      code,
      scores,
      createdAt: new Date().toISOString(),
      expiresAt,
      usedBy: null,
    });

    return NextResponse.json({
      code,
      expiresAt,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/compare?code=${code}`,
    });
  } catch (error) {
    console.error('Share code error:', error);
    return NextResponse.json(
      { error: 'Failed to create share code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing share code' },
        { status: 400 }
      );
    }

    const shareData = shareCodes.get(code.toUpperCase());

    if (!shareData) {
      return NextResponse.json(
        { error: 'Invalid or expired share code' },
        { status: 404 }
      );
    }

    if (new Date(shareData.expiresAt) < new Date()) {
      shareCodes.delete(code.toUpperCase());
      return NextResponse.json(
        { error: 'Share code has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      scores: shareData.scores,
      createdAt: shareData.createdAt,
    });
  } catch (error) {
    console.error('Share code lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up share code' },
      { status: 500 }
    );
  }
}
