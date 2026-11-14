'use client';

import React, { useEffect, useState } from 'react';
import { Users, Receipt, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import type { CustomerRecord } from '@/app/api/customers/route';
import type { InvoiceRecord } from '@/app/api/invoices/route';

export default function AdminCustomerInvoicePanel() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [newCust, setNewCust] = useState({ name: '', company: '', phone: '', email: '' });
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        fetch('/api/invoices', { cache: 'no-store' }),
        fetch('/api/customers', { cache: 'no-store' }),
      ]);
      const invData = await invRes.json();
      const custData = await custRes.json();
      if (Array.isArray(invData?.invoices)) setInvoices(invData.invoices);
      if (Array.isArray(custData?.customers)) setCustomers(custData.customers);
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePaymentStatus = async (inv: InvoiceRecord) => {
    const nextStatus = inv.payment_status === 'Paid' ? 'Unpaid' : 'Paid';
    const res = await fetch('/api/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_number: inv.invoice_number,
        payment_status: nextStatus,
      }),
    });
    if (res.ok) {
      setInvoices((prev) =>
        prev.map((p) =>
          p.invoice_number === inv.invoice_number
            ? { ...p, payment_status: nextStatus }
            : p
        )
      );
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.phone.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
      const data = await res.json();
      if (res.ok && data?.customer) {
        setCustomers((prev) => [data.customer, ...prev]);
        setNewCust({ name: '', company: '', phone: '', email: '' });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCustomer = async (id?: string) => {
    if (!id) return;
    await fetch(`/api/customers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const q = search.toLowerCase();
  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoice_number.toLowerCase().includes(q) ||
      i.report_number.toLowerCase().includes(q) ||
      i.customer_name.toLowerCase().includes(q) ||
      i.customer_phone.toLowerCase().includes(q)
  );
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
  );

  return (
    <div className="mt-12 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
              activeTab === 'invoices'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices ({invoices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers &amp; Contacts ({customers.length})</span>
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice, report, customer, phone..."
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none sm:w-72"
        />
      </div>

      {activeTab === 'invoices' ? (
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-mono">
              No invoices recorded yet. Issue a report in Staff Lab and click &quot;Generate Invoice&quot;.
            </p>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-amber-400">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Report No</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3 text-right">Total (LKR)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.invoice_number} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">{inv.invoice_number}</td>
                    <td className="py-3 px-3 text-amber-300">{inv.report_number}</td>
                    <td className="py-3 px-3">
                      <div className="text-white">{inv.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{inv.customer_phone}</div>
                    </td>
                    <td className="py-3 px-3">{inv.report_format}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-300">
                      LKR {Number(inv.total_lkr).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => togglePaymentStatus(inv)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {inv.payment_status === 'Paid' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{inv.payment_status}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
            <input
              type="text"
              required
              placeholder="Contact Name *"
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
            <input
              type="text"
              placeholder="Company / Jeweler"
              value={newCust.company}
              onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
            <input
              type="text"
              required
              placeholder="WhatsApp / Phone *"
              value={newCust.phone}
              onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCust.email}
              onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </form>

          <div className="overflow-x-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center font-mono">
                No contacts saved yet.
              </p>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-amber-400">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id || c.phone} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-3">{c.company || '—'}</td>
                      <td className="py-3 px-3 text-amber-300">{c.phone}</td>
                      <td className="py-3 px-3">{c.email || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
