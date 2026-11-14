import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Flame,
  FileCheck,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileText,
  Tag
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/gemData';

export default function ServicesPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Fee &amp; Testing Menu</span>
          </div>
          <h1 className="text-4xl font-cinzel font-bold text-white tracking-tight">
            Gemological Testing &amp; Reporting Options
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Standardized gemological screening for natural origin, thermal heat detection, and synthetic discrimination with three flexible reporting formats tailored for jewelers, dealers, and collectors.
          </p>
        </div>

        {/* 3 REPORTING FORMATS SHOWCASE */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Client Reporting Formats
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-1">
              Choose From 3 Official Report Formats
            </h2>
            <p className="text-slate-400 text-xs mt-2">
              Every format includes our verifiable digital QR record linked to the official registry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Format 1: Verbal Sticker */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Format 01 &bull; Compact &amp; Fast
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-2">
                  Verbal Report (Gem Box Sticker)
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Adhesive tamper-evident label designed specifically for plastic gemstone jars, display boxes, and paper parcels. Ideal for wholesale dealers trading bulk lots.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>65mm &times; 42mm high-durability sticker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Quick mini QR code for mobile verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fastest same-day turnaround option</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Standard Fee</span>
                  <span className="text-lg font-bold font-mono text-amber-400">LKR 300</span>
                </div>
                <Link
                  href="/verify?id=WTC-26-000125"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono font-semibold"
                >
                  Preview Sample &rarr;
                </Link>
              </div>
            </div>

            {/* Format 2: PVC Smart Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/40 hover:border-amber-500 transition-all flex flex-col justify-between shadow-xl group relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950 uppercase">
                Most Popular
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Format 02 &bull; Trade Standard
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-2">
                  PVC Smart Card Report
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Credit-card sized CR80 high-gloss laminated PVC card with embedded security background. Includes color gem photograph, key specs, and instant QR scan.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Durable pocket size fits jewelry cases &amp; wallets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dual-sided diagnostic laboratory metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tamper-evident holographic security seal</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Standard Fee</span>
                  <span className="text-lg font-bold font-mono text-amber-400">LKR 1,200</span>
                </div>
                <Link
                  href="/verify?id=WTC-26-000125"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono font-semibold"
                >
                  Preview Sample &rarr;
                </Link>
              </div>
            </div>

            {/* Format 3: Full A4 Certificate */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Format 03 &bull; High Value &amp; Auction
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-2">
                  Official A4 Certificate
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Full-spread archival certificate printed on luxury guilloche security paper with embossed laboratory seal, detailed microscopic inclusion notes, and Director sign-off.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Comprehensive multi-methodology documentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ideal for auction houses, insurance, &amp; fine jewelry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Embossed laboratory seal &amp; tamper-proof border</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Standard Fee</span>
                  <span className="text-lg font-bold font-mono text-amber-400">LKR 4,500</span>
                </div>
                <Link
                  href="/verify?id=WTC-26-000125"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono font-semibold"
                >
                  Preview Sample &rarr;
                </Link>
              </div>
            </div>

            {/* Format 4: Advanced Report */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between shadow-xl group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Format 04 &bull; Bespoke &amp; Investment
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-2">
                  Advanced Report
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  In-depth flagship laboratory dossier for rare collector gemstones, featuring extended photomicrography, detailed diagnostic commentary, and priority handling.
                </p>
                <ul className="space-y-2 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Extended microscopic inclusion &amp; treatment dossier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High-resolution stone &amp; photomicrograph plates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Senior Gemologist verification &amp; archival seal</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Standard Fee</span>
                  <span className="text-lg font-bold font-mono text-amber-400">LKR 30,000</span>
                </div>
                <Link
                  href="/submission"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono font-semibold"
                >
                  Request &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Screening Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {SERVICE_CATEGORIES.map((service) => (
            <div
              key={service.id}
              id={service.id}
              className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    {service.subtitle}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{service.turnaround}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-cinzel font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="space-y-2.5 mb-8">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Scope of Examination:
                  </div>
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-mono">Standard Testing Fee</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{service.priceRange}</span>
                </div>
                <Link
                  href="/submission"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Submit Stone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Schedule Table by Carat Weight */}
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/60 border border-slate-800 mb-20">
          <div className="max-w-2xl mb-6">
            <h3 className="text-2xl font-cinzel font-bold text-white">
              Fee Schedule by Carat Weight &amp; Format
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select the reporting format suited for your transaction. Express same-day service available upon request.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-amber-400">
                  <th className="py-3 px-4 uppercase">Tier</th>
                  <th className="py-3 px-4 uppercase">1. Verbal Box Sticker</th>
                  <th className="py-3 px-4 uppercase">2. PVC Smart Card</th>
                  <th className="py-3 px-4 uppercase">3. Full A4 Certificate</th>
                  <th className="py-3 px-4 uppercase">4. Advanced Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-white">Standard Single Stone</td>
                  <td className="py-3.5 px-4 text-amber-300 font-bold">LKR 300</td>
                  <td className="py-3.5 px-4 text-amber-300 font-bold">LKR 1,200</td>
                  <td className="py-3.5 px-4 text-amber-300 font-bold">LKR 4,500</td>
                  <td className="py-3.5 px-4 text-amber-300 font-bold">LKR 30,000</td>
                </tr>
                <tr className="hover:bg-slate-800/40 bg-amber-500/5">
                  <td className="py-3.5 px-4 font-bold text-amber-400">Parcel Screening (20+ Stones)</td>
                  <td className="py-3.5 px-4 text-amber-300" colSpan={4}>
                    Volume trade rates available for bulk verbal box stickers &amp; wholesale lots.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
