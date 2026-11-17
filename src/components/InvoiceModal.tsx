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

  const [tierId, setTierId] = useState<string>(defaultFormat);
  const [quantity, setQuantity] = useState<number>(1);
  const [discountLkr, setDiscountLkr] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [stoneCondition, setStoneCondition] = useState<string>(
    'Loose gemstone received in parcel — good condition'
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
    setTierId(defaultFormat);
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

  const selectedTier = useMemo(
    () => REPORT_FEE_TIERS.find((t) => t.id === tierId) || REPORT_FEE_TIERS[1],
    [tierId]
  );

  const subtotalLkr = selectedTier.priceLkr * Math.max(1, quantity);
  const totalLkr = Math.max(0, subtotalLkr - Math.max(0, discountLkr));
  const issuedDate = new Date().toISOString().split('T')[0];

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

      const invoicePayload: InvoiceRecord = {
        invoice_number: invoiceNumber.trim().toUpperCase(),
        report_number: certificate.reportNumber.trim().toUpperCase(),
        customer_id: resolvedCustomerId,
        customer_name: customerName.trim(),
        customer_company: customerCompany.trim() || null,
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        stone_summary: `${certificate.variety} (${certificate.weight})`,
        report_format: selectedTier.label,
        unit_price_lkr: selectedTier.priceLkr,
        quantity: Math.max(1, quantity),
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
                className="report-print-target relative rounded-2xl overflow-hidden bg-[#FCFBF7] text-slate-900 border-2 border-[#D4AF37]/60 shadow-2xl flex flex-col justify-between"
              >
                {/* Top Royal Navy & Gold Ribbon Header */}
                <div className="relative bg-gradient-to-r from-[#070D1B] via-[#0E1B3D] to-[#132554] text-white px-7 py-6 border-b-4 border-[#D4AF37]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src="/brand/wtc_crest.png?v=3"
                        alt="WTC Gem Lab"
                        className="h-14 w-auto object-contain shrink-0"
                      />
                      <div>
                        <div className="text-xl font-cinzel font-black tracking-wide text-[#F3D574]">
                          WTC GEM LAB
                        </div>
                        <div className="text-[10px] font-mono tracking-[0.22em] text-amber-200/90 uppercase">
                          Gemological Laboratory &bull; Analyse &bull; Identify &bull; Assure
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {LAB_CONTACT_INFO.address} &bull; {LAB_CONTACT_INFO.phone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3D574] text-[#070D1B] font-cinzel font-black text-xs tracking-widest uppercase shadow">
                        Stone Receipt &amp; Invoice
                      </span>
                      <div className="text-sm font-mono font-bold text-white mt-2">
                        {invoiceNumber}
                      </div>
                      <div className="text-[11px] font-mono text-amber-200/80">
                        Submitted: {issuedDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-7 space-y-6">
                  {/* Billed To & Report Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E1B3D]">
                        Billed To
                      </div>
                      <div className="text-base font-bold text-[#0B132B]">
                        {customerName || 'Walk-In Client'}
                      </div>
                      {customerCompany && (
                        <div className="font-semibold text-amber-700">{customerCompany}</div>
                      )}
                      <div className="font-mono text-slate-600">{customerPhone}</div>
                      {customerEmail && <div className="text-slate-600">{customerEmail}</div>}
                      {customerAddress && <div className="text-slate-600">{customerAddress}</div>}
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B132B]/5 to-amber-500/10 border border-[#D4AF37]/40 shadow-sm space-y-1.5 sm:text-right">
                      <div className="flex sm:justify-end items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E1B3D]">
                          Report &amp; Payment Status
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                            paymentStatus === 'Paid'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-sm text-[#0B132B]">
                        {certificate.reportNumber}
                      </div>
                      <div className="font-semibold text-slate-800">{certificate.variety}</div>
                      <div className="text-slate-600">
                        Weight: <span className="font-mono font-semibold">{certificate.weight}</span> &bull;{' '}
                        Method: <span className="font-semibold">{paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Colorful Luxury Itemized Table */}
                  <div className="rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-sm">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#0B132B] to-[#162752] text-[#F3D574] text-left font-mono uppercase text-[11px]">
                          <th className="py-3 px-4">Service &amp; Report Description</th>
                          <th className="py-3 px-4 text-right">Qty</th>
                          <th className="py-3 px-4 text-right">Unit (LKR)</th>
                          <th className="py-3 px-4 text-right">Amount (LKR)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="py-4 px-4">
                            <div className="font-bold text-[#0B132B] text-sm">
                              {selectedTier.label}
                            </div>
                            <div className="text-slate-600 mt-0.5">
                              Certificate Ref: <span className="font-mono font-semibold text-[#0E1B3D]">{certificate.reportNumber}</span> &mdash;{' '}
                              {certificate.variety} ({certificate.weight})
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-semibold">{quantity}</td>
                          <td className="py-4 px-4 text-right font-mono">
                            {selectedTier.priceLkr.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-[#0B132B]">
                            {subtotalLkr.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stone Submission & Received Details */}
                  <div className="p-4 rounded-xl bg-white border border-[#D4AF37]/40 shadow-sm text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E1B3D]">
                        Stone Submission &amp; Intake Receipt Details
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        Est. Collection: {estimatedCollection}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Stone / Variety</span>
                        <span className="font-bold text-[#0B132B]">{certificate.variety}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Weight / Shape</span>
                        <span className="font-semibold text-slate-800">
                          {certificate.weight} &bull; {certificate.shapeAndCut}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Measurements</span>
                        <span className="font-mono text-slate-800">{certificate.dimensions}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Received By</span>
                        <span className="font-semibold text-[#0B132B]">{receivedBy}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-[#0E1B3D]">Declared Condition:</span>{' '}
                      {stoneCondition}
                    </div>
                  </div>

                  {/* Totals & Notes */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="text-[11px] text-slate-600 space-y-1 max-w-sm">
                      <div className="font-bold text-[#0B132B] uppercase font-mono text-[10px]">
                        Collection &amp; Online Verification
                      </div>
                      <p>
                        Present this receipt when collecting your stone, or verify online at{' '}
                        <span className="font-mono font-semibold text-[#0E1B3D]">
                          www.wtcgemlab.lk/verify
                        </span>
                      </p>
                      {notes && <p className="italic text-slate-500">Note: {notes}</p>}
                    </div>

                    <div className="w-full sm:w-72 rounded-xl bg-gradient-to-br from-[#070D1B] to-[#132554] text-white p-4 border border-[#D4AF37]/60 shadow-lg space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal</span>
                        <span className="font-mono">LKR {subtotalLkr.toLocaleString()}</span>
                      </div>
                      {discountLkr > 0 && (
                        <div className="flex justify-between text-emerald-300">
                          <span>Discount</span>
                          <span className="font-mono">- LKR {discountLkr.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-[#D4AF37]/40 pt-2">
                        <span className="font-cinzel font-bold text-amber-200 uppercase text-xs">
                          Total (LKR)
                        </span>
                        <span className="text-xl font-mono font-black text-[#F3D574]">
                          LKR {totalLkr.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two-Party Stone Handover Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-[11px]">
                    <div className="text-center">
                      <div className="h-8 border-b border-slate-400 mb-1.5" />
                      <div className="font-bold text-[#0B132B]">Client / Depositor Signature</div>
                      <div className="text-[10px] text-slate-500">
                        Stone(s) submitted for gemological testing
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-8 border-b border-[#C5A059] mb-1.5 flex items-end justify-center pb-1 font-semibold text-[#0E1B3D]">
                        {receivedBy}
                      </div>
                      <div className="font-bold text-[#0B132B]">Received By (WTC Gem Lab)</div>
                      <div className="text-[10px] text-slate-500">
                        Stone received in good order &bull; {issuedDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Gold & Navy Ribbon */}
                <div className="bg-gradient-to-r from-[#070D1B] via-[#0E1B3D] to-[#070D1B] border-t-2 border-[#D4AF37] px-7 py-3 flex flex-wrap items-center justify-between text-[10px] font-mono text-amber-200/90">
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

              {/* Invoice Fee & Payment Details */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-mono mb-1">Report Format &amp; Fee</label>
                    <select
                      value={tierId}
                      onChange={(e) => setTierId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-semibold focus:border-amber-400 focus:outline-none"
                    >
                      {REPORT_FEE_TIERS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label} — LKR {t.priceLkr.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
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
                    <label className="block text-slate-400 font-mono mb-1">Received By (Staff)</label>
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
                  <span className="text-slate-400 font-mono">Total Invoice Amount:</span>
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
