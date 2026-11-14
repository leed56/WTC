import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseServer';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { GemCertificate, INITIAL_CERTIFICATES } from '@/lib/gemData';

interface DbCertificateRow {
  report_number: string;
  payload: GemCertificate;
}

export async function GET(req: NextRequest) {
  const reportNumber = req.nextUrl.searchParams.get('reportNumber')?.trim();
  const supabase = getSupabaseAdmin();

  if (!supabase || !isSupabaseConfigured()) {
    if (reportNumber) {
      const match = INITIAL_CERTIFICATES.find(
        (c) => c.reportNumber.toUpperCase() === reportNumber.toUpperCase()
      );
      return NextResponse.json({
        source: 'seed-fallback',
        certificate: match || null,
      });
    }
    return NextResponse.json({
      source: 'seed-fallback',
      certificates: INITIAL_CERTIFICATES,
    });
  }

  try {
    if (reportNumber) {
      const { data, error } = await supabase
        .from('certificates')
        .select('report_number, payload')
        .ilike('report_number', reportNumber)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data) {
        return NextResponse.json({
          source: 'supabase',
          certificate: (data as DbCertificateRow).payload,
        });
      }

      // Also check INITIAL_CERTIFICATES seed if DB table is not seeded yet
      const seedMatch = INITIAL_CERTIFICATES.find(
        (c) => c.reportNumber.toUpperCase() === reportNumber.toUpperCase()
      );
      return NextResponse.json({
        source: seedMatch ? 'seed-fallback' : 'supabase',
        certificate: seedMatch || null,
      });
    }

    const { data, error } = await supabase
      .from('certificates')
      .select('report_number, payload')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const dbCerts = (data as DbCertificateRow[]).map((r) => r.payload);
    return NextResponse.json({
      source: 'supabase',
      certificates: dbCerts.length > 0 ? dbCerts : INITIAL_CERTIFICATES,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Staff authentication required.' },
      { status: 401 }
    );
  }

  try {
    const cert = (await req.json()) as GemCertificate;
    if (!cert?.reportNumber || !cert?.species || !cert?.variety) {
      return NextResponse.json(
        { error: 'reportNumber, species, and variety are required.' },
        { status: 400 }
      );
    }

    const normalized: GemCertificate = {
      ...cert,
      reportNumber: cert.reportNumber.trim().toUpperCase(),
    };

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        certificate: normalized,
      });
    }

    const { error } = await supabase.from('certificates').upsert(
      {
        report_number: normalized.reportNumber,
        issue_date: normalized.issueDate,
        stone_type: normalized.stoneType || 'Natural',
        species: normalized.species,
        variety: normalized.variety,
        security_hash: normalized.securityHash || `WTC-AUTH-${normalized.reportNumber}`,
        payload: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'report_number' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      certificate: normalized,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save certificate';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Staff authentication required.' },
      { status: 401 }
    );
  }

  const reportNumber = req.nextUrl.searchParams.get('reportNumber')?.trim();
  if (!reportNumber) {
    return NextResponse.json(
      { error: 'reportNumber query parameter is required.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ success: true, source: 'local-fallback' });
  }

  const { error } = await supabase
    .from('certificates')
    .delete()
    .ilike('report_number', reportNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, source: 'supabase' });
}
