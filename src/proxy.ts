import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy:
 * Keeps Staff Portal (/staff-lab, /admin) and staff-only write/tool APIs
 * strictly local-only. On Vercel (process.env.VERCEL === '1'), those routes
 * return 404 unless ENABLE_STAFF_PORTAL=true is explicitly set.
 */
export function proxy(request: NextRequest) {
  const isVercelOnline =
    process.env.VERCEL === '1' && process.env.ENABLE_STAFF_PORTAL !== 'true';

  if (!isVercelOnline) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Block staff UI pages on Vercel
  if (pathname.startsWith('/staff-lab') || pathname.startsWith('/admin')) {
    return NextResponse.rewrite(new URL('/not-found', request.url), {
      status: 404,
    });
  }

  // Block staff-only API routes & write methods on Vercel
  const isBlockedApi =
    pathname.startsWith('/api/staff') ||
    pathname.startsWith('/api/microscope') ||
    pathname.startsWith('/api/whatsapp') ||
    (pathname.startsWith('/api/certificates') && method !== 'GET') ||
    (pathname.startsWith('/api/submissions') && method === 'GET');

  if (isBlockedApi) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/staff-lab/:path*',
    '/admin/:path*',
    '/api/staff/:path*',
    '/api/microscope/:path*',
    '/api/whatsapp/:path*',
    '/api/certificates/:path*',
    '/api/submissions/:path*',
  ],
};
