'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Receipt,
  UserPlus,
  Users,
  CheckCircle2,
  Printer,
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
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [sendingWa, setSendingWa] = useState(false);
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
    } finally {
      setSendingWa(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0B132B] border border-amber-500/40 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#070D1B] border-b border-amber-500/20 flex items-center justify-between">
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {showPrintPreview ? (
            <div className="bg-white text-slate-900 rounded-xl p-8 space-y-6 shadow-inner">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#0B132B]">
                    WTC GEMOLOGICAL LABORATORY
                  </h3>
                  <p className="text-xs text-slate-600">{LAB_CONTACT_INFO.address}</p>
                  <p className="text-xs text-slate-600">
                    Tel: {LAB_CONTACT_INFO.phone} &bull; {LAB_CONTACT_INFO.email}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-[#0B132B]">INVOICE</div>
                  <div className="text-xs font-mono text-slate-600">No: {invoiceNumber}</div>
                  <div className="text-xs font-mono text-slate-600">Date: {issuedDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-bold uppercase text-slate-500 mb-1">Billed To</div>
                  <div className="font-bold text-sm">{customerName || 'Walk-In Client'}</div>
                  {customerCompany && <div>{customerCompany}</div>}
                  <div>{customerPhone}</div>
                  {customerEmail && <div>{customerEmail}</div>}
                  {customerAddress && <div>{customerAddress}</div>}
                </div>
                <div className="text-right">
                  <div className="font-bold uppercase text-slate-500 mb-1">Report Reference</div>
                  <div className="font-mono font-bold">{certificate.reportNumber}</div>
                  <div>{certificate.variety}</div>
                  <div>{certificate.weight}</div>
                </div>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-y border-slate-300 bg-slate-50 text-left">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Unit (LKR)</th>
                    <th className="py-2 px-3 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-3">
                      <div className="font-semibold">{selectedTier.label}</div>
                      <div className="text-slate-500">
                        Report {certificate.reportNumber} — {certificate.variety} ({certificate.weight})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      {selectedTier.priceLkr.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {subtotalLkr.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-mono">LKR {subtotalLkr.toLocaleString()}</span>
                  </div>
                  {discountLkr > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono">- LKR {discountLkr.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-2">
                    <span>Total Due:</span>
                    <span className="font-mono">LKR {totalLkr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                    <span>Status: {paymentStatus}</span>
                    <span>Method: {paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-semibold"
                >
                  &larr; Back to Edit
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[#0B132B] text-white text-xs font-semibold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
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
