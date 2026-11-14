import QRCode from 'qrcode';
import { GemCertificate, INITIAL_CERTIFICATES } from './gemData';

const STORAGE_KEY = 'wtc_gem_lab_certificates_v1';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export function getStoredCertificates(): GemCertificate[] {
  if (typeof window === 'undefined') {
    return INITIAL_CERTIFICATES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CERTIFICATES;
  } catch (e) {
    console.error('Error reading certificates from localStorage', e);
    return INITIAL_CERTIFICATES;
  }
}

export function saveCertificates(certs: GemCertificate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
  } catch (e) {
    console.error('Error saving certificates to localStorage', e);
  }
}

export function findCertificateByNumber(reportNumber: string): GemCertificate | null {
  const clean = reportNumber.trim().toUpperCase();
  const certs = getStoredCertificates();
  return certs.find((c) => c.reportNumber.trim().toUpperCase() === clean) || null;
}

export function addOrUpdateCertificate(cert: GemCertificate): void {
  const certs = getStoredCertificates();
  const existingIndex = certs.findIndex(
    (c) => c.reportNumber.trim().toUpperCase() === cert.reportNumber.trim().toUpperCase()
  );

  if (existingIndex >= 0) {
    certs[existingIndex] = cert;
  } else {
    certs.unshift(cert);
  }
  saveCertificates(certs);
}

export function removeCertificate(reportNumber: string): void {
  const clean = reportNumber.trim().toUpperCase();
  const certs = getStoredCertificates().filter(
    (c) => c.reportNumber.trim().toUpperCase() !== clean
  );
  saveCertificates(certs);
}

export function resetToDefaultCertificates(): GemCertificate[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CERTIFICATES));
  }
  return INITIAL_CERTIFICATES;
}

export async function fetchCertificatesFromApi(): Promise<GemCertificate[]> {
  try {
    const res = await fetch('/api/certificates', { cache: 'no-store' });
    if (!res.ok) return getStoredCertificates();
    const data = await res.json();
    if (Array.isArray(data?.certificates) && data.certificates.length > 0) {
      if (data.source === 'supabase') {
        saveCertificates(data.certificates);
        return data.certificates;
      }
    }
  } catch {
    // Fall back to localStorage
  }
  return getStoredCertificates();
}

export async function findCertificateFromApi(
  reportNumber: string
): Promise<GemCertificate | null> {
  const clean = reportNumber.trim().toUpperCase();
  if (!clean) return null;

  try {
    const res = await fetch(
      `/api/certificates?reportNumber=${encodeURIComponent(clean)}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.certificate) {
        return data.certificate as GemCertificate;
      }
    }
  } catch {
    // Fall back to localStorage
  }
  return findCertificateByNumber(clean);
}

export async function saveCertificateToApi(
  cert: GemCertificate
): Promise<{ ok: boolean; source: string; error?: string }> {
  addOrUpdateCertificate(cert);
  try {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cert),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, source: 'local-fallback', error: data?.error };
    }
    return { ok: true, source: data?.source || 'supabase' };
  } catch {
    return { ok: false, source: 'local-fallback', error: 'Network error' };
  }
}

export async function deleteCertificateFromApi(
  reportNumber: string
): Promise<void> {
  removeCertificate(reportNumber);
  try {
    await fetch(
      `/api/certificates?reportNumber=${encodeURIComponent(reportNumber)}`,
      { method: 'DELETE' }
    );
  } catch {
    // Local removal already applied
  }
}
