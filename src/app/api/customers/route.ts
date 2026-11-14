import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseServer';
import { isStaffAuthenticated } from '@/lib/staffAuth';

export interface CustomerRecord {
  id?: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
}

export async function GET() {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ source: 'local-fallback', customers: [] });
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: 'supabase', customers: data || [] });
}

export async function POST(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as CustomerRecord;
    const name = String(body?.name || '').trim();
    const phone = String(body?.phone || '').trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        customer: { ...body, id: body.id || `local-${Date.now()}`, name, phone },
      });
    }

    const row = {
      name,
      company: body.company?.trim() || null,
      phone,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (body.id && !body.id.startsWith('local-')) {
      const { data, error } = await supabase
        .from('customers')
        .update(row)
        .eq('id', body.id)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, source: 'supabase', customer: data });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(row)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, source: 'supabase', customer: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save customer';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ error: 'Customer id is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ success: true, source: 'local-fallback' });
  }

  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, source: 'supabase' });
}
