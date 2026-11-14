'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  Sparkles,
  Flame,
  Layers,
  ArrowRight,
  CheckCircle2,
  Award,
  Compass,
  Microscope,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  MapPin,
  Scale,
  Lock,
  QrCode,
  Fingerprint,
  Eye
} from 'lucide-react';
import { INITIAL_CERTIFICATES } from '@/lib/gemData';

export default function Home() {
  const router = useRouter();
  const [reportInput, setReportInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportInput.trim()) return;
    router.push(`/verify?id=${encodeURIComponent(reportInput.trim().toUpperCase())}`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-[#070D1B] text-slate-100">
      
      {/* ========================================================
          1. WORLD-CLASS EXECUTIVE HERO & VERIFICATION PORTAL
          ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B132B] via-[#0D1835] to-[#070D1B] pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24 border-b border-amber-500/20">
        {/* Ambient architectural lighting */}
        <div className="absolute top-1/4 left-1/4 w-[280px] sm:w-[550px] h-[280px] sm:h-[550px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[260px] sm:w-[480px] h-[260px] sm:h-[480px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* Left Column: Authority Headline & Online Verification Portal (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-5 sm:space-y-6 min-w-0">
              
              {/* Top Prestige Badge */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Independent Gemological Laboratory &bull; Colombo 01</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-[46px] xl:text-6xl font-cinzel font-extrabold text-white tracking-tight leading-[1.14]">
                Scientific Gemstone{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                  Testing &amp; Registry
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed max-w-2xl font-sans">
                Authoritative gemological analysis for <span className="text-white font-medium">Natural</span>, <span className="text-amber-400 font-medium">Heated</span>, and <span className="text-purple-300 font-medium">Synthetic</span> gemstones. Delivering independent certainty for global dealers, collectors, and fine jewelers.
              </p>

              {/* 4 Core Specialization Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-sans pt-1">
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-emerald-300 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Natural Species Identification</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/30 text-amber-300 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Thermal &amp; Heat Analysis</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/90 border border-purple-500/30 text-purple-300 shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Synthetic &amp; Simulant Discrimination</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 shadow-sm">
                  <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Optical &amp; Physical Constants</span>
                </span>
              </div>

              {/* Online Report Verification Capsule */}
              <div className="rounded-2xl bg-gradient-to-r from-[#0C1630] via-[#0F1E42] to-[#0C1630] border-2 border-amber-500/40 p-4 sm:p-6 shadow-2xl shadow-amber-500/10">
                <div className="text-left mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-cinzel font-bold text-white uppercase tracking-wider">
                      Official Report Verification Portal
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 hidden sm:flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Encrypted Cloud Registry</span>
                  </span>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      value={reportInput}
                      onChange={(e) => setReportInput(e.target.value)}
                      placeholder="Enter Report Number (e.g. WTC-26-000125)"
                      className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-cinzel font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition active:scale-95 shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verify Report</span>
                  </button>
                </form>

                {/* Quick Sample Registry Records */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-mono text-[10.5px]">Sample Records:</span>
                    {INITIAL_CERTIFICATES.slice(0, 3).map((item) => (
                      <button
                        key={item.reportNumber}
                        onClick={() => {
                          setReportInput(item.reportNumber);
                          router.push(`/verify?id=${item.reportNumber}`);
                        }}
                        className="px-2.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-[10.5px] border border-slate-700 transition"
                      >
                        {item.reportNumber}
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/verify"
                    className="text-amber-400 hover:text-amber-300 text-[10.5px] font-mono font-semibold whitespace-nowrap"
                  >
                    Registry Portal &rarr;
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/submission"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Submit a Gemstone</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>

                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-medium text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Book Drop-off Appointment</span>
                </Link>
              </div>

            </div>

            {/* Right Column: World-Class Institutional Authority & Security Panel (5 cols) */}
            <div className="lg:col-span-5 min-w-0">
              <div className="relative group">
                {/* Ambient Golden Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-amber-500/25 via-blue-600/20 to-amber-500/25 blur-xl opacity-80 pointer-events-none" />

                <div className="relative rounded-2xl bg-gradient-to-b from-[#0C162E] via-[#091226] to-[#060C1A] border border-amber-500/40 p-5 sm:p-6 xl:p-7 shadow-2xl space-y-5 sm:space-y-6">
                  
                  {/* Top Crest & Institutional Seal */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 sm:pb-5">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img
                        src="/brand/wtc_crest.png"
                        alt="WTC Gem Lab Official Crest"
                        className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(217,175,90,0.4)] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <span className="font-cinzel text-[11px] sm:text-xs font-bold tracking-[0.2em] text-amber-400">WTC</span>
                          <span className="font-cinzel text-base sm:text-lg font-black tracking-wider text-white">GEM LAB</span>
                        </div>
                        <div className="text-[8px] sm:text-[8.5px] font-mono tracking-[0.18em] text-slate-400 uppercase whitespace-nowrap">
                          GEMOLOGICAL LABORATORY
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9.5px] sm:text-[10px] font-bold whitespace-nowrap shrink-0">
                      Verified Registry
                    </div>
                  </div>

                  {/* Anti-Counterfeiting & Registry Architecture */}
                  <div className="space-y-3.5">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                      Document Security &amp; Authentication
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-cinzel font-bold text-white">Cryptographic QR Verification</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-sans">
                          Every issued report is paired with a unique digital twin in our cloud registry to prevent document alteration or forgery.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-cinzel font-bold text-white">Tamper-Evident Physical Seals</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-sans">
                          Protected by embossed metallic laboratory seals, micro-printed guilloche borders, and security lamination.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-cinzel font-bold text-white">Dual-Gemologist Independent Sign-Off</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-sans">
                          Strict two-stage independent optical and physical testing protocol prior to final certification release.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-950/60">
                      <div className="font-cinzel font-black text-base text-amber-400">24–48h</div>
                      <div className="text-[9.5px] font-mono text-slate-400 uppercase">Turnaround</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60">
                      <div className="font-cinzel font-black text-base text-white">3 Tiers</div>
                      <div className="text-[9.5px] font-mono text-slate-400 uppercase">Report Formats</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60">
                      <div className="font-cinzel font-black text-base text-emerald-400">100%</div>
                      <div className="text-[9.5px] font-mono text-slate-400 uppercase">Independent</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. LIVE REGISTRY VERIFICATION TICKER
          ======================================================== */}
      <section className="py-5 bg-[#040915] border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-widest">
                Sample Registry Verifications:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {INITIAL_CERTIFICATES.slice(0, 4).map((c) => (
                <Link
                  key={c.reportNumber}
                  href={`/verify?id=${c.reportNumber}`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between gap-2 group shadow-sm min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[11px] font-bold text-amber-400 group-hover:text-amber-300 truncate">
                      {c.reportNumber}
                    </div>
                    <div className="text-[11px] font-medium text-white truncate">
                      {c.variety}
                    </div>
                  </div>
                  <div className="text-right shrink-0 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-slate-400 block">{c.weight}</span>
                    <span className="text-[9.5px] font-semibold text-emerald-400 block">
                      {c.treatment.includes('No') ? 'Unheated' : c.stoneType === 'Synthetic' ? 'Synthetic' : 'Heated'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. THE 3 CORE SCREENING PILLARS
          ======================================================== */}
      <section className="py-20 bg-[#080E1C] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Specialized Gemological Scope
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white mt-1">
              Core Testing Specialization
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              We focus on the three most decisive determinations for international dealers, collectors, and jewelers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* 1. Natural Identification */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A1325] border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Species &amp; Variety
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  Natural Gemstone Identification
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Rigorous optical and microscopic examination of natural mineral inclusions, growth structures, and physical constants to conclusively verify earth-mined gems against imitations, glass, and composite doublets.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Natural Sapphire, Ruby, Emerald verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Natural Spinel, Chrysoberyl, Alexandrite, Garnet</span>
                </li>
              </ul>
            </div>

            {/* 2. Thermal / Heat Treatment */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A1325] border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Treatment Detection
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  Heated vs. Unheated Testing
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Thermal modification drastically impacts market valuation. We examine rutile silk dissolution, internal stress halos, and crystal integrity under high magnification to give a definitive unheated or heated conclusion.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Unheated vs. Heated Corundum verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Detection of clarity oiling &amp; polymer filling</span>
                </li>
              </ul>
            </div>

            {/* 3. Synthetic Screening */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A1325] border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  Laboratory-Created
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  Synthetic &amp; Simulant Discrimination
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Protecting buyers and trade participants against undisclosed synthetic stones. Rigorous screening for Hydrothermal emeralds, Flux-grown rubies, Flame Fusion sapphires, glass fillings, and composite simulants.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Diagnostic growth striae &amp; nail-head spicules</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Multi-wavelength UV reaction screening</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          4. THE 3 OFFICIAL REPORT FORMATS (Architectural Spec Cards - No Raw Templates)
          ======================================================== */}
      <section className="py-20 bg-[#0B132B] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
                Official Certification Tiers
              </span>
              <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white mt-1">
                3 Security-Protected Report Formats
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                To protect document integrity and prevent counterfeiting, physical report templates are never published online. Every issued report is verifiable via its encrypted QR registry record.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 shrink-0"
            >
              <span>View Fee Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Format 1: Verbal Sticker */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Tag className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-950 text-[10px] font-mono text-amber-300 font-bold border border-slate-800">
                    50 mm &times; 30 mm
                  </span>
                </div>

                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  Tier 01 &bull; Parcel &amp; Box Seal
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  Verbal Identification Sticker
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Compact tamper-evident security label engineered for gemstone display boxes, round parcel jars, and folded stone papers. Ideal for high-volume wholesale trade lots.
                </p>

                <div className="space-y-2.5 text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-5 mb-6">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Tamper-evident adhesive security stock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Scannable micro-QR cloud registry link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>States Species, Weight &amp; Treatment status</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Turnaround</span>
                  <span className="text-xs font-bold font-mono text-white">Same-Day / 24h</span>
                </div>
                <Link
                  href="/submission"
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-semibold transition"
                >
                  Request Tier &rarr;
                </Link>
              </div>
            </div>

            {/* Format 2: PVC Smart Card */}
            <div className="p-7 rounded-2xl bg-gradient-to-b from-[#0E1938] to-slate-900 border-2 border-amber-500/50 hover:border-amber-400 transition flex flex-col justify-between shadow-2xl relative">
              <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                Trade Standard
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-950 text-[10px] font-mono text-amber-300 font-bold border border-amber-500/30">
                    85.6 &times; 54 mm (CR80)
                  </span>
                </div>

                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  Tier 02 &bull; Retail &amp; Export
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  PVC Smart Card Report
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Waterproof, credit-card sized composite credential designed for everyday trading and retail jewelry accompaniment. Features a high-resolution stone macro photograph.
                </p>

                <div className="space-y-2.5 text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-5 mb-6">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Thermal-bonded rigid CR80 composite core</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>High-contrast QR &amp; digital security hash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full physical specs &amp; calibrated stone photo</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Turnaround</span>
                  <span className="text-xs font-bold font-mono text-white">24 – 48 Hours</span>
                </div>
                <Link
                  href="/submission"
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition"
                >
                  Request Tier &rarr;
                </Link>
              </div>
            </div>

            {/* Format 3: A4 Archival Certificate */}
            <div className="p-7 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-950 text-[10px] font-mono text-amber-300 font-bold border border-slate-800">
                    210 &times; 297 mm (A4)
                  </span>
                </div>

                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
                  Tier 03 &bull; Collector &amp; Auction
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mt-1 mb-3">
                  A4 Gemological Certificate
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                  Full archival dossier presented in a royal blue gold-embossed hardcover folder. Reserved for fine investment gemstones, collector pieces, and high-value jewelry.
                </p>

                <div className="space-y-2.5 text-xs text-slate-300 font-sans border-t border-slate-800/80 pt-5 mb-6">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Embossed metallic gold seal &amp; guilloche paper</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Includes Royal Blue Hardcover Folder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Comprehensive optical &amp; microscopic dossier</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Turnaround</span>
                  <span className="text-xs font-bold font-mono text-white">24 – 48 Hours</span>
                </div>
                <Link
                  href="/submission"
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-semibold transition"
                >
                  Request Tier &rarr;
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. SCIENTIFIC GEMOLOGICAL METHODOLOGY PROTOCOLS
          ======================================================== */}
      <section className="py-20 bg-[#080E1C] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
              Standardized Testing Protocols
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-white mt-1">
              Multi-Point Laboratory Testing
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-sans">
              Every certificate issued by WTC Gem Lab is backed by systematic optical and physical testing conducted by qualified gemologists:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Microscope className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Optical Stereomicroscopy</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Darkfield, brightfield, and polarized lighting to examine diagnostic natural inclusions, fluid feathers, rutile silk dissolution, and synthetic growth structures.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Compass className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Refractometry &amp; Birefringence</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Precision sodium-light refractometry to measure exact Refractive Index (R.I.) and double refraction limits, separating species with optical certainty.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Scale className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Hydrostatic Specific Gravity</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Electronic micro-balance immersion testing to calculate exact mineral specific gravities and density characteristics.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Sparkles className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Dual SW/LW UV Luminescence</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Shortwave and longwave ultraviolet screening to detect diagnostic chalky fluorescence and phosphorescence indicative of synthetic or treated stones.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Layers className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Polariscopic Strain Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Crossed polarizers reveal anomalous double refraction (ADR), cross-hatch strain patterns, and optic characters in isotropic vs. anisotropic gems.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Award className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="text-base font-cinzel font-bold text-white">Spectroscopic Absorption</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Direct-vision gem spectroscopes to identify diagnostic optical absorption bands, such as the 450nm iron absorption in natural blue sapphires.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          6. COLOMBO 01 HEADQUARTERS & SUBMISSION BANNER
          ======================================================== */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-amber-950">
                Colombo 01 &bull; World Trade Center
              </span>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-black mt-1">
                Ready to submit gemstones for testing?
              </h2>
              <p className="text-sm font-medium text-amber-950/90 mt-1 max-w-xl font-sans">
                Visit our laboratory suite at World Trade Center, No 26, 5th Floor, Colombo 01, or securely ship stones via insured courier. Fast 24-48h turnaround.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto text-center">
              <Link
                href="/submission"
                className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm shadow-xl transition"
              >
                Submission Guidelines
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-slate-950 font-semibold text-xs sm:text-sm border border-amber-950/20 transition"
              >
                Contact Laboratory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. BOTTOM TRUST STRIP
          ======================================================== */}
      <section className="py-8 bg-[#040812] border-t border-slate-800 text-slate-300 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="flex flex-col items-center">
              <Award className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-semibold text-white">Professional Gemologists</div>
              <div className="text-[11px] text-slate-400">Independent &bull; Unbiased</div>
            </div>

            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-semibold text-white">Strict Quality Control</div>
              <div className="text-[11px] text-slate-400">Multi-Methodology Verification</div>
            </div>

            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-semibold text-white">Trusted by Traders</div>
              <div className="text-[11px] text-slate-400">Local &amp; International Dealers</div>
            </div>

            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-semibold text-white">World Trade Center</div>
              <div className="text-[11px] text-slate-400">Level 5, Colombo 01, Sri Lanka</div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
