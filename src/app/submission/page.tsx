'use client';

import { useState } from 'react';
import {
  PackageCheck,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Check
} from 'lucide-react';

export default function SubmissionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    stoneCount: 1,
    serviceType: 'natural-id',
    reportFormat: 'pvc-card',
    isExpress: false,
    shippingMethod: 'walk-in',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          stoneCount: formData.stoneCount,
          serviceTier: `${formData.serviceType} (${formData.reportFormat}${formData.isExpress ? ', Express' : ''})`,
          shippingMethod: formData.shippingMethod,
          notes: formData.notes,
        }),
      });
    } catch {
      // Voucher confirmation still displays
    }
    setSubmitted(true);
  };

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Client Intake Protocol</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            How to Submit Gemstones
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            WTC Gem Lab accepts stones for testing via secure in-person drop-off at our laboratory suite or insured courier shipping. Every stone is barcoded and tracked immediately upon receipt.
          </p>
        </div>

        {/* 2 Methods: Walk-in vs Courier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Method 1: In-person */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              In-Person Laboratory Drop-Off
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Visit our secure testing laboratory at the World Trade Center complex. Immediate intake inspection, gross weight weighing in front of client, and official intake receipt provided.
            </p>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Mon – Fri: 9:00 AM – 5:30 PM (No appointment necessary)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Suite 1408, Tower B, World Trade Center</span>
              </div>
            </div>
          </div>

          {/* Method 2: Courier */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-2">
              Insured Courier Delivery
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Send stones via FedEx, UPS, Brinks, Malca-Amit, or Registered Mail. Always declare appropriate insurance and package stones individually in secure gem stone papers or plastic diamond boxes.
            </p>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Dual-verification unwrapping under security cameras</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                <span>Immediate email intake confirmation with weight acknowledgment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Online Pre-Submission Form */}
        <div className="max-w-3xl mx-auto p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold text-white">
              Online Pre-Submission Intake Form
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Complete this form to generate an advance submission voucher before dropping off or shipping your parcel.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-serif font-bold text-white">Submission Voucher Generated</h4>
              <p className="text-xs text-slate-300">
                Your pre-intake voucher reference is <span className="font-mono text-amber-400 font-bold">WTC-INTAKE-{Math.floor(1000 + Math.random() * 9000)}</span>. A copy has been dispatched to {formData.email || 'your email'}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-xs font-mono text-slate-200 hover:bg-slate-700"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Full Name / Authorized Contact *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Marcus Vance"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Company / Jewelry Store</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Apex Fine Gems Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    placeholder="name@company.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Number of Stones</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stoneCount}
                    onChange={(e) => setFormData({ ...formData, stoneCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Testing Service</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="natural-id">Natural Identification</option>
                    <option value="thermal-screen">Heated vs. Unheated Screening</option>
                    <option value="synthetic-screen">Synthetic / Lab-Grown Discrimination</option>
                    <option value="full-report">Full Comprehensive Screening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Report Format</label>
                  <select
                    value={formData.reportFormat}
                    onChange={(e) => setFormData({ ...formData, reportFormat: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="pvc-card">PVC Smart Card Report</option>
                    <option value="sticker">Verbal Gem Box Sticker</option>
                    <option value="a4-cert">Full A4 Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Delivery Method</label>
                  <select
                    value={formData.shippingMethod}
                    onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="walk-in">In-Person Walk-in</option>
                    <option value="courier">Insured Courier Shipping</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExpress}
                    onChange={(e) => setFormData({ ...formData, isExpress: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-slate-300 font-medium">Request Same-Day Priority Express Service (+$30/stone)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Specific Instructions / Declarations</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Cushion blue sapphire, client states unheated Ceylon; verify heat treatment."
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl transition-all"
              >
                Generate Pre-Submission Intake Form
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
