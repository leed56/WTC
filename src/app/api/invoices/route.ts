import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseServer';
import { isStaffAuthenticated } from '@/lib/staffAuth';

export interface InvoiceRecord {
  id?: string;
  invoice_number: string;
  report_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_company?: string | null;
  customer_phone: string;
  customer_email?: string | null;
  stone_summary: string;
  report_format: string;
  unit_price_lkr: number;
  quantity: number;
  discount_lkr: number;
  total_lkr: number;
  payment_status: 'Paid' | 'Unpaid';
  payment_method: string;
  notes?: string | null;
  issued_date: string;
  created_at?: string;
}

export async function GET() {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase || !isSupabaseConfigured()) {
    return NextResponse.json({ source: 'local-fallback', invoices: [] });
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ source: 'supabase', invoices: data || [] });
}

export async function POST(req: NextRequest) {
  const authed = await isStaffAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Staff authentication required.' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as InvoiceRecord;
    if (!body?.invoice_number || !body?.report_number || !body?.customer_name || !body?.customer_phone) {
      return NextResponse.json(
        { error: 'invoice_number, report_number, customer_name, and customer_phone are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        invoice: { ...body, id: body.id || `local-${Date.now()}` },
      });
    }

    const row = {
      invoice_number: body.invoice_number.trim().toUpperCase(),
      report_number: body.report_number.trim().toUpperCase(),
      customer_id: body.customer_id && !String(body.customer_id).startsWith('local-') ? body.customer_id : null,
      customer_name: body.customer_name.trim(),
      customer_company: body.customer_company?.trim() || null,
      customer_phone: body.customer_phone.trim(),
      customer_email: body.customer_email?.trim() || null,
      stone_summary: body.stone_summary.trim(),
      report_format: body.report_format,
      unit_price_lkr: Number(body.unit_price_lkr) || 0,
      quantity: Math.max(1, Number(body.quantity) || 1),
      discount_lkr: Math.max(0, Number(body.discount_lkr) || 0),
      total_lkr: Math.max(0, Number(body.total_lkr) || 0),
      payment_status: body.payment_status === 'Paid' ? 'Paid' : 'Unpaid',
      payment_method: body.payment_method || 'Cash',
      notes: body.notes?.trim() || null,
      issued_date: body.issued_date || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('invoices')
      .upsert(row, { onConflict: 'invoice_number' })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, source: 'supabase', invoice: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save invoice';
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
    const invoiceNumber = String(body?.invoice_number || '').trim().toUpperCase();
    const paymentStatus = body?.payment_status === 'Paid' ? 'Paid' : 'Unpaid';

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'invoice_number is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase || !isSupabaseConfigured()) {
      return NextResponse.json({ success: true, source: 'local-fallback' });
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({ payment_status: paymentStatus })
      .eq('invoice_number', invoiceNumber)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, source: 'supabase', invoice: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update invoice';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
