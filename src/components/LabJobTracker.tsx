'use client';

import React, { useEffect, useState } from 'react';
import {
  PackageCheck,
  Plus,
  Send,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Handshake,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { CustomerRecord } from '@/app/api/customers/route';
import type { LabJobRecord, LabJobStatus } from '@/app/api/jobs/route';
import { REPORT_FEE_TIERS } from '@/components/InvoiceModal';

interface LabJobTrackerProps {
  activeJobNumber: string | null;
  onSelectJobForScreening: (job: LabJobRecord) => void;
  onToast?: (msg: string) => void;
  refreshTrigger?: number;
}

export default function LabJobTracker({
  activeJobNumber,
  onSelectJobForScreening,
  onToast,
  refreshTrigger = 0,
}: LabJobTrackerProps) {
  const [expanded, setExpanded] = useState(true);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LabJobStatus | 'All'>('All');

  const [jobs, setJobs] = useState<LabJobRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  const [selectedCustId, setSelectedCustId] = useState('new');
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custPhone, setCustPhone] = useState('+94 77 ');
  const [stoneDesc, setStoneDesc] = useState('');
  const [approxWeight, setApproxWeight] = useState('');
  const [formatId, setFormatId] = useState<'sticker' | 'pvc' | 'a4' | 'advanced'>('pvc');
  const [saving, setSaving] = useState(false);
  const [waLink, setWaLink] = useState<{ label: string; url: string } | null>(null);

  const loadJobsAndCustomers = async () => {
    try {
      const [jRes, cRes] = await Promise.all([
        fetch('/api/jobs', { cache: 'no-store' }),
        fetch('/api/customers', { cache: 'no-store' }),
      ]);
      const jData = await jRes.json();
      const cData = await cRes.json();
      if (Array.isArray(jData?.jobs)) setJobs(jData.jobs);
      if (Array.isArray(cData?.customers)) setCustomers(cData.customers);
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    loadJobsAndCustomers();
  }, [refreshTrigger]);

  const handleCustPick = (id: string) => {
    setSelectedCustId(id);
    if (id === 'new') return;
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustName(found.name || '');
      setCustCompany(found.company || '');
      setCustPhone(found.phone || '');
    }
  };

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !stoneDesc.trim()) return;

    setSaving(true);
    try {
      let customerId: string | null = selectedCustId !== 'new' ? selectedCustId : null;
      const cRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customerId || undefined,
          name: custName.trim(),
          company: custCompany.trim(),
          phone: custPhone.trim(),
        }),
      });
      const cData = await cRes.json();
      if (cRes.ok && cData?.customer?.id) {
        customerId = cData.customer.id;
      }

      const tier = REPORT_FEE_TIERS.find((t) => t.id === formatId) || REPORT_FEE_TIERS[1];
      const jobNumber = `JOB-26-${Math.floor(1000 + Math.random() * 9000)}`;

      const jRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_number: jobNumber,
          customer_id: customerId,
          customer_name: custName.trim(),
          customer_company: custCompany.trim() || null,
          customer_phone: custPhone.trim(),
          stone_description: stoneDesc.trim(),
          approx_weight: approxWeight.trim() || null,
          report_format: formatId,
          fee_lkr: tier.priceLkr,
          status: 'Received',
        }),
      });
      const jData = await jRes.json();
      if (jRes.ok && jData?.job) {
        setJobs((prev) => [jData.job, ...prev]);
        const cleanPhone = custPhone.replace(/[^\d]/g, '');
        const msg = [
          `*WTC GEM LAB — STONE INTAKE RECEIPT*`,
          `Job No: *${jData.job.job_number}*`,
          `Client: ${custName.trim()}`,
          `Stone: ${stoneDesc.trim()}${approxWeight ? ` (${approxWeight})` : ''}`,
          `Service: ${tier.label} (LKR ${tier.priceLkr.toLocaleString()})`,
          `Status: *Received for Screening*`,
          `We will notify you once screening is complete.`,
          `World Trade Center, No 26, 5th Floor, Colombo 01`,
        ].join('\n');
        setWaLink({
          label: `Send Intake WhatsApp (${jData.job.job_number})`,
          url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`,
        });
        onToast?.(`Intake ${jData.job.job_number} recorded as Received!`);
        setStoneDesc('');
        setApproxWeight('');
        setShowIntakeForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleHandoverAndNotify = async (job: LabJobRecord) => {
    const res = await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_number: job.job_number,
        status: 'Handed Over',
      }),
    });
    if (res.ok) {
      setJobs((prev) =>
        prev.map((j) =>
          j.job_number === job.job_number ? { ...j, status: 'Handed Over' } : j
        )
      );
      const cleanPhone = job.customer_phone.replace(/[^\d]/g, '');
      const verifyUrl = job.report_number
        ? `https://wtcgemlab.lk/verify?id=${encodeURIComponent(job.report_number)}`
        : 'https://wtcgemlab.lk/verify';
      const tier = REPORT_FEE_TIERS.find((t) => t.id === job.report_format);
      const handoverMsg = [
        `*WTC GEM LAB — SCREENING COMPLETE & HANDOVER*`,
        `Dear *${job.customer_name}*,`,
        `Your gemstone (*${job.stone_description}*) has completed screening and has been handed over.`,
        job.report_number ? `• *Report No:* ${job.report_number}` : null,
        `• *Job Ref:* ${job.job_number}`,
        `• *Format & Fee:* ${tier?.label || job.report_format} — LKR ${Number(job.fee_lkr).toLocaleString()}`,
        `• *Online Verification:* ${verifyUrl}`,
        `Thank you for trusting WTC Gem Lab, World Trade Center, Colombo 01.`,
      ]
        .filter(Boolean)
        .join('\n');

      setWaLink({
        label: `Send Handover WhatsApp (${job.customer_name})`,
        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(handoverMsg)}`,
      });
      onToast?.(`Job ${job.job_number} marked Handed Over! Click WhatsApp button to notify client.`);
    }
  };

  const counts = {
    Received: jobs.filter((j) => j.status === 'Received').length,
    Screened: jobs.filter((j) => j.status === 'Screened').length,
    'Handed Over': jobs.filter((j) => j.status === 'Handed Over').length,
  };

  const visibleJobs =
    filterStatus === 'All' ? jobs : jobs.filter((j) => j.status === filterStatus);

  return (
    <div className="no-print rounded-2xl bg-[#0B132B] border border-amber-500/30 shadow-xl overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3.5 bg-[#070D1B] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PackageCheck className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-sm font-cinzel font-bold text-white">
              Lab Intake &rarr; Screening &rarr; Handover Queue
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              Received: <span className="text-amber-300 font-bold">{counts.Received}</span> &bull;{' '}
              Screened: <span className="text-emerald-300 font-bold">{counts.Screened}</span> &bull;{' '}
              Handed Over: <span className="text-sky-300 font-bold">{counts['Handed Over']}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {waLink && (
            <a
              href={waLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{waLink.label}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              setShowIntakeForm((v) => !v);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Stone Received</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Toggle Queue"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Quick Stone Intake Form */}
          {showIntakeForm && (
            <form
              onSubmit={handleCreateIntake}
              className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-amber-400 uppercase">
                  New Stone Intake (Received for Screening)
                </span>
                <select
                  value={selectedCustId}
                  onChange={(e) => handleCustPick(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="new">+ New Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Customer Name *"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="WhatsApp / Phone * (+94...)"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Company / Jeweler (Optional)"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Stone Description * (e.g. Blue Cushion)"
                  value={stoneDesc}
                  onChange={(e) => setStoneDesc(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
                <input
                  type="text"
                  placeholder="Approx Weight (e.g. 2.40 ct)"
                  value={approxWeight}
                  onChange={(e) => setApproxWeight(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
                <select
                  value={formatId}
                  onChange={(e) => setFormatId(e.target.value as 'sticker' | 'pvc' | 'a4' | 'advanced')}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-semibold"
                >
                  {REPORT_FEE_TIERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} (LKR {t.priceLkr.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Intake Ticket</span>
                </button>
              </div>
            </form>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {(['All', 'Received', 'Screened', 'Handed Over'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg border transition ${
                  filterStatus === st
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          {visibleJobs.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-3 text-center">
              No intake jobs in this view yet. Click &quot;Record Stone Received&quot; when a customer drops off a stone.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleJobs.slice(0, 9).map((job) => {
                const isActive = activeJobNumber === job.job_number;
                return (
                  <div
                    key={job.job_number}
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-400'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-amber-300">{job.job_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          job.status === 'Received'
                            ? 'bg-amber-500/20 text-amber-300'
                            : job.status === 'Screened'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-white">{job.stone_description}</div>
                      <div className="text-[11px] text-slate-400">
                        {job.customer_name} &bull; {job.customer_phone}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        LKR {Number(job.fee_lkr).toLocaleString()}
                        {job.report_number ? ` • Report: ${job.report_number}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {job.status === 'Received' && (
                        <button
                          type="button"
                          onClick={() => onSelectJobForScreening(job)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono inline-flex items-center justify-center gap-1"
                        >
                          <span>Screen Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {job.status === 'Screened' && (
                        <button
                          type="button"
                          onClick={() => handleHandoverAndNotify(job)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold font-mono inline-flex items-center justify-center gap-1.5"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Handover &amp; WhatsApp</span>
                        </button>
                      )}
                      {job.status === 'Handed Over' && (
                        <div className="w-full py-1 text-center text-[11px] font-mono text-sky-300">
                          Completed &amp; Handed Over
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
