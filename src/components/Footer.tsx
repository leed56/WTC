'use client';

import Link from 'next/link';
import { Shield, Sparkles, MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { LAB_CONTACT_INFO } from '@/lib/gemData';

export default function Footer() {
  return (
    <footer className="bg-[#050A15] border-t border-amber-500/20 text-slate-400 text-sm no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/brand/wtc_crest.png"
                alt="WTC Gem Lab Crest"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(217,175,90,0.3)] shrink-0"
              />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-cinzel font-bold tracking-[0.25em] text-amber-400 uppercase">
                    WTC
                  </span>
                  <span className="text-xl font-cinzel font-black text-white tracking-wider">
                    GEM LAB
                  </span>
                </div>
                <p className="text-[8.5px] uppercase font-mono tracking-widest text-slate-400">
                  GEMOLOGICAL LABORATORY &bull; COLOMBO
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Headquartered at the World Trade Center in Colombo. Dedicated to authoritative gemstone identification, mineral species classification, thermal heat detection, and synthetic discrimination.
            </p>
            <div className="text-[11px] font-mono text-amber-400/90 font-semibold pt-1">
              {LAB_CONTACT_INFO.motto}
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>International Standards &bull; Trusted Certainty</span>
            </div>
          </div>

          {/* Column 2: Laboratory Services */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-amber-400">
              Laboratory Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services#natural-screening" className="hover:text-amber-400 transition-colors">
                  Gemstone Identification (Natural vs Synthetic)
                </Link>
              </li>
              <li>
                <Link href="/services#treatment-screening" className="hover:text-amber-400 transition-colors">
                  Treatment Analysis (Heated vs Unheated)
                </Link>
              </li>
              <li>
                <Link href="/services#origin-screening" className="hover:text-amber-400 transition-colors">
                  Origin Determination (Ceylon Sapphire)
                </Link>
              </li>
              <li>
                <Link href="/services#diamond-grading" className="hover:text-amber-400 transition-colors">
                  Diamond Grading &amp; Lab-Grown Screening
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-amber-400 transition-colors">
                  Online Report Verification Registry
                </Link>
              </li>
              <li>
                <Link href="/services#formats" className="hover:text-amber-400 transition-colors">
                  3 Report Formats (Sticker, Card, A4)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The 3 Report Types */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-amber-400">
              Reporting Formats
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">1. Identification Sticker (50 &times; 30 mm)</strong>
                  <span>For round stone boxes, plastic jars &amp; parcels</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">2. PVC Smart Card (85.6 &times; 54 mm)</strong>
                  <span>CR80 wallet card with scannable QR code</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">3. A4 Gemological Report</strong>
                  <span>Full archival certificate with luxury folder</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Colombo Headquarters */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase font-mono mb-4 text-amber-400">
              Laboratory Location
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">World Trade Center</div>
                  <div className="text-slate-300">No 26, 5th Floor</div>
                  <div className="text-amber-400 font-medium">Colombo 01, Sri Lanka</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{LAB_CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{LAB_CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{LAB_CONTACT_INFO.hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; 2026 WTC Gem Lab (Pvt) Ltd. All rights reserved. World Trade Center, Colombo 01, Sri Lanka. {LAB_CONTACT_INFO.website}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/verify" className="hover:text-slate-300">Report Check</Link>
            <span>&bull;</span>
            <Link href="/about" className="hover:text-slate-300">Code of Ethics</Link>
            <span>&bull;</span>
            <Link href="/submission" className="hover:text-slate-300">Submit Stone</Link>
            <span>&bull;</span>
            <Link href="/admin" className="text-amber-400/80 hover:text-amber-300 font-mono">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
