import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseServer';
import { isStaffAuthenticated } from '@/lib/staffAuth';

export type LabJobStatus = 'Received' | 'Screened' | 'Handed Over';

export interface LabJobRecord {
  id?: string;
  job_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_company?: string | null;
  customer_phone: string;
  stone_description: string;
  approx_weight?: string | null;
  report_format: 'sticker' | 'pvc' | 'a4' | 'advanced';
  fee_lkr: number;
  status: LabJobStatus;
  report_number?: string | null;
  invoice_number?: string | null;
  notes?: string | null;
  received_at?: string;
  screened_at?: string | null;
  handed_over_at?: string | null;
}

export async function GET() {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ source: 'local-fallback', jobs: [] });
  }

  const { data, error } = await supabase
    .from('lab_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: 'supabase', jobs: data || [] });
}

export async function POST(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as LabJobRecord;
    const customerName = String(body?.customer_name || '').trim();
    const customerPhone = String(body?.customer_phone || '').trim();
    const stoneDesc = String(body?.stone_description || '').trim();

    if (!customerName || !customerPhone || !stoneDesc) {
      return NextResponse.json(
        { error: 'customer_name, customer_phone, and stone_description are required.' },
        { status: 400 }
      );
    }

    const jobNumber =
      String(body?.job_number || '').trim().toUpperCase() ||
      `JOB-26-${Math.floor(1000 + Math.random() * 9000)}`;

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        job: {
          ...body,
          job_number: jobNumber,
          status: 'Received',
          received_at: new Date().toISOString(),
        },
      });
    }

    const { data, error } = await supabase
      .from('lab_jobs')
      .insert({
        job_number: jobNumber,
        customer_id: body.customer_id && !String(body.customer_id).startsWith('local-') ? body.customer_id : null,
        customer_name: customerName,
        customer_company: body.customer_company?.trim() || null,
        customer_phone: customerPhone,
        stone_description: stoneDesc,
        approx_weight: body.approx_weight?.trim() || null,
        report_format: body.report_format || 'pvc',
        fee_lkr: Number(body.fee_lkr) || 1200,
        status: 'Received',
        notes: body.notes?.trim() || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'supabase', job: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create job';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const jobNumber = String(body?.job_number || '').trim().toUpperCase();
    const status = body?.status as LabJobStatus;

    if (!jobNumber || !['Received', 'Screened', 'Handed Over'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid job_number and status are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({ success: true, source: 'local-fallback' });
    }

    const updates: Record<string, unknown> = { status };
    if (body?.report_number) updates.report_number = String(body.report_number).trim().toUpperCase();
    if (body?.invoice_number) updates.invoice_number = String(body.invoice_number).trim().toUpperCase();
    if (status === 'Screened') updates.screened_at = new Date().toISOString();
    if (status === 'Handed Over') updates.handed_over_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('lab_jobs')
      .update(updates)
      .eq('job_number', jobNumber)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'supabase', job: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update job';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
