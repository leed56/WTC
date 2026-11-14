'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GemCertificate, LAB_CONTACT_INFO } from '@/lib/gemData';
import { generateQrDataUrl } from '@/lib/certificateStore';
import {
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  Tag,
  Shield,
  MapPin
} from 'lucide-react';

interface Props {
  cert: GemCertificate;
  showBackToSearch?: boolean;
}

export type ReportFormat = 'digital' | 'a4' | 'pvc' | 'sticker';

export default function CertificateViewer({ cert, showBackToSearch = true }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('digital');
  const [pvcSide, setPvcSide] = useState<'front' | 'back' | 'both'>('both');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verifyUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/verify?id=${encodeURIComponent(cert.reportNumber)}`
      : `https://www.wtcgemlab.lk/verify?id=${cert.reportNumber}`;

    generateQrDataUrl(verifyUrl).then((url) => {
      setQrCodeUrl(url);
    });
  }, [cert.reportNumber]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verify?id=${encodeURIComponent(cert.reportNumber)}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getTreatmentBadge = (compact = false) => {
    if (cert.stoneType === 'Natural') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
          <CheckCircle2 className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Natural &bull; Unheated</span>
        </span>
      );
    } else if (cert.stoneType === 'Heated') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
          <AlertTriangle className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Natural &bull; Heated</span>
        </span>
      );
    } else if (cert.stoneType === 'Synthetic') {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
          <Sparkles className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Synthetic / Lab-Grown</span>
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
          <ShieldAlert className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Treated / Clarity Enhanced</span>
        </span>
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top action bar & format switcher */}
      <div className="no-print space-y-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm">
          {showBackToSearch ? (
            <Link
              href="/verify"
              className="flex items-center gap-2 text-slate-300 hover:text-amber-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Search Another Report</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Database Record: {cert.reportNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-xs font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                Print {selectedFormat === 'digital' ? 'Verification Record' : selectedFormat === 'a4' ? 'A4 Certificate' : selectedFormat === 'pvc' ? 'PVC Card' : 'Box Sticker'}
              </span>
            </button>
          </div>
        </div>

        {/* View Mode & Staff Print Formats Toggle */}
        <div className="p-2 rounded-xl bg-slate-900/95 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFormat('digital')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFormat === 'digital'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Digital Registry Record (Public)</span>
            </button>

            <button
              onClick={() => setSelectedFormat('a4')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFormat === 'a4'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Print Layout</span>
            </button>

            <button
              onClick={() => setSelectedFormat('pvc')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFormat === 'pvc'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>PVC Card Layout</span>
            </button>

            <button
              onClick={() => setSelectedFormat('sticker')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFormat === 'sticker'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Sticker Layout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          DEFAULT PUBLIC VIEW: WORLD-CLASS DIGITAL REGISTRY RECORD
          ======================================================== */}
      {selectedFormat === 'digital' && (
        <div className="report-print-target rounded-2xl bg-gradient-to-b from-[#0B132B] via-[#091024] to-[#060B18] border-2 border-amber-500/40 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          
          {/* Top Verification Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src="/brand/wtc_crest.png"
                alt="WTC Gem Lab Crest"
                className="h-14 w-auto object-contain drop-shadow-[0_2px_10px_rgba(217,175,90,0.4)] shrink-0"
              />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm font-cinzel font-bold tracking-[0.25em] text-amber-400 uppercase">
                    WTC
                  </span>
                  <span className="text-xl sm:text-2xl font-cinzel font-black tracking-wider text-white">
                    GEM LAB
                  </span>
                </div>
                <div className="text-[9px] font-mono tracking-[0.25em] text-slate-400 uppercase">
                  OFFICIAL DIGITAL VERIFICATION RECORD
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AUTHENTICATED IN REGISTRY</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Security Hash: <strong className="text-amber-300">{cert.securityHash}</strong>
              </span>
            </div>
          </div>

          {/* Main Digital Record Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Gemological Data Table */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                  Laboratory Report Number
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    {cert.reportNumber}
                  </h2>
                  {getTreatmentBadge()}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 text-xs sm:text-sm font-sans">
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Date of Issue</span>
                  <span className="col-span-7 font-mono text-white font-semibold">{cert.issueDate}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Species</span>
                  <span className="col-span-7 text-white font-bold">{cert.species}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5 bg-amber-500/5">
                  <span className="col-span-5 text-amber-300 font-medium">Variety</span>
                  <span className="col-span-7 text-amber-300 font-bold text-base">{cert.variety}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Carat Weight</span>
                  <span className="col-span-7 font-mono text-white font-bold">{cert.weight}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Shape &amp; Cut</span>
                  <span className="col-span-7 text-slate-200">{cert.shapeAndCut}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Measurements</span>
                  <span className="col-span-7 font-mono text-slate-200">{cert.dimensions}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Color</span>
                  <span className="col-span-7 text-white font-semibold">{cert.color}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5">
                  <span className="col-span-5 text-slate-400 font-medium">Transparency</span>
                  <span className="col-span-7 text-slate-200">{cert.transparency}</span>
                </div>
                <div className="grid grid-cols-12 p-3.5 bg-emerald-500/5">
                  <span className="col-span-5 text-slate-300 font-medium">Treatment Conclusion</span>
                  <span className="col-span-7 font-bold text-emerald-400">{cert.treatment}</span>
                </div>
              </div>

              {/* Optical & Physical Constants */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Diagnostic Optical &amp; Microscopic Notes
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {cert.microscopicObservations}
                </p>
                {(cert.refractiveIndex || cert.specificGravity) && (
                  <div className="pt-2 flex flex-wrap gap-4 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
                    {cert.refractiveIndex && <span>R.I.: <strong className="text-white">{cert.refractiveIndex}</strong></span>}
                    {cert.specificGravity && <span>S.G.: <strong className="text-white">{cert.specificGravity}</strong></span>}
                    {cert.fluorescence && <span>UV: <strong className="text-white">{cert.fluorescence}</strong></span>}
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Calibrated Specimen Image & QR Verification */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col items-center text-center">
                <div className="w-56 h-56 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 relative">
                  <img
                    src={cert.imageUrl}
                    alt={cert.variety}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 inset-x-2 bg-slate-950/85 backdrop-blur-sm py-1 px-2 rounded text-[9px] font-mono text-amber-300 uppercase tracking-widest border border-amber-500/20">
                    Registered Specimen Photo
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-3">
                  Calibrated Laboratory Macro Photograph
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                {qrCodeUrl && (
                  <div className="w-20 h-20 rounded-xl bg-white p-1.5 shrink-0">
                    <img src={qrCodeUrl} alt="Verification QR" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="space-y-1 text-left">
                  <div className="text-xs font-cinzel font-bold text-white">
                    Anti-Counterfeiting Notice
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Confirm that the physical report accompanying this gemstone bears WTC Gem Lab&apos;s embossed seal and matches the exact weight and dimensions recorded above.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>WTC Gem Lab &bull; World Trade Center, No 26, 5th Floor, Colombo 01</span>
            <span className="text-amber-400">{LAB_CONTACT_INFO.website}</span>
          </div>

        </div>
      )}

      {/* ========================================================
          FORMAT 1: FULL A4 GEMOLOGICAL REPORT (Matching User A4 Report Graphic)
          ======================================================== */}
      {selectedFormat === 'a4' && (
        <div className="report-print-target certificate-card certificate-pattern security-border rounded-xl p-6 sm:p-10 text-slate-900 shadow-2xl relative overflow-hidden bg-white">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
            <span className="text-[120px] font-cinzel font-black tracking-widest text-slate-900 rotate-[-25deg]">
              WTC GEM LAB
            </span>
          </div>

          {/* Top Navy/Gold Curved Header Band */}
          <div className="border-b-2 border-amber-600/40 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Left: Official 3D Crest & Typography */}
              <div className="flex items-center gap-4">
                <img
                  src="/brand/wtc_crest.png"
                  alt="WTC Gem Lab Crest"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-md shrink-0"
                />
                <div>
                  <h1 className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-cinzel font-bold tracking-[0.25em] text-amber-800 uppercase">
                      WTC
                    </span>
                    <span className="text-2xl sm:text-3xl font-cinzel font-black tracking-wider text-[#0B132B]">
                      GEM LAB
                    </span>
                  </h1>
                  <p className="text-[11px] font-mono tracking-widest text-slate-700 uppercase font-semibold">
                    GEMOLOGICAL LABORATORY
                  </p>
                  <p className="text-[9.5px] tracking-wider text-amber-700 font-mono font-bold">
                    ANALYSE &bull; IDENTIFY &bull; ASSURE
                  </p>
                </div>
              </div>

              {/* Right: Address & Report Tag */}
              <div className="sm:text-right font-mono text-xs bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
                <div className="text-[10px] text-slate-500 font-sans">
                  World Trade Center &bull; No 26, 5th Floor, Colombo 01
                </div>
                <div className="text-xl font-bold text-amber-700 tracking-wider font-mono mt-0.5">
                  {cert.reportNumber}
                </div>
                <div className="text-[11px] text-slate-600">
                  Date of Issue: <span className="font-semibold text-slate-900">{cert.issueDate}</span>
                </div>
                <div className="mt-1">{getTreatmentBadge()}</div>
              </div>

            </div>

            {/* Blue Banner: GEMSTONE IDENTIFICATION REPORT */}
            <div className="mt-4 py-2 px-4 rounded-lg bg-gradient-to-r from-[#0B132B] via-[#0E1B3D] to-[#0B132B] text-center text-white border border-amber-500/40 shadow-sm">
              <span className="font-cinzel text-sm sm:text-base font-bold tracking-widest uppercase text-amber-300">
                GEMSTONE IDENTIFICATION REPORT
              </span>
            </div>
          </div>

          {/* Body Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
            {/* Left: Gem Photograph & QR Verification */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[280px] aspect-square rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-2 shadow-xl border-2 border-amber-600/40 relative overflow-hidden flex items-center justify-center">
                <img
                  src={cert.imageUrl}
                  alt={cert.variety}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm text-amber-300 px-2 py-1 rounded text-[9.5px] font-mono text-center border border-amber-500/20">
                  Laboratory Photographic Record
                </div>
              </div>

              <div className="mt-5 w-full max-w-[280px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
                {qrCodeUrl ? (
                  <div className="p-2 bg-white rounded-lg border border-slate-300 shadow-sm">
                    <img src={qrCodeUrl} alt="Verify QR Code" className="w-26 h-26 mx-auto" />
                  </div>
                ) : (
                  <div className="w-26 h-26 bg-slate-200 animate-pulse rounded-lg" />
                )}
                <p className="text-[11px] font-bold text-slate-800 mt-2 font-mono">
                  VERIFY REPORT
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Scan to confirm official registry record at www.wtcgemlab.lk
                </p>
                <div className="mt-1 text-[8.5px] font-mono text-slate-400 break-all">
                  Hash: {cert.securityHash}
                </div>
              </div>
            </div>

            {/* Right: Technical Identification Table */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Section Header: GEMSTONE IDENTIFICATION */}
                <div className="border-b border-amber-500/30 pb-2">
                  <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold">
                    GEMSTONE IDENTIFICATION
                  </span>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#0B132B]">
                    {cert.variety}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Species / Variety: <span className="font-semibold text-slate-900">{cert.species}</span>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-slate-50/90 rounded-lg p-3 sm:p-4 border border-slate-200 text-xs space-y-2.5 font-sans">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Weight:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{cert.weight}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Shape and Cutting Style:</span>
                    <span className="font-semibold text-slate-800">{cert.shapeAndCut}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Measurements:</span>
                    <span className="font-semibold text-slate-800 font-mono">{cert.dimensions}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Colour:</span>
                    <span className="font-semibold text-slate-900">{cert.color}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Transparency:</span>
                    <span className="font-semibold text-slate-800">{cert.transparency}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-medium font-mono">Treatment:</span>
                    <span className="font-bold text-amber-900">{cert.treatment}</span>
                  </div>
                  {cert.originOpinion && (
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-medium font-mono">Origin Determination:</span>
                      <span className="font-semibold text-slate-900 font-cinzel">{cert.originOpinion}</span>
                    </div>
                  )}
                  {cert.refractiveIndex && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-slate-500 font-medium font-mono">Refractive Index:</span>
                      <span className="font-mono text-slate-800">{cert.refractiveIndex}</span>
                    </div>
                  )}
                </div>

                {/* Laboratory Observations Box */}
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-300 text-xs">
                  <div className="font-bold text-amber-900 uppercase font-mono tracking-wide text-[11px] mb-1">
                    LABORATORY OBSERVATIONS
                  </div>
                  <p className="text-slate-800 leading-relaxed text-[11px]">
                    {cert.microscopicObservations}
                  </p>
                  {cert.treatmentDetails && (
                    <p className="text-slate-600 mt-1 text-[10.5px]">
                      {cert.treatmentDetails}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Footer & Official Embossed Seal */}
          <div className="mt-8 pt-6 border-t-2 border-amber-600/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            
            {/* Signature Area */}
            <div className="space-y-1">
              <div className="w-40 border-b border-slate-400 pb-1">
                <span className="font-serif italic text-lg text-slate-800 select-none">
                  WTC Gem Lab
                </span>
              </div>
              <div className="font-bold text-slate-900 font-cinzel text-[11px]">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500">Senior Gemologist &bull; Directorate</div>
            </div>

            {/* Center Legal */}
            <div className="text-center font-sans text-[10px] text-slate-500 max-w-sm">
              <div>This report is issued for identification purposes only and does not constitute a valuation.</div>
              <div className="font-mono font-semibold text-slate-700 mt-0.5">www.wtcgemlab.lk</div>
            </div>

            {/* Official Gold Seal Graphic */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600 p-1 bg-gradient-to-br from-amber-100 to-amber-200 shadow-md flex items-center justify-center text-center">
                <div className="w-full h-full rounded-full border border-dashed border-amber-700 flex flex-col items-center justify-center text-[7.5px] font-cinzel font-bold text-amber-900 leading-tight">
                  <span>AUTHENTIC</span>
                  <Sparkles className="w-3 h-3 text-amber-700 my-0.5" />
                  <span>WTC GEM LAB</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          FORMAT 2: PVC SMART CARD REPORT (Matching User Card Graphic)
          ======================================================== */}
      {selectedFormat === 'pvc' && (
        <div className="space-y-6">
          <div className="no-print flex items-center justify-center gap-2 text-xs font-mono">
            <button
              onClick={() => setPvcSide('both')}
              className={`px-3 py-1 rounded-md border transition ${
                pvcSide === 'both' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Side-by-Side (Both Sides)
            </button>
            <button
              onClick={() => setPvcSide('front')}
              className={`px-3 py-1 rounded-md border transition ${
                pvcSide === 'front' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Front Only
            </button>
            <button
              onClick={() => setPvcSide('back')}
              className={`px-3 py-1 rounded-md border transition ${
                pvcSide === 'back' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Back Only
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            
            {/* PVC FRONT (Exact match with user's PVC Card image) */}
            {(pvcSide === 'front' || pvcSide === 'both') && (
              <div className="report-print-target w-full max-w-[430px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0E1A38] to-[#070D1B] text-white p-5 shadow-2xl pvc-border relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 pvc-pattern opacity-40 pointer-events-none" />

                {/* Top Section */}
                <div className="flex items-center justify-between relative z-10 border-b border-amber-500/30 pb-2">
                  <div className="flex items-center gap-2.5">
                    <img src="/brand/wtc_crest.png" alt="WTC Crest" className="h-7 w-auto object-contain drop-shadow-sm shrink-0" />
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-cinzel text-[9px] font-bold tracking-wider text-amber-300">WTC</span>
                        <span className="font-cinzel text-xs font-black tracking-wider text-white">GEM LAB</span>
                      </div>
                      <div className="text-[7.5px] font-mono tracking-widest text-amber-400 uppercase">GEMOLOGICAL LABORATORY</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-xs text-amber-300 font-semibold">Gem Identification</div>
                    <div className="font-serif italic text-sm text-amber-200 font-bold leading-none">Certificate</div>
                  </div>
                </div>

                {/* Middle Content */}
                <div className="grid grid-cols-12 gap-3 items-center my-2 relative z-10">
                  <div className="col-span-7 space-y-1 text-[10.5px] font-sans">
                    <div className="grid grid-cols-12 gap-1 text-[10px]">
                      <span className="col-span-5 text-slate-400 font-mono">Report No.</span>
                      <span className="col-span-7 font-bold text-amber-400 font-mono">: {cert.reportNumber}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 text-[10px]">
                      <span className="col-span-5 text-slate-400 font-mono">Gemstone</span>
                      <span className="col-span-7 font-semibold text-white">: {cert.variety}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 text-[10px]">
                      <span className="col-span-5 text-slate-400 font-mono">Weight</span>
                      <span className="col-span-7 font-bold text-white font-mono">: {cert.weight}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 text-[10px]">
                      <span className="col-span-5 text-slate-400 font-mono">Shape</span>
                      <span className="col-span-7 text-slate-200">: {cert.shapeAndCut}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1 text-[10px]">
                      <span className="col-span-5 text-slate-400 font-mono">Measurements</span>
                      <span className="col-span-7 font-mono text-slate-200">: {cert.dimensions}</span>
                    </div>
                  </div>

                  <div className="col-span-5 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-xl bg-slate-950/80 border border-amber-500/40 p-1 shadow-inner relative overflow-hidden">
                      <img src={cert.imageUrl} alt={cert.variety} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Bottom Bar with QR and Slogan */}
                <div className="flex items-end justify-between border-t border-amber-500/20 pt-2 text-[8px] relative z-10">
                  <div>
                    <div className="font-serif italic text-amber-300 text-[9px]">International Standards.</div>
                    <div className="font-serif italic text-amber-400 font-bold text-[9px]">Trusted Certainty.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[7.5px] text-slate-400">Scan to Verify</span>
                    {qrCodeUrl ? (
                      <div className="p-0.5 bg-white rounded border border-amber-500/40 shadow">
                        <img src={qrCodeUrl} alt="Card QR" className="w-8 h-8" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-800 rounded animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PVC BACK */}
            {(pvcSide === 'back' || pvcSide === 'both') && (
              <div className="report-print-target w-full max-w-[430px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0E1A38] to-[#070D1B] text-white p-5 shadow-2xl pvc-border relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 pvc-pattern opacity-40 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 relative z-10">
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Diagnostic Lab Data &bull; Verification
                  </div>
                  <div className="text-[8.5px] font-mono text-slate-300">Colombo 01 &bull; Sri Lanka</div>
                </div>

                <div className="grid grid-cols-12 gap-3 items-center my-1 relative z-10">
                  <div className="col-span-8 space-y-1 text-[9.5px] font-mono">
                    <div className="grid grid-cols-2 gap-1 pb-1 border-b border-slate-800">
                      <span className="text-slate-400">Species:</span>
                      <span className="text-white text-[9px] truncate">{cert.species}</span>
                    </div>
                    {cert.refractiveIndex && (
                      <div className="grid grid-cols-2 gap-1 pb-1 border-b border-slate-800">
                        <span className="text-slate-400">Refractive Index:</span>
                        <span className="text-slate-200">{cert.refractiveIndex}</span>
                      </div>
                    )}
                    {cert.specificGravity && (
                      <div className="grid grid-cols-2 gap-1 pb-1 border-b border-slate-800">
                        <span className="text-slate-400">Specific Gravity:</span>
                        <span className="text-slate-200">{cert.specificGravity}</span>
                      </div>
                    )}
                    <div className="pt-0.5 text-[8.5px] text-slate-300 font-sans leading-tight">
                      Conclusion: <span className="text-amber-300 font-semibold">{cert.treatment}</span>
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col items-center justify-center text-center">
                    {qrCodeUrl ? (
                      <div className="p-1 bg-white rounded-md shadow">
                        <img src={qrCodeUrl} alt="Card QR" className="w-16 h-16" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-slate-800 rounded animate-pulse" />
                    )}
                    <span className="text-[7.5px] font-mono text-amber-400 mt-1">REGISTRY VERIFY</span>
                  </div>
                </div>

                <div className="border-t border-amber-500/20 pt-1.5 flex items-center justify-between text-[7.5px] font-mono text-slate-400 relative z-10">
                  <span>World Trade Center, No 26, 5th Floor, Colombo 01</span>
                  <span>www.wtcgemlab.lk</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          FORMAT 3: GEM IDENTIFICATION STICKER (50mm x 30mm)
          ======================================================== */}
      {selectedFormat === 'sticker' && (
        <div className="flex flex-col items-center justify-center">
          <div className="no-print text-center text-xs text-slate-400 font-mono mb-4">
            Size: 50 mm &times; 30 mm adhesive label with holographic rainbow security background
          </div>

          <div className="report-print-target w-full max-w-[340px] rounded-xl bg-gradient-to-r from-slate-100 via-amber-50/60 to-slate-100 text-slate-900 p-3.5 shadow-2xl border-2 border-amber-400/80 relative overflow-hidden">
            
            {/* Holographic shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/20 to-blue-200/20 pointer-events-none" />

            <div className="grid grid-cols-12 gap-2 items-center relative z-10">
              {/* Left Logo */}
              <div className="col-span-3 flex flex-col items-center justify-center border-r border-slate-300 pr-2">
                <img src="/brand/wtc_crest.png" alt="Logo" className="h-6 w-auto object-contain drop-shadow-sm mb-0.5" />
                <div className="font-cinzel text-[7px] font-bold text-amber-900 tracking-wider">WTC</div>
                <div className="text-[7.5px] font-cinzel font-black text-[#0B132B]">GEM LAB</div>
              </div>

              {/* Middle Details */}
              <div className="col-span-6 space-y-0.5">
                <div className="font-mono text-[9px] font-bold text-amber-900">
                  {cert.reportNumber}
                </div>
                <div className="font-bold text-slate-900 font-cinzel text-[10px] leading-tight">
                  {cert.variety}
                </div>
                <div className="font-bold text-slate-900 font-mono text-[10px]">
                  {cert.weight}
                </div>
              </div>

              {/* Right Mini QR */}
              <div className="col-span-3 flex flex-col items-center justify-center text-center">
                {qrCodeUrl ? (
                  <div className="p-0.5 bg-white border border-slate-300 rounded shadow-xs">
                    <img src={qrCodeUrl} alt="Sticker QR" className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-200 rounded animate-pulse" />
                )}
                <span className="text-[6px] font-mono text-slate-600 mt-0.5">Verify</span>
              </div>
            </div>

            <div className="mt-2 pt-1 border-t border-slate-300 flex items-center justify-between text-[6.5px] font-mono text-slate-500 relative z-10">
              <span>Colombo 01, Sri Lanka</span>
              <span>www.wtcgemlab.lk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
