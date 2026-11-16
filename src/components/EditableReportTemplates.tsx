'use client';

import React, { useEffect, useState } from 'react';
import { toPng } from 'html-to-image';
import { GemCertificate, LAB_CONTACT_INFO } from '@/lib/gemData';
import { generateQrDataUrl } from '@/lib/certificateStore';
import {
  Printer,
  Download,
  Tag,
  CreditCard,
  FileText,
  Edit3,
  Microscope,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export type ReportTemplateFormat = 'sticker' | 'pvc' | 'a4';

interface EditableReportTemplatesProps {
  certificate: GemCertificate;
  onChange: (updated: Partial<GemCertificate>) => void;
  activeFormat: ReportTemplateFormat;
  onFormatChange: (fmt: ReportTemplateFormat) => void;
  onSaveAndIssue?: () => void;
  onOpenWhatsApp?: () => void;
}

interface InlineEditProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

function InlineEditable({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...'
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  useEffect(() => {
    setTemp(value);
  }, [value]);

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          rows={2}
          value={temp}
          onChange={(e) => {
            setTemp(e.target.value);
            onChange(e.target.value);
          }}
          onBlur={() => setEditing(false)}
          className={`w-full px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-inherit focus:outline-none ${className}`}
        />
      );
    }
    return (
      <input
        type="text"
        autoFocus
        value={temp}
        onChange={(e) => {
          setTemp(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setEditing(false);
        }}
        className={`w-full px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-inherit focus:outline-none ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit field directly on template"
      className={`cursor-pointer rounded px-1 -mx-1 hover:ring-1 hover:ring-amber-500/60 hover:bg-amber-500/10 transition inline-block min-w-[24px] ${className}`}
    >
      {value || <span className="opacity-50 italic">{placeholder}</span>}
    </span>
  );
}

function getDisplayStoneSrc(url: string): string {
  if (url.includes('sample_sapphire') && !url.includes('?')) {
    return `${url}?v=5`;
  }
  return url;
}

export default function EditableReportTemplates({
  certificate,
  onChange,
  activeFormat,
  onFormatChange,
  onSaveAndIssue,
  onOpenWhatsApp
}: EditableReportTemplatesProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showEditHints, setShowEditHints] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [pvcSide, setPvcSide] = useState<'front' | 'back'>('front');

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://wtcgemlab.lk';
    const verifyUrl = `${origin}/verify?id=${encodeURIComponent(certificate.reportNumber)}`;
    generateQrDataUrl(verifyUrl).then(setQrDataUrl);
  }, [certificate.reportNumber]);

  const handlePrintOrPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPng = async () => {
    if (typeof document === 'undefined' || isDownloading) return;
    const target = document.querySelector('.report-print-target') as HTMLElement | null;
    if (!target) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(target, {
        pixelRatio: 3,
        cacheBust: true
      });
      const link = document.createElement('a');
      const safeId = (certificate.reportNumber || 'WTC-Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      const suffix = activeFormat === 'pvc' ? `pvc-${pvcSide}` : activeFormat;
      link.download = `${safeId}-${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export report PNG:', err);
      alert('Could not export PNG. Please try Print / Save PDF instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const badgeText =
    certificate.stoneType === 'Natural'
      ? 'NATURAL • UNHEATED'
      : certificate.stoneType === 'Heated'
      ? 'NATURAL • HEATED'
      : certificate.stoneType === 'Synthetic'
      ? 'LABORATORY SYNTHETIC'
      : 'TREATED / ENHANCED';

  return (
    <div className="w-full space-y-5">
      {/* Studio Toolbar (Hidden when printing) */}
      <div className="no-print bg-[#0A1326] border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Format Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFormatChange('sticker')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition ${
              activeFormat === 'sticker'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>1. Simple Verbal Report (Sticker)</span>
          </button>

          <button
            type="button"
            onClick={() => onFormatChange('pvc')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition ${
              activeFormat === 'pvc'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. PVC Smart Card Report</span>
          </button>

          <button
            type="button"
            onClick={() => onFormatChange('a4')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition ${
              activeFormat === 'a4'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. A4 Full Certificate</span>
          </button>
        </div>

        {/* Actions: Toggle Microscope Inset, Save, PDF/Print, WhatsApp */}
        <div className="flex flex-wrap items-center gap-2">
          {certificate.microscopeImageUrl && (
            <button
              type="button"
              onClick={() =>
                onChange({ showMicroscopeOnReport: !certificate.showMicroscopeOnReport })
              }
              className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition ${
                certificate.showMicroscopeOnReport
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Show or hide Microscope Photomicrograph inset on report"
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>
                {certificate.showMicroscopeOnReport ? 'Microscope Inset: ON' : 'Microscope Inset: OFF'}
              </span>
            </button>
          )}

          {onSaveAndIssue && (
            <button
              type="button"
              onClick={onSaveAndIssue}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save to Registry</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintOrPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Exporting...' : 'Download PNG'}</span>
          </button>

          {onOpenWhatsApp && (
            <button
              type="button"
              onClick={onOpenWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>WhatsApp (Wassapi)</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Editing Tip Banner */}
      {showEditHints && (
        <div className="no-print flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Live Interactive Template:</strong> Click directly on any text field inside the report below to edit it in place before printing or exporting to PDF.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowEditHints(false)}
            className="text-[10px] underline opacity-80 hover:opacity-100 ml-3"
          >
            Hide Tip
          </button>
        </div>
      )}

      {/* =====================================================================
          FORMAT 1: SIMPLE VERBAL REPORT / PARCEL BOX STICKER (50mm x 30mm)
         ===================================================================== */}
      {activeFormat === 'sticker' && (
        <div className="flex justify-center py-4">
          <div
            style={{ maxWidth: '520px' }}
            className="report-print-target w-full max-w-[520px] bg-[#0B132B] text-white rounded-2xl sticker-border p-5 shadow-2xl relative overflow-hidden"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-2.5 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand/wtc_crest.png"
                  alt="WTC Gem Lab Crest"
                  className="h-9 w-auto object-contain"
                />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-cinzel text-[10px] font-bold tracking-[0.2em] text-amber-400">
                      WTC
                    </span>
                    <span className="font-cinzel text-base font-black tracking-wider text-white">
                      GEM LAB
                    </span>
                  </div>
                  <div className="text-[7.5px] font-mono tracking-[0.2em] text-amber-300/90 uppercase">
                    SIMPLE VERBAL IDENTIFICATION REPORT
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[9px] text-slate-400 uppercase">Report No</div>
                <div className="text-xs font-bold text-amber-400">
                  <InlineEditable
                    value={certificate.reportNumber}
                    onChange={(val) => onChange({ reportNumber: val })}
                  />
                </div>
              </div>
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Left Specs (8 cols) */}
              <div className="col-span-8 space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    Identification / Variety
                  </span>
                  <div className="font-cinzel font-bold text-sm text-amber-300">
                    <InlineEditable
                      value={certificate.variety}
                      onChange={(val) => onChange({ variety: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-[8.5px] font-mono text-slate-400 block uppercase">
                      Weight / Shape
                    </span>
                    <span className="font-mono font-bold text-[11px] text-white">
                      <InlineEditable
                        value={certificate.weight}
                        onChange={(val) => onChange({ weight: val })}
                      />
                    </span>
                    <span className="text-[10px] text-slate-300 block truncate">
                      <InlineEditable
                        value={certificate.shapeAndCut}
                        onChange={(val) => onChange({ shapeAndCut: val })}
                      />
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    <span className="text-[8.5px] font-mono text-slate-400 block uppercase">
                      Color / Constants
                    </span>
                    <span className="font-semibold text-[11px] text-white block truncate">
                      <InlineEditable
                        value={certificate.color}
                        onChange={(val) => onChange({ color: val })}
                      />
                    </span>
                    <span className="font-mono text-[9.5px] text-amber-300 block">
                      R.I:{' '}
                      <InlineEditable
                        value={certificate.refractiveIndex || '1.762-1.770'}
                        onChange={(val) => onChange({ refractiveIndex: val })}
                      />{' '}
                      | S.G:{' '}
                      <InlineEditable
                        value={certificate.specificGravity || '4.00'}
                        onChange={(val) => onChange({ specificGravity: val })}
                      />
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">
                    Treatment / Comment
                  </span>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    <InlineEditable
                      value={certificate.treatment}
                      onChange={(val) => onChange({ treatment: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Right Stone Thumbnail & QR (4 cols) */}
              <div className="col-span-4 flex flex-col items-center justify-center gap-2 border-l border-slate-800 pl-3">
                {certificate.imageUrl.includes('sample_sapphire') ? (
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src={getDisplayStoneSrc(certificate.imageUrl)}
                      alt={certificate.variety}
                      className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#070D1B] border border-amber-500/40 shadow-inner overflow-hidden">
                    <img
                      src={getDisplayStoneSrc(certificate.imageUrl)}
                      alt={certificate.variety}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                {qrDataUrl && (
                  <div className="bg-white p-1 rounded shadow">
                    <img src={qrDataUrl} alt="QR" className="w-12 h-12" />
                  </div>
                )}
                <span className="text-[8px] font-mono text-slate-400 text-center">
                  <InlineEditable
                    value={certificate.issueDate}
                    onChange={(val) => onChange({ issueDate: val })}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FORMAT 2: PVC SMART CARD REPORT (ORIGINAL WTC CR80 DESIGN - FRONT/BACK)
         ===================================================================== */}
      {activeFormat === 'pvc' && (
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Front / Back Side Toggle (Hidden when printing/exporting) */}
          <div className="no-print inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-amber-500/30 shadow-md">
            <button
              type="button"
              onClick={() => setPvcSide('front')}
              className={`px-4 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition ${
                pvcSide === 'front'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Front Side (Stone &amp; Specs)
            </button>
            <button
              type="button"
              onClick={() => setPvcSide('back')}
              className={`px-4 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition ${
                pvcSide === 'back'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Back Side (Logo &amp; Contact)
            </button>
          </div>

          {pvcSide === 'front' ? (
            <div
              data-report-format="pvc"
              style={{
                maxWidth: '680px',
                background:
                  'radial-gradient(circle at 75% 45%, #16397a 0%, #091d4a 45%, #040d26 100%)'
              }}
              className="report-print-target w-full max-w-[680px] sm:aspect-[856/540] rounded-2xl border-2 border-[#E5C158] text-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] relative overflow-hidden flex flex-col justify-between"
            >
            {/* Original Gold Sweeping Ribbons (Top-Left & Bottom-Right SVG) */}
            <svg
              viewBox="0 0 680 430"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pvcGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F9E596" />
                  <stop offset="45%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#9A7222" />
                </linearGradient>
              </defs>
              {/* Top-left gold corner arc */}
              <path
                d="M 0,95 Q 15,20 115,0 L 80,0 Q 12,18 0,68 Z"
                fill="url(#pvcGoldGrad)"
                opacity="0.92"
              />
              {/* Bottom-right sweeping gold ribbons */}
              <path
                d="M 220,430 Q 470,380 680,145 L 680,175 Q 490,395 275,430 Z"
                fill="url(#pvcGoldGrad)"
                opacity="0.95"
              />
              <path
                d="M 425,430 Q 570,360 680,220 L 680,235 Q 580,368 455,430 Z"
                fill="url(#pvcGoldGrad)"
                opacity="0.75"
              />
            </svg>

            <div className="relative z-10">
              {/* Top Header Row: Left Logo + Vertical Gold Line + Right Italic Title */}
              <div className="flex items-center justify-between gap-4 pb-4 mb-3 border-b border-amber-400/20">
                <div className="flex items-center gap-3">
                  <img
                    src="/brand/wtc_crest.png?v=3"
                    alt="WTC Gem Lab Crest"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <div className="text-[10px] font-cinzel font-bold tracking-[0.28em] text-[#F4D06F] text-center">
                      WTC
                    </div>
                    <div className="font-cinzel text-xl font-black tracking-wider text-[#F4D06F] leading-none">
                      GEM LAB
                    </div>
                    <div className="text-[7px] font-mono tracking-[0.22em] text-amber-200/90 uppercase mt-1">
                      GEMOLOGICAL LABORATORY
                    </div>
                  </div>
                </div>

                <div className="h-12 w-[1.5px] bg-gradient-to-b from-transparent via-[#E5C158] to-transparent hidden sm:block" />

                <div className="text-right pr-1">
                  <div className="font-playfair italic font-bold text-xl sm:text-2xl text-[#F4D06F] leading-tight drop-shadow">
                    Gem Identification
                    <br />
                    Certificate
                  </div>
                </div>
              </div>

              {/* Card Body: Left Gold-Labeled Specs + Right Stone Photo & QR */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Left Specs (7 cols) */}
                <div className="sm:col-span-7 space-y-1.5 text-xs sm:text-[13px] font-playfair">
                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Report No.</span>
                    <span className="col-span-7 text-white font-mono font-bold text-xs">
                      :{' '}
                      <InlineEditable
                        value={certificate.reportNumber}
                        onChange={(val) => onChange({ reportNumber: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Gemstone</span>
                    <span className="col-span-7 text-white font-bold">
                      :{' '}
                      <InlineEditable
                        value={certificate.variety}
                        onChange={(val) => onChange({ variety: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Weight</span>
                    <span className="col-span-7 text-white font-semibold">
                      :{' '}
                      <InlineEditable
                        value={certificate.weight}
                        onChange={(val) => onChange({ weight: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Shape</span>
                    <span className="col-span-7 text-white">
                      :{' '}
                      <InlineEditable
                        value={certificate.shapeAndCut}
                        onChange={(val) => onChange({ shapeAndCut: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Measurements</span>
                    <span className="col-span-7 text-white font-mono text-[11.5px]">
                      :{' '}
                      <InlineEditable
                        value={certificate.dimensions}
                        onChange={(val) => onChange({ dimensions: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-baseline">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">R.I. / S.G.</span>
                    <span className="col-span-7 text-amber-100 font-mono text-[11px]">
                      :{' '}
                      <InlineEditable
                        value={certificate.refractiveIndex || '1.762–1.770'}
                        onChange={(val) => onChange({ refractiveIndex: val })}
                      />{' '}
                      |{' '}
                      <InlineEditable
                        value={certificate.specificGravity || '4.00'}
                        onChange={(val) => onChange({ specificGravity: val })}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-start">
                    <span className="col-span-5 text-[#F4D06F] font-semibold">Treatment</span>
                    <span className="col-span-7 text-emerald-300 font-semibold text-[11px] leading-snug flex items-start gap-1">
                      <span className="shrink-0">:</span>
                      <InlineEditable
                        value={certificate.treatment}
                        onChange={(val) => onChange({ treatment: val })}
                      />
                    </span>
                  </div>

                  {/* Original Bottom-Left Italic Tagline */}
                  <div className="pt-4 font-playfair italic text-sm sm:text-base text-[#F4D06F] leading-snug">
                    International Standards.
                    <br />
                    Trusted Certainty.
                  </div>
                </div>

                {/* Right Column: Clean Stone Photo + Bottom-Right QR Code (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-end justify-between gap-4">
                  {certificate.imageUrl.includes('sample_sapphire') ? (
                    <div
                      style={{ width: '156px', height: '124px' }}
                      className="relative self-center sm:self-end flex items-center justify-center"
                    >
                      <img
                        src={getDisplayStoneSrc(certificate.imageUrl)}
                        alt={certificate.variety}
                        className="w-full h-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)]"
                      />
                      {certificate.showMicroscopeOnReport && certificate.microscopeImageUrl && (
                        <div className="absolute bottom-1 right-1 w-10 h-10 rounded-md border border-[#E5C158]/80 overflow-hidden shadow-lg bg-[#070D1B]">
                          <img
                            src={certificate.microscopeImageUrl}
                            alt="Inclusion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{ width: '156px', height: '124px' }}
                      className="rounded-xl bg-[#070D1B] border border-[#E5C158]/75 shadow-[0_12px_28px_rgba(0,0,0,0.6)] overflow-hidden relative self-center sm:self-end"
                    >
                      <img
                        src={certificate.imageUrl}
                        alt={certificate.variety}
                        className="w-full h-full object-cover"
                      />
                      {certificate.showMicroscopeOnReport && certificate.microscopeImageUrl && (
                        <div className="absolute bottom-1 right-1 w-10 h-10 rounded-md border border-[#E5C158]/80 overflow-hidden shadow-lg bg-[#070D1B]">
                          <img
                            src={certificate.microscopeImageUrl}
                            alt="Inclusion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {qrDataUrl && (
                    <div className="bg-white p-1.5 rounded-md shadow-xl border border-amber-300/60 self-center sm:self-end">
                      <img src={qrDataUrl} alt="Verify QR" className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div
              data-report-format="pvc"
              style={{
                maxWidth: '680px',
                background:
                  'radial-gradient(circle at 25% 45%, #16397a 0%, #091d4a 45%, #040d26 100%)'
              }}
              className="report-print-target w-full max-w-[680px] sm:aspect-[856/540] rounded-2xl border-2 border-[#E5C158] text-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] relative overflow-hidden flex flex-col justify-between"
            >
              {/* Sweeping Gold Ribbons (Mirrored Back Accent) */}
              <svg
                viewBox="0 0 680 430"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="pvcBackGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9A6E1C" />
                    <stop offset="45%" stopColor="#F5DC86" />
                    <stop offset="100%" stopColor="#B88625" />
                  </linearGradient>
                </defs>
                {/* Top-left subtle gold corner arc (stays clear of centered text) */}
                <path
                  d="M 0,95 Q 18,22 125,0 L 85,0 Q 15,18 0,68 Z"
                  fill="url(#pvcBackGoldGrad)"
                  opacity="0.88"
                />
                {/* Bottom-right low sweeping gold corner ribbons (stays below text area) */}
                <path
                  d="M 380,430 Q 535,402 680,305 L 680,336 Q 555,418 445,430 Z"
                  fill="url(#pvcBackGoldGrad)"
                  opacity="0.82"
                />
                <path
                  d="M 485,430 Q 595,405 680,352 L 680,368 Q 610,415 530,430 Z"
                  fill="url(#pvcBackGoldGrad)"
                  opacity="0.52"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-between flex-1 text-center py-2">
                {/* Centered WTC Brand Lockup */}
                <div className="flex flex-col items-center">
                  <img
                    src="/brand/wtc_crest.png?v=3"
                    alt="WTC Gem Lab Crest"
                    className="h-16 w-auto object-contain mb-1.5 drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
                  />
                  <div className="font-cinzel text-xs font-bold tracking-[0.34em] text-[#E5C158] leading-none">
                    WTC
                  </div>
                  <div className="font-cinzel text-3xl font-black tracking-[0.12em] text-[#F5DC86] leading-tight mt-0.5">
                    GEM LAB
                  </div>
                  <div className="text-[9px] font-mono tracking-[0.28em] text-slate-200 uppercase mt-0.5">
                    GEMOLOGICAL LABORATORY
                  </div>
                  <div className="w-56 h-[1px] bg-gradient-to-r from-transparent via-[#E5C158] to-transparent my-3" />
                  <div className="text-[10px] font-cinzel font-semibold tracking-[0.28em] text-[#F5DC86]/90 uppercase">
                    ANALYSE &bull; IDENTIFY &bull; ASSURE
                  </div>
                </div>

                {/* Clean Institutional Contact Details */}
                <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-100">
                  <div className="font-semibold text-[#F5DC86]">
                    World Trade Center, Colombo 01, Sri Lanka
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-200 font-mono text-[12px]">
                    <span>{LAB_CONTACT_INFO.phone}</span>
                    <span className="text-[#E5C158]/60">&bull;</span>
                    <span>{LAB_CONTACT_INFO.email}</span>
                  </div>
                  <div className="font-cinzel font-bold tracking-[0.16em] text-white text-xs sm:text-sm pt-0.5">
                    {LAB_CONTACT_INFO.website}
                  </div>
                </div>

                {/* Bottom Tagline */}
                <div className="w-full pt-2 border-t border-amber-400/20 text-[10px] font-playfair italic text-[#F5DC86]/90">
                  {LAB_CONTACT_INFO.tagline}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          FORMAT 3: FULL A4 GEMOLOGICAL CERTIFICATE (EXACT WTC A4 TEMPLATE)
         ===================================================================== */}
      {activeFormat === 'a4' && (
        <div className="flex justify-center py-4">
          <div
            style={{
              maxWidth: '794px',
              containerType: 'inline-size',
              backgroundImage: "url('/brand/bg_a4_clean.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            className="report-print-target w-full aspect-[210/297] bg-[#fafbfd] text-[#0b1936] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.65)] select-text"
            data-report-format="a4"
          >
            {/* 1. Report Number & Date of Issue */}
            <div
              style={{
                top: '31.74%',
                left: '4.97%',
                width: '58%',
                gap: '1.14cqw',
                fontSize: '2.05cqw'
              }}
              className="absolute flex flex-col font-semibold text-[#0b1936] z-10"
            >
              <div
                style={{ gridTemplateColumns: '40% 5.5% 54.5%' }}
                className="grid items-baseline leading-[1.2] whitespace-nowrap"
              >
                <span>Report Number</span>
                <span>:</span>
                <span className="font-bold text-[#061229]">
                  <InlineEditable
                    value={certificate.reportNumber}
                    onChange={(val) => onChange({ reportNumber: val })}
                  />
                </span>
              </div>
              <div
                style={{ gridTemplateColumns: '40% 5.5% 54.5%' }}
                className="grid items-baseline leading-[1.2] whitespace-nowrap"
              >
                <span>Date of Issue</span>
                <span>:</span>
                <span className="font-bold text-[#061229]">
                  <InlineEditable
                    value={certificate.issueDate}
                    onChange={(val) => onChange({ issueDate: val })}
                  />
                </span>
              </div>
            </div>

            {/* 2. Gemstone Photo on Right */}
            <div
              style={{
                top: '30.08%',
                left: '63.95%',
                width: '32.87%',
                height: '28.81%'
              }}
              className="absolute flex items-start justify-center z-[4]"
            >
              <img
                src={
                  certificate.imageUrl.includes('sample_sapphire')
                    ? '/brand/sapphire_a4_full.png'
                    : certificate.imageUrl
                }
                alt={certificate.variety}
                className={`w-full h-full block ${
                  certificate.imageUrl.includes('sample_sapphire')
                    ? 'object-contain'
                    : 'object-contain rounded-xl'
                }`}
              />
              {certificate.showMicroscopeOnReport && certificate.microscopeImageUrl && (
                <div className="absolute bottom-[4%] right-[4%] w-[26%] aspect-square rounded-lg border-2 border-[#C5A059] overflow-hidden shadow-md bg-slate-950 z-10">
                  <img
                    src={certificate.microscopeImageUrl}
                    alt="Inclusion"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* 3. Gemstone Identification 7 Rows */}
            <div
              style={{
                top: '44.73%',
                left: '4.83%',
                width: '59.5%',
                height: '16.5%',
                fontSize: '1.81cqw'
              }}
              className="absolute flex flex-col justify-between font-semibold text-[#0b1936] z-10"
            >
              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Species / Variety</span>
                <span>:</span>
                <span className="text-[#061229] truncate">
                  <InlineEditable
                    value={`${certificate.species} / ${certificate.variety}`}
                    onChange={(val) => onChange({ variety: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Weight</span>
                <span>:</span>
                <span className="text-[#061229]">
                  <InlineEditable
                    value={certificate.weight}
                    onChange={(val) => onChange({ weight: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Shape and Cutting Style</span>
                <span>:</span>
                <span className="text-[#061229]">
                  <InlineEditable
                    value={certificate.shapeAndCut}
                    onChange={(val) => onChange({ shapeAndCut: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Measurements</span>
                <span>:</span>
                <span className="text-[#061229]">
                  <InlineEditable
                    value={certificate.dimensions}
                    onChange={(val) => onChange({ dimensions: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Colour</span>
                <span>:</span>
                <span className="text-[#061229]">
                  <InlineEditable
                    value={certificate.color}
                    onChange={(val) => onChange({ color: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Transparency</span>
                <span>:</span>
                <span className="text-[#061229]">
                  <InlineEditable
                    value={certificate.transparency}
                    onChange={(val) => onChange({ transparency: val })}
                  />
                </span>
              </div>

              <div
                style={{ gridTemplateColumns: '39.5% 4.5% 56%' }}
                className="grid items-center leading-[1.15] whitespace-nowrap"
              >
                <span className="text-[#111e38]">Treatment</span>
                <span>:</span>
                <span className="text-[#061229] truncate">
                  <InlineEditable
                    value={certificate.treatment}
                    onChange={(val) => onChange({ treatment: val })}
                  />
                </span>
              </div>
            </div>

            {/* 4. Laboratory Observations */}
            <div
              style={{
                top: '66.8%',
                left: '4.83%',
                width: '66.5%',
                fontSize: '1.76cqw',
                fontFamily: "Georgia, 'Cormorant Garamond', serif"
              }}
              className="absolute font-semibold leading-[1.42] text-[#0b1936] whitespace-pre-line z-10"
            >
              <InlineEditable
                multiline
                value={
                  certificate.comments
                    ? `${certificate.microscopicObservations}\n${certificate.comments}`
                    : certificate.microscopicObservations
                }
                onChange={(val) => onChange({ microscopicObservations: val, comments: '' })}
              />
            </div>

            {/* 5. Signature Block */}
            <div
              style={{
                top: '72.46%',
                left: '4.14%',
                width: '32.04%'
              }}
              className="absolute flex flex-col items-center text-center z-10"
            >
              <img
                src="/brand/signature.png"
                alt="Authorized Signature"
                style={{ height: '8.57cqw', maxWidth: '86%', marginBottom: '-0.48cqw' }}
                className="object-contain select-none pointer-events-none"
              />
              <div
                style={{
                  height: '1.5px',
                  marginBottom: '0.71cqw',
                  background: 'linear-gradient(90deg, #c9a449 0%, #9f731c 50%, #c9a449 100%)'
                }}
                className="w-full"
              />
              <div
                style={{ fontSize: '1.76cqw' }}
                className="font-bold text-[#081633] leading-[1.22]"
              >
                Authorized Signatory
              </div>
              <div
                style={{ fontSize: '1.65cqw' }}
                className="font-medium text-[#1e293b]"
              >
                Senior Gemologist
              </div>
            </div>

            {/* 6. QR Code Block */}
            <div
              style={{
                top: '72.07%',
                left: '54.14%',
                width: '13.54%'
              }}
              className="absolute flex flex-col items-center text-center z-10"
            >
              {qrDataUrl && (
                <div
                  style={{ width: '11.43cqw', height: '11.43cqw', padding: '0.48cqw' }}
                  className="bg-white flex items-center justify-center"
                >
                  <img src={qrDataUrl} alt="Verify QR" className="w-full h-full block" />
                </div>
              )}
              <div
                style={{
                  marginTop: '0.57cqw',
                  fontSize: '1.68cqw',
                  fontFamily: 'Georgia, serif'
                }}
                className="font-bold text-[#081633]"
              >
                Verify Report
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
