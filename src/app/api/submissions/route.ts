import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseServer';
import { isStaffAuthenticated } from '@/lib/staffAuth';

export async function GET() {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Staff authentication required.' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ source: 'local-fallback', submissions: [] });
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: 'supabase', submissions: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientName = String(body?.clientName || '').trim();
    const phone = String(body?.phone || '').trim();
    const email = String(body?.email || '').trim();

    if (!clientName || !phone || !email) {
      return NextResponse.json(
        { error: 'clientName, phone, and email are required.' },
        { status: 400 }
      );
    }

    const voucherCode =
      String(body?.voucherCode || '').trim() ||
      `WTC-SUB-${Math.floor(100000 + Math.random() * 900000)}`;

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        voucherCode,
      });
    }

    const { error } = await supabase.from('submissions').insert({
      voucher_code: voucherCode,
      client_name: clientName,
      company_name: body?.company ? String(body.company).trim() : null,
      phone,
      email,
      stone_count: Number(body?.stoneCount) || 1,
      service_tier: String(body?.serviceTier || 'Full Gemological Certificate'),
      shipping_method: String(body?.shippingMethod || 'walk-in'),
      notes: body?.notes ? String(body.notes).trim() : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      voucherCode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
