'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Check, Building2, ShieldCheck } from 'lucide-react';
import { LAB_CONTACT_INFO } from '@/lib/gemData';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // Confirmation still displays
    }
    setSent(true);
  };

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Colombo Headquarters &bull; Drop-off</span>
          </div>
          <h1 className="text-4xl font-cinzel font-bold text-white tracking-tight">
            Contact WTC Gem Lab
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Located in the prestigious World Trade Center twin towers in Colombo 01, Sri Lanka. Reach out to schedule a drop-off, inquire about trade parcel testing, or verify reports.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-lg overflow-hidden p-0.5 bg-amber-500/30">
                  <img src="/brand/wtc_logo.jpeg" alt="WTC Logo" className="w-full h-full object-cover rounded" />
                </div>
                <div>
                  <h3 className="text-lg font-cinzel font-bold text-white">WTC Gemological Laboratory</h3>
                  <p className="text-[10px] font-mono text-amber-400 uppercase">Colombo 01, Sri Lanka</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5 text-xs text-slate-300">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white font-cinzel text-sm">Official Address</div>
                  <div className="text-amber-300 font-medium">World Trade Center</div>
                  <div className="text-slate-300">No 26, 5th Floor</div>
                  <div className="text-slate-400">Colombo 01, Sri Lanka</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-300">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white font-cinzel text-sm">Laboratory Telephone</div>
                  <div className="text-slate-300 font-mono">{LAB_CONTACT_INFO.phone}</div>
                  <div className="text-slate-400 font-mono">{LAB_CONTACT_INFO.mobile}</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-300">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white font-cinzel text-sm">Email Inquiries</div>
                  <div className="text-slate-300 font-mono">{LAB_CONTACT_INFO.email}</div>
                  <div className="text-slate-400 font-mono">info@wtcgemlab.lk</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-300">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white font-cinzel text-sm">Operating Hours</div>
                  <div className="text-slate-300">{LAB_CONTACT_INFO.hours}</div>
                  <div className="text-slate-400">Sunday &amp; Public Holidays: Closed</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security &amp; In-Person Drop-Off Notice</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For in-person submissions, please visit the World Trade Center lobby security desk on the ground floor with valid national photo ID or passport to access Level 5.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
              <h3 className="text-2xl font-cinzel font-bold text-white mb-2">Send an Inquiry or Book Drop-off</h3>
              <p className="text-xs text-slate-400 mb-6">
                Our gemologists at the World Trade Center testing suite respond within 2–4 business hours.
              </p>

              {sent ? (
                <div className="p-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-cinzel font-bold text-white">Inquiry Received</h4>
                  <p className="text-xs text-slate-300">
                    Thank you. A senior gemologist from WTC Gem Lab Colombo will review your request and contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        placeholder="e.g. Mohamed Rizwan"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        placeholder="rizwan@gems.lk"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Subject / Inquiry Type</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Inquiring on Ceylon Blue Sapphire A4 certification turnaround"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                      placeholder="Please include details such as stone variety, approximate weight in carats, or quantity of stones..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
