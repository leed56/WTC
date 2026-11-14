import crypto from 'crypto';
import { cookies } from 'next/headers';

export const STAFF_COOKIE_NAME = 'wtc_staff_session';

function getSessionSecret(): string {
  return (
    process.env.STAFF_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'wtc-gem-lab-default-session-secret-2026'
  );
}

export function getExpectedStaffPin(): string {
  return (process.env.STAFF_ACCESS_PIN || 'WTC-LAB-2026').trim();
}

export function createStaffSessionToken(): string {
  const issuedAt = Date.now().toString();
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`staff:${issuedAt}`)
    .digest('hex');
  return `${issuedAt}.${sig}`;
}

export function verifyStaffSessionToken(token?: string | null): boolean {
  if (!token || !token.includes('.')) return false;
  const [issuedAt, sig] = token.split('.');
  if (!issuedAt || !sig) return false;

  const ts = Number(issuedAt);
  // Session expires after 24 hours
  if (!Number.isFinite(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`staff:${issuedAt}`)
    .digest('hex');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export async function isStaffAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
    return verifyStaffSessionToken(token);
  } catch {
    return false;
  }
}
