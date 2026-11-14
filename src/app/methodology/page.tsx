import {
  Microscope,
  Compass,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  Shield,
  Eye,
  Scale
} from 'lucide-react';
import { METHODOLOGY_STEPS } from '@/lib/gemData';

export default function MethodologyPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <Microscope className="w-3.5 h-3.5" />
            <span>Standard Gemological Protocol</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Laboratory Screening Methodology
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Our diagnostic testing relies on standardized gemological principles, multi-point optical inspection, and physical measurements to authenticate natural origin, uncover thermal enhancements, and identify synthetic gems.
          </p>
        </div>

        {/* Methodology Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {METHODOLOGY_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <span className="font-mono text-3xl font-bold text-amber-500/40 mb-4 block">
                  {step.step}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Breakdown: Natural vs. Heated vs. Synthetic */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              How We Distinguish Gemstone Categories
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Every stone submitted to WTC Gem Lab undergoes systematic verification against key diagnostic markers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Natural Verification */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Natural Gemstones</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-white mb-2">Diagnostic Natural Markers</h4>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li>&bull; Undisturbed rutile silk needles in hexagonal arrays (unheated Corundum).</li>
                <li>&bull; Natural angular and hexagonal color zoning.</li>
                <li>&bull; Healed fluid feathers and multiphase mineral inclusions (apatite, zircon, calcite).</li>
                <li>&bull; Standard refractive index and double refraction limits.</li>
              </ul>
            </div>

            {/* Heated / Treatment Determination */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase mb-3">
                <Flame className="w-4 h-4" />
                <span>Thermal / Heat Treatment</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-white mb-2">Heated Signs Detected</h4>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li>&bull; Dissolved or dotted rutile silk (partially melted needles).</li>
                <li>&bull; Circular discoid thermal tension halos surrounding crystal inclusions.</li>
                <li>&bull; Altered chalky surface or altered fissure fillings under magnification.</li>
                <li>&bull; Modified UV fluorescence patterns typical of thermally treated gems.</li>
              </ul>
            </div>

            {/* Synthetic Discrimination */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase mb-3">
                <Layers className="w-4 h-4" />
                <span>Synthetic &amp; Lab-Grown</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-white mb-2">Synthetic Growth Traits</h4>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li>&bull; Curved growth striae and gas bubbles in Flame Fusion synthetics.</li>
                <li>&bull; Chevron growth zoning and hydrothermal nail-head spicules.</li>
                <li>&bull; Flux remnants (veils resembling lace or twisted breadcrumbs).</li>
                <li>&bull; Characteristic cross-hatch strain birefringence under polarized light.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
