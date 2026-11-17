'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Receipt,
  UserPlus,
  Users,
  CheckCircle2,
  Printer,
  Download,
  Send,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { GemCertificate, LAB_CONTACT_INFO } from '@/lib/gemData';
import type { CustomerRecord } from '@/app/api/customers/route';
import type { InvoiceRecord } from '@/app/api/invoices/route';

export const REPORT_FEE_TIERS = [
  { id: 'sticker', label: 'Verbal Report (Gem Box Sticker)', priceLkr: 300 },
  { id: 'pvc', label: 'PVC Smart Card Report', priceLkr: 1200 },
  { id: 'a4', label: 'Official A4 Certificate', priceLkr: 4500 },
  { id: 'advanced', label: 'Advanced Report', priceLkr: 30000 },
] as const;

export interface InvoiceStoneItem {
  id: string;
  stoneNumber: string;
  variety: string;
  weight: string;
  color: string;
  tierId: string;
}

function incrementStoneNumber(prevNo: string): string {
  const match = prevNo.trim().match(/^(.*?)(\d+)$/);
  if (!match) return `${prevNo || 'WTC-26'}-2`;
  const prefix = match[1];
  const digits = match[2];
  const next = String(Number(digits) + 1).padStart(digits.length, '0');
  return `${prefix}${next}`;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: GemCertificate;
  defaultFormat?: 'sticker' | 'pvc' | 'a4';
  wassapiConfig?: { endpoint: string; key: string; deviceId: string };
  onSaved?: (msg: string) => void;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  certificate,
  defaultFormat = 'pvc',
  wassapiConfig,
  onSaved,
}: InvoiceModalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('new');
  const [customerName, setCustomerName] = useState(certificate.clientName || '');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState(certificate.clientPhone || '');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [stoneItems, setStoneItems] = useState<InvoiceStoneItem[]>([]);
  const [discountLkr, setDiscountLkr] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [stoneCondition, setStoneCondition] = useState<string>(
    'Loose gemstone(s) received in parcel — good condition'
  );
  const [estimatedCollection, setEstimatedCollection] = useState<string>('Same Day / 24 Hours');
  const [receivedBy, setReceivedBy] = useState<string>(
    certificate.gemologistName || 'WTC Lab Intake Officer'
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string; waUrl?: string } | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStoneItems([
      {
        id: `stone-${Date.now()}`,
        stoneNumber: certificate.reportNumber || '',
        variety: certificate.variety || '',
        weight: certificate.weight || '',
        color: certificate.color || '',
        tierId: defaultFormat,
      },
    ]);
    const suffix = certificate.reportNumber.replace(/[^0-9A-Z]/gi, '').slice(-6) || String(Date.now()).slice(-6);
    setInvoiceNumber(`INV-${suffix}`);
    if (certificate.clientName && !customerName) setCustomerName(certificate.clientName);
    if (certificate.clientPhone && !customerPhone) setCustomerPhone(certificate.clientPhone);
    setStatusMsg(null);

    fetch('/api/customers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.customers)) {
          setCustomers(data.customers);
        }
      })
      .catch(() => {});
  }, [isOpen, defaultFormat, certificate.reportNumber]);

  const getTier = (id: string) =>
    REPORT_FEE_TIERS.find((t) => t.id === id) || REPORT_FEE_TIERS[1];

  const subtotalLkr = useMemo(
    () => stoneItems.reduce((sum, item) => sum + getTier(item.tierId).priceLkr, 0),
    [stoneItems]
  );
  const totalLkr = Math.max(0, subtotalLkr - Math.max(0, discountLkr));
  const issuedDate = new Date().toISOString().split('T')[0];

  const handleAddStoneItem = () => {
    const last = stoneItems[stoneItems.length - 1];
    const nextNo = last ? incrementStoneNumber(last.stoneNumber) : certificate.reportNumber;
    setStoneItems((prev) => [
      ...prev,
      {
        id: `stone-${Date.now()}-${prev.length + 1}`,
        stoneNumber: nextNo,
        variety: last?.variety || certificate.variety || 'Natural Blue Sapphire',
        weight: '',
        color: last?.color || certificate.color || '',
        tierId: last?.tierId || defaultFormat,
      },
    ]);
  };

  const handleUpdateStoneItem = (id: string, patch: Partial<InvoiceStoneItem>) => {
    setStoneItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleRemoveStoneItem = (id: string) => {
    if (stoneItems.length <= 1) return;
    setStoneItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (id === 'new') return;
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name || '');
      setCustomerCompany(found.company || '');
      setCustomerPhone(found.phone || '');
      setCustomerEmail(found.email || '');
      setCustomerAddress(found.address || '');
    }
  };

  const persistCustomerAndInvoice = async (): Promise<InvoiceRecord | null> => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setStatusMsg({ ok: false, text: 'Customer Name and WhatsApp/Phone Number are required.' });
      return null;
    }

    setSaving(true);
    setStatusMsg(null);
    try {
      let resolvedCustomerId: string | null =
        selectedCustomerId !== 'new' ? selectedCustomerId : null;

      // Save or update customer in Customer Database
      const custRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvedCustomerId || undefined,
          name: customerName.trim(),
          company: customerCompany.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          address: customerAddress.trim(),
        }),
      });
      const custData = await custRes.json();
      if (custRes.ok && custData?.customer?.id) {
        resolvedCustomerId = custData.customer.id;
        setSelectedCustomerId(custData.customer.id);
        setCustomers((prev) => {
          const filtered = prev.filter((p) => p.id !== custData.customer.id);
          return [custData.customer, ...filtered];
        });
      }

      const stoneNumbersList = stoneItems
        .map((s) => s.stoneNumber.trim().toUpperCase())
        .filter(Boolean)
        .join(', ');
      const stoneSummaryText = stoneItems
        .map(
          (s, idx) =>
            `#${idx + 1} ${s.stoneNumber.trim().toUpperCase()}: ${s.variety} | ${s.weight || 'N/A'} | ${s.color || 'N/A'} (${getTier(s.tierId).label})`
        )
        .join('; ');
      const formatLabel =
        stoneItems.length === 1
          ? getTier(stoneItems[0].tierId).label
          : `Multi-Stone (${stoneItems.length} stones)`;

      const invoicePayload: InvoiceRecord = {
        invoice_number: invoiceNumber.trim().toUpperCase(),
        report_number: stoneNumbersList || certificate.reportNumber.trim().toUpperCase(),
        customer_id: resolvedCustomerId,
        customer_name: customerName.trim(),
        customer_company: customerCompany.trim() || null,
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        stone_summary: stoneSummaryText,
        report_format: formatLabel,
        unit_price_lkr:
          stoneItems.length === 1 ? getTier(stoneItems[0].tierId).priceLkr : subtotalLkr,
        quantity: Math.max(1, stoneItems.length),
        discount_lkr: Math.max(0, discountLkr),
        total_lkr: totalLkr,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        issued_date: issuedDate,
      };

      const invRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload),
      });
      const invData = await invRes.json();
      if (!invRes.ok) {
        setStatusMsg({ ok: false, text: invData?.error || 'Failed to save invoice.' });
        return null;
      }

      setStatusMsg({
        ok: true,
        text: `Invoice ${invoicePayload.invoice_number} & Customer saved (${
          invData?.source === 'supabase' ? 'Supabase Cloud' : 'Local'
        }).`,
      });
      onSaved?.(`Invoice ${invoicePayload.invoice_number} saved (LKR ${totalLkr.toLocaleString()}).`);
      return invoicePayload;
    } catch {
      setStatusMsg({ ok: false, text: 'Network error saving invoice.' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsAppInvoice = async () => {
    const saved = await persistCustomerAndInvoice();
    if (!saved) return;

    setSendingWa(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wtcgemlab.lk';
      const verifyUrl = `${origin}/verify?id=${encodeURIComponent(saved.report_number)}`;
      const cleanPhone = saved.customer_phone.replace(/[^\d]/g, '');

      const invoiceText = [
        `*WTC GEM LAB — OFFICIAL INVOICE*`,
        `Invoice No: *${saved.invoice_number}*`,
        `Date: ${saved.issued_date}`,
        `Client: ${saved.customer_name}${saved.customer_company ? ` (${saved.customer_company})` : ''}`,
        `--------------------------------`,
        `Report No: *${saved.report_number}*`,
        `Item: ${saved.stone_summary}`,
        `Format: ${saved.report_format}`,
        `Qty: ${saved.quantity} × LKR ${saved.unit_price_lkr.toLocaleString()}`,
        saved.discount_lkr > 0 ? `Discount: -LKR ${saved.discount_lkr.toLocaleString()}` : null,
        `*Total: LKR ${saved.total_lkr.toLocaleString()}*`,
        `Status: *${saved.payment_status}* (${saved.payment_method})`,
        `--------------------------------`,
        `Verify Report Online: ${verifyUrl}`,
        `World Trade Center, No 26, 5th Floor, Colombo 01`,
      ]
        .filter(Boolean)
        .join('\n');

      const waRes = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: saved.customer_phone,
          clientName: saved.customer_name,
          reportNumber: saved.report_number,
          variety: saved.stone_summary,
          weight: certificate.weight,
          reportFormat: saved.report_format,
          verifyUrl,
          customMessage: invoiceText,
          apiEndpoint: wassapiConfig?.endpoint,
          apiKey: wassapiConfig?.key,
          deviceId: wassapiConfig?.deviceId,
        }),
      });
      const waData = await waRes.json();
      const fallbackWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(invoiceText)}`;

      setStatusMsg({
        ok: true,
        text:
          waData?.mode === 'wassapi-live'
            ? `Invoice ${saved.invoice_number} sent to ${saved.customer_phone} via Wassapi!`
            : `Invoice ${saved.invoice_number} saved! Click below to send directly via WhatsApp.`,
        waUrl: fallbackWaUrl,
      });
    } catch {
      const cleanPhone = saved.customer_phone.replace(/[^\d]/g, '');
      setStatusMsg({
        ok: true,
        text: `Invoice saved. Use WhatsApp link below to send:`,
        waUrl: `https://wa.me/${cleanPhone}`,
      });
    setSendingWa(false);
    }
  };

  const handleDownloadInvoicePng = async () => {
    if (typeof document === 'undefined' || downloadingPng) return;
    const target = document.getElementById('wtc-premium-invoice');
    if (!target) return;
    setDownloadingPng(true);
    try {
      const dataUrl = await toPng(target, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#FCFBF7'
      });
      const link = document.createElement('a');
      const safeInv = (invoiceNumber || 'WTC-Invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeInv}-A4.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export invoice PNG:', err);
      alert('Could not export PNG. Please use Print A4 Invoice instead.');
    } finally {
      setDownloadingPng(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${
        showPrintPreview ? '' : 'no-print '
      }fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0`}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-[#0B132B] border border-amber-500/40 shadow-2xl overflow-hidden my-8 print:shadow-none print:border-0 print:my-0 print:max-w-none print:bg-white">
        {/* Header */}
        <div className="no-print px-6 py-4 bg-[#070D1B] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-cinzel font-bold text-white">
                Generate &amp; Send Lab Invoice
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Report {certificate.reportNumber} &bull; {certificate.variety} ({certificate.weight})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:p-0 print:max-h-none print:overflow-visible">
          {showPrintPreview ? (
            <div className="space-y-4">
              <div
                id="wtc-premium-invoice"
                data-report-format="a4"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                className="report-print-target relative rounded-2xl overflow-hidden bg-white text-[#0B1B3E] border-2 border-[#D4AF37] shadow-2xl flex flex-col justify-between"
              >
                {/* Ink-Saver Pearl White Header with WTC Logo & Gold Accent Line */}
                <div className="bg-white px-7 py-5 border-b-2 border-[#D4AF37]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src="/brand/wtc_crest.png?v=3"
                        alt="WTC Gem Lab"
                        className="h-14 w-auto object-contain shrink-0"
                      />
                      <div>
                        <div className="text-xl font-cinzel font-black tracking-wide text-[#9E731A]">
                          WTC GEM LAB
                        </div>
                        <div className="text-[10px] font-mono tracking-[0.22em] text-[#0B1B3E] font-bold uppercase">
                          Gemological Laboratory &bull; Analyse &bull; Identify &bull; Assure
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {LAB_CONTACT_INFO.address} &bull; {LAB_CONTACT_INFO.phone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3.5 py-1 rounded-full border-2 border-[#D4AF37] bg-[#FDF8EC] text-[#0B1B3E] font-cinzel font-black text-xs tracking-widest uppercase">
                        Stone Receipt &amp; Invoice
                      </span>
                      <div className="text-sm font-mono font-bold text-[#0B1B3E] mt-2">
                        {invoiceNumber}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        Stones: <span className="font-bold text-[#9E731A]">{stoneItems.length}</span> &bull; {issuedDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-7 space-y-5 flex-1">
                  {/* Billed To & Stone Tracking Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-slate-300 space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9E731A]">
                        Billed To / Depositor
                      </div>
                      <div className="text-base font-bold text-[#0B1B3E]">
                        {customerName || 'Walk-In Client'}
                      </div>
                      {customerCompany && (
                        <div className="font-semibold text-[#9E731A]">{customerCompany}</div>
                      )}
                      <div className="font-mono text-slate-700">{customerPhone}</div>
                      {customerEmail && <div className="text-slate-600">{customerEmail}</div>}
                      {customerAddress && <div className="text-slate-600">{customerAddress}</div>}
                    </div>

                    <div className="p-4 rounded-xl bg-[#FDFBF5] border border-[#D4AF37]/70 space-y-1.5 sm:text-right">
                      <div className="flex sm:justify-end items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B1B3E]">
                          Stone Track &amp; Payment Status
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${
                            paymentStatus === 'Paid'
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-amber-600 bg-amber-50 text-amber-800'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-sm text-[#0B1B3E]">
                        {stoneItems.length === 1
                          ? `Stone No: ${stoneItems[0].stoneNumber}`
                          : `${stoneItems.length} Stones Submitted`}
                      </div>
                      <div className="font-semibold text-slate-800">
                        {stoneItems.map((s) => s.stoneNumber).join(', ')}
                      </div>
                      <div className="text-slate-700">
                        Total Stones: <span className="font-mono font-semibold">{stoneItems.length}</span> &bull;{' '}
                        Method: <span className="font-semibold">{paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ink-Saver Ivory & Gold Multi-Stone Itemized Table */}
                  <div className="rounded-xl overflow-hidden border border-[#D4AF37]/80">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FDF8EC] text-[#0B1B3E] border-b border-[#D4AF37]/70 text-left font-mono uppercase text-[10px]">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Stone Track No.</th>
                          <th className="py-2.5 px-3">Stone / Variety</th>
                          <th className="py-2.5 px-3">Weight</th>
                          <th className="py-2.5 px-3">Color</th>
                          <th className="py-2.5 px-3">Service Tier</th>
                          <th className="py-2.5 px-3 text-right">Fee (LKR)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {stoneItems.map((item, idx) => {
                          const tier = getTier(item.tierId);
                          return (
                            <tr key={item.id}>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#0B1B3E]">
                                {item.stoneNumber}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {item.variety}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-700">
                                {item.weight || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">
                                {item.color || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">{tier.label}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0B1B3E]">
                                {tier.priceLkr.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Stone Submission & Intake Conditions */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/60 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B1B3E]">
                        Stone Intake &amp; Collection Instructions
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        Est. Collection: {estimatedCollection}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold text-[#0B1B3E]">Declared Condition:</span>{' '}
                      {stoneCondition}
                    </div>
                  </div>

                  {/* Totals & Notes */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="text-[11px] text-slate-600 space-y-1 max-w-sm">
                      <div className="font-bold text-[#0B1B3E] uppercase font-mono text-[10px]">
                        Collection &amp; Online Verification
                      </div>
                      <p>
                        Please bring this receipt when collecting your stone(s), or verify online at{' '}
                        <span className="font-mono font-semibold text-[#0B1B3E]">
                          www.wtcgemlab.lk/verify
                        </span>
                      </p>
                      {notes && <p className="italic text-slate-500">Note: {notes}</p>}
                    </div>

                    <div className="w-full sm:w-72 rounded-xl bg-[#FDFBF5] text-[#0B1B3E] p-4 border-2 border-[#D4AF37] space-y-2 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Subtotal ({stoneItems.length} {stoneItems.length === 1 ? 'stone' : 'stones'})</span>
                        <span className="font-mono">LKR {subtotalLkr.toLocaleString()}</span>
                      </div>
                      {discountLkr > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Discount</span>
                          <span className="font-mono">- LKR {discountLkr.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-[#D4AF37]/60 pt-2">
                        <span className="font-cinzel font-bold text-[#0B1B3E] uppercase text-xs">
                          Total (LKR)
                        </span>
                        <span className="text-xl font-mono font-black text-[#9E731A]">
                          LKR {totalLkr.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage 1 (Submission) & Stage 2 (Client Collection Sign-Off) */}
                  <div className="space-y-3 pt-3 border-t border-slate-200 text-[11px]">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="h-8 border-b border-slate-400 mb-1" />
                        <div className="font-bold text-[#0B1B3E]">
                          1. Submitted By (Client Signature)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Stone(s) left for testing &bull; Date: {issuedDate}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="h-8 border-b border-[#C5A059] mb-1 flex items-end justify-center pb-1 font-semibold text-[#0B1B3E]">
                          {receivedBy}
                        </div>
                        <div className="font-bold text-[#0B1B3E]">
                          Accepted By (WTC Gem Lab Staff)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Lab Intake Officer &bull; Date: {issuedDate}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FDFBF5] border border-[#D4AF37]/80">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-bold uppercase text-[10px] text-[#0B1B3E]">
                          2. Client Stone Collection Sign-Off (Sign When Taking Stone Back)
                        </span>
                        <span className="text-[10px] text-slate-600">
                          Date Received: _____ / _____ / 2026
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-700 mb-3">
                        I confirm that I have received back all gemstone(s) listed on this invoice in full and in good order.
                      </p>
                      <div className="grid grid-cols-2 gap-6 pt-1">
                        <div>
                          <div className="h-7 border-b border-slate-500 mb-1" />
                          <div className="text-[10px] font-bold text-[#0B1B3E]">
                            Client Signature (Received Stone)
                          </div>
                        </div>
                        <div>
                          <div className="h-7 border-b border-slate-400 mb-1" />
                          <div className="text-[10px] font-semibold text-slate-700">
                            Client Name / NIC No.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean Ink-Saver White Footer */}
                <div className="bg-white border-t-2 border-[#D4AF37] px-7 py-3 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#0B1B3E]">
                  <span>Thank you for choosing WTC Gemological Laboratory</span>
                  <span>{LAB_CONTACT_INFO.email} &bull; www.wtcgemlab.lk</span>
                </div>
              </div>

              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  &larr; Back to Edit
                </button>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadInvoicePng}
                    disabled={downloadingPng}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPng ? 'Exporting...' : 'Download A4 PNG'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print A4 Invoice / Save PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Customer / Contact Picker */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-mono text-amber-400 uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Customer / Contact Directory</span>
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="new">+ New Customer / Contact</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''} — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mohamed Rizwan"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Company / Jeweler</label>
                    <input
                      type="text"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder="e.g. Ceylon Royal Gems"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">WhatsApp / Phone *</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@domain.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Stone Line Items + Payment Details */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                    Stones Submitted on This Invoice ({stoneItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStoneItem}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Stone</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {stoneItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">
                          #{idx + 1} Stone No. *
                        </label>
                        <input
                          type="text"
                          value={item.stoneNumber}
                          onChange={(e) =>
                            handleUpdateStoneItem(item.id, { stoneNumber: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">
                          Variety / Stone
                        </label>
                        <input
                          type="text"
                          value={item.variety}
                          onChange={(e) =>
                            handleUpdateStoneItem(item.id, { variety: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">
                          Weight *
                        </label>
                        <input
                          type="text"
                          value={item.weight}
                          onChange={(e) =>
                            handleUpdateStoneItem(item.id, { weight: e.target.value })
                          }
                          placeholder="2.40 ct"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">
                          Color *
                        </label>
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) =>
                            handleUpdateStoneItem(item.id, { color: e.target.value })
                          }
                          placeholder="Royal Blue"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-mono mb-1">
                          Report / Fee
                        </label>
                        <select
                          value={item.tierId}
                          onChange={(e) =>
                            handleUpdateStoneItem(item.id, { tierId: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-semibold text-xs"
                        >
                          {REPORT_FEE_TIERS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.id.toUpperCase()} — {t.priceLkr.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          disabled={stoneItems.length <= 1}
                          onClick={() => handleRemoveStoneItem(item.id)}
                          title="Remove stone"
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Discount (LKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={discountLkr}
                      onChange={(e) => setDiscountLkr(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Unpaid')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Intake Staff</label>
                    <input
                      type="text"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Est. Collection</label>
                    <input
                      type="text"
                      value={estimatedCollection}
                      onChange={(e) => setEstimatedCollection(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Stone Condition on Intake</label>
                    <input
                      type="text"
                      value={stoneCondition}
                      onChange={(e) => setStoneCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-slate-400 font-mono">
                    Total Invoice Amount ({stoneItems.length} {stoneItems.length === 1 ? 'stone' : 'stones'}):
                  </span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    LKR {totalLkr.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}

          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                statusMsg.ok
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-500/10 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
              {statusMsg.waUrl && (
                <a
                  href={statusMsg.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-slate-950 font-bold whitespace-nowrap"
                >
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showPrintPreview && (
          <div className="px-6 py-4 bg-[#070D1B] border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowPrintPreview(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Preview / Print Invoice</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={persistCustomerAndInvoice}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Save Customer &amp; Invoice</span>
              </button>

              <button
                type="button"
                disabled={saving || sendingWa}
                onClick={handleSendWhatsAppInvoice}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {sendingWa ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Save &amp; Send via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
