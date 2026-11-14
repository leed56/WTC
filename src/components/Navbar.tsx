'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Menu,
  X,
  Sparkles,
  User,
  Clock,
  Phone,
  Mail,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { LAB_CONTACT_INFO } from '@/lib/gemData';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="w-full max-w-full bg-[#070D1B] text-white border-b border-amber-500/30 sticky top-0 z-50 shadow-2xl overflow-x-clip">
      {/* Top Utility Bar (Quick Contact & Staff Access) */}
      <div className="bg-[#040812] border-b border-slate-800/80 text-slate-300 text-[11px] py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-end gap-3 sm:gap-5 font-mono text-[10px] sm:text-[11px] text-slate-400">
          <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Mon – Fri: 9:00 AM – 6:00 PM</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-semibold">{LAB_CONTACT_INFO.phone}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
            <Mail className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{LAB_CONTACT_INFO.email}</span>
          </div>
          {(!process.env.NEXT_PUBLIC_VERCEL_ENV ||
            process.env.NEXT_PUBLIC_STAFF_PORTAL_ENABLED === 'true') && (
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-800">
              <Link
                href="/staff-lab"
                className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Lab Engine</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                <User className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Staff Registry</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#0D1835] to-[#070D1B] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-16 sm:h-20">
            
            {/* Brand Logo with 3D Crest */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 py-1 min-w-0">
              <img
                src="/brand/wtc_crest.png"
                alt="WTC Gem Lab Crest"
                className="h-8 sm:h-9 xl:h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(217,175,90,0.4)] group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex flex-col justify-center whitespace-nowrap">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[10px] sm:text-xs font-cinzel font-bold tracking-[0.2em] text-amber-300/90 uppercase">
                    WTC
                  </span>
                  <span className="text-base sm:text-lg xl:text-xl font-cinzel font-black tracking-wider text-white group-hover:text-amber-200 transition-colors">
                    GEM LAB
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono font-bold">®</span>
                </div>
                <div className="text-[7px] sm:text-[8px] xl:text-[8.5px] tracking-[0.18em] sm:tracking-[0.22em] text-amber-400/90 uppercase font-mono font-medium">
                  GEMOLOGICAL LABORATORY
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
              <Link
                href="/"
                className={`px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                  pathname === '/'
                    ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                Home
              </Link>

              <Link
                href="/methodology"
                className={`px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                  pathname === '/methodology'
                    ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                Laboratory
              </Link>

              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href="/services"
                  className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                    pathname.startsWith('/services')
                      ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                      : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown className="w-3 h-3 text-amber-400 shrink-0" />
                </Link>

                {servicesOpen && (
                  <div className="absolute top-full left-0 w-72 bg-[#091124]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl py-3 z-50">
                    <Link
                      href="/services#natural-screening"
                      className="block px-4 py-2.5 hover:bg-slate-800/80 transition group"
                    >
                      <div className="font-cinzel text-xs font-bold text-white group-hover:text-amber-300">
                        Natural Gemstone Identification
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Species &amp; Variety Characterization
                      </div>
                    </Link>
                    <Link
                      href="/services#treatment-screening"
                      className="block px-4 py-2.5 hover:bg-slate-800/80 transition group"
                    >
                      <div className="font-cinzel text-xs font-bold text-white group-hover:text-amber-300">
                        Thermal &amp; Heat Analysis
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Heated vs. Unheated Determination
                      </div>
                    </Link>
                    <Link
                      href="/services#synthetic-screening"
                      className="block px-4 py-2.5 hover:bg-slate-800/80 transition group"
                    >
                      <div className="font-cinzel text-xs font-bold text-white group-hover:text-amber-300">
                        Synthetic Discrimination
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Hydrothermal, Flux &amp; Flame Fusion
                      </div>
                    </Link>
                    <div className="border-t border-slate-800 my-1.5" />
                    <Link
                      href="/services#formats"
                      className="block px-4 py-2 text-xs text-amber-400 hover:text-amber-300 font-mono font-semibold"
                    >
                      View 3 Report Formats &rarr;
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/services#formats"
                className="px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap text-slate-300 hover:text-amber-200 hover:bg-slate-800/60 rounded-lg transition-all"
              >
                Reports
              </Link>

              <Link
                href="/verify"
                className={`px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                  pathname === '/verify'
                    ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                Verification
              </Link>

              <Link
                href="/about"
                className={`px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                  pathname === '/about'
                    ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className={`px-2 xl:px-2.5 py-1.5 text-[10px] xl:text-[11px] font-cinzel font-bold tracking-[0.08em] xl:tracking-[0.12em] uppercase whitespace-nowrap transition-all rounded-lg ${
                  pathname === '/contact'
                    ? 'text-amber-300 bg-amber-500/15 border-b-2 border-amber-400 shadow-[0_0_12px_rgba(217,175,90,0.2)]'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Primary CTA Button */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link
                href="/submission"
                className="flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black text-[10.5px] xl:text-xs tracking-wider uppercase whitespace-nowrap shadow-[0_4px_20px_rgba(217,175,90,0.4)] hover:shadow-[0_4px_28px_rgba(217,175,90,0.6)] active:scale-95 transition-all"
              >
                <span>Submit Gemstone</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                href="/verify"
                className="p-2 rounded-lg bg-amber-500 text-slate-950"
                title="Verify Report"
              >
                <Search className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1224] border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-2">
          <div className="p-3 mb-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-amber-300 font-mono">+94 11 234 5678</span>
            <span className="text-slate-400 font-mono">reports@wtcgemlab.lk</span>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            href="/methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Laboratory
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Services &amp; Fees
          </Link>
          <Link
            href="/services#formats"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Report Formats (Sticker, Card, A4)
          </Link>
          <Link
            href="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-amber-400 font-semibold hover:bg-slate-800"
          >
            Verify Report
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Contact
          </Link>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/submission"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm"
            >
              <span>Submit a Gemstone</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {(!process.env.NEXT_PUBLIC_VERCEL_ENV ||
              process.env.NEXT_PUBLIC_STAFF_PORTAL_ENABLED === 'true') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Login / Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
