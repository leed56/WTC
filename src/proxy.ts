import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy:
 * Keeps Staff Portal (/staff-lab, /admin) and staff-only write/tool APIs
 * strictly local-only (localhost / 127.0.0.1). On any deployed domain
 * (wtcgemlab.lk, *.vercel.app, etc.), those routes return 404 unless
 * ENABLE_STAFF_PORTAL=true is explicitly set.
 */
export function proxy(request: NextRequest) {
  if (process.env.ENABLE_STAFF_PORTAL === 'true') {
    return NextResponse.next();
  }

  const host = (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  ).toLowerCase();

  const isLocalhost =
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:');

  const isVercelEnv =
    process.env.VERCEL === '1' ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.VERCEL_URL);

  if (isLocalhost && !isVercelEnv) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Block staff UI pages online
  if (pathname.startsWith('/staff-lab') || pathname.startsWith('/admin')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Block staff-only API routes & write methods online
  const isBlockedApi =
    pathname.startsWith('/api/staff') ||
    pathname.startsWith('/api/microscope') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/customers') ||
    pathname.startsWith('/api/invoices') ||
    (pathname.startsWith('/api/certificates') && method !== 'GET') ||
    (pathname.startsWith('/api/submissions') && method === 'GET');

  if (isBlockedApi) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/staff-lab',
    '/staff-lab/:path*',
    '/admin',
    '/admin/:path*',
    '/api/staff/:path*',
    '/api/microscope/:path*',
    '/api/whatsapp/:path*',
    '/api/customers/:path*',
    '/api/invoices/:path*',
    '/api/certificates/:path*',
    '/api/submissions/:path*',
  ],
};
