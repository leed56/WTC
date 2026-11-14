import { NextRequest, NextResponse } from 'next/server';
import {
  STAFF_COOKIE_NAME,
  createStaffSessionToken,
  getExpectedStaffPin,
  isStaffAuthenticated,
} from '@/lib/staffAuth';

export async function GET() {
  const authenticated = await isStaffAuthenticated();
  return NextResponse.json({
    authenticated,
    usingDefaultPin: !process.env.STAFF_ACCESS_PIN,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pin = String(body?.pin || '').trim();
    const expected = getExpectedStaffPin();

    if (!pin || pin !== expected) {
      return NextResponse.json(
        { error: 'Invalid Staff Access PIN.' },
        { status: 401 }
      );
    }

    const token = createStaffSessionToken();
    const res = NextResponse.json({ authenticated: true });
    res.cookies.set(STAFF_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(STAFF_COOKIE_NAME);
  return res;
}
