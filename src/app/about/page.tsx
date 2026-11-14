import { Shield, Sparkles, Award, Scale, CheckCircle2, Building2, MapPin } from 'lucide-react';
import { LAB_CONTACT_INFO } from '@/lib/gemData';

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Integrity &bull; Precision &bull; Independence</span>
          </div>
          <h1 className="text-4xl font-cinzel font-bold text-white tracking-tight">
            About WTC Gem Lab
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Headquartered at the iconic World Trade Center, No 26, 5th Floor, Colombo 01, Sri Lanka. An independent gemological testing facility dedicated to honest gemstone identification, Ceylon origin authentication, and synthetic discrimination.
          </p>
        </div>

        {/* Story & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <h2 className="text-2xl font-cinzel font-bold text-white mb-2">
              Our Independent Gemological Mandate
            </h2>
            <p>
              Located in Colombo, the global gateway to Ceylon gemstones, WTC Gem Lab provides unbiased, scientifically backed certification for international dealers, local jewelers, and discerning collectors.
            </p>
            <p>
              In an era where synthetic lab-grown diamonds, hydrothermal emeralds, and sophisticated thermal enhancements enter the trade, verified certainty is paramount.
            </p>
            <p>
              WTC Gem Lab operates with strict commercial independence. We do not buy, sell, or broker gemstones. Our sole mission is to provide rigorous, standardized testing using precision optical stereomicroscopy, refractometry, hydrostatic density testing, and multi-wavelength ultraviolet luminescence.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-lg font-cinzel font-bold text-amber-400">
              The WTC Gem Lab Code of Ethics
            </h3>
            <div className="space-y-3.5 text-xs text-slate-300 font-sans">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero Commercial Conflict: Neither the laboratory nor its staff engage in gemstone trading.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Standardized Multi-Gemologist Review: Every high-value or treated stone undergoes dual examination before report sign-off.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Tamper-Proof Digital Verification: Real-time QR registry validation protects clients against counterfeit paperwork.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Unambiguous Terminology: Clear, honest classification—Natural, Heated, or Synthetic.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <Scale className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-white font-cinzel font-bold text-base">Unbiased Verification</h4>
            <p className="text-xs text-slate-400 mt-1">
              Independent laboratory decisions governed strictly by diagnostic physical evidence.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-white font-cinzel font-bold text-base">Anti-Counterfeit Protection</h4>
            <p className="text-xs text-slate-400 mt-1">
              Guilloche security background, official lab stamps, and scannable online QR code lookup.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-cinzel font-bold text-base">Synthetic Screening</h4>
            <p className="text-xs text-slate-400 mt-1">
              Accurate separation of natural mined gemstones from laboratory-created synthetics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
