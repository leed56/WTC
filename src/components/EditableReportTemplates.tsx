'use client';

import React, { useEffect, useState } from 'react';
import { GemCertificate, LAB_CONTACT_INFO } from '@/lib/gemData';
import { generateQrDataUrl } from '@/lib/certificateStore';
import {
  Printer,
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
          FORMAT 2: PVC SMART CARD REPORT (ORIGINAL WTC CR80 DESIGN)
         ===================================================================== */}
      {activeFormat === 'pvc' && (
        <div className="flex justify-center py-4">
          <div
            style={{
              maxWidth: '680px',
              background:
                'radial-gradient(circle at 75% 45%, #16397a 0%, #091d4a 45%, #040d26 100%)'
            }}
            className="report-print-target w-full max-w-[680px] rounded-2xl border-2 border-[#E5C158] text-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] relative overflow-hidden"
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
        </div>
      )}

      {/* =====================================================================
          FORMAT 3: FULL A4 GEMOLOGICAL CERTIFICATE (ORIGINAL WTC DESIGN)
         ===================================================================== */}
      {activeFormat === 'a4' && (
        <div className="flex justify-center py-4">
          <div
            style={{ maxWidth: '820px' }}
            className="report-print-target w-full max-w-[820px] bg-[#FDFCF9] text-slate-900 rounded-md border border-slate-300 shadow-2xl relative overflow-hidden"
          >
            {/* Top Sweeping Navy & Gold Wave Header */}
            <svg
              viewBox="0 0 820 120"
              className="w-full h-24 sm:h-28 block pointer-events-none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="a4Navy" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#071330" />
                  <stop offset="50%" stopColor="#0D2454" />
                  <stop offset="100%" stopColor="#061028" />
                </linearGradient>
                <linearGradient id="a4Gold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B88928" />
                  <stop offset="50%" stopColor="#F5DC86" />
                  <stop offset="100%" stopColor="#A67A1E" />
                </linearGradient>
              </defs>
              <path d="M 0,0 L 820,0 L 820,88 Q 520,10 0,105 Z" fill="url(#a4Navy)" />
              <path
                d="M 0,102 Q 520,5 820,84 L 820,94 Q 520,16 0,114 Z"
                fill="url(#a4Gold)"
              />
            </svg>

            <div className="px-6 sm:px-12 pb-8 -mt-4 relative z-10">
              {/* Institutional Crest + Vertical Gold Line + Laboratory Title */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5">
                <div className="flex flex-col items-center text-center">
                  <img
                    src="/brand/wtc_crest.png?v=3"
                    alt="WTC Gem Lab Crest"
                    className="h-12 w-auto object-contain mb-0.5"
                  />
                  <div className="font-cinzel text-xs font-bold tracking-[0.28em] text-[#9E7823] leading-none">
                    WTC
                  </div>
                  <div className="font-cinzel text-2xl font-black tracking-wider text-[#B68B29] leading-tight">
                    GEM LAB
                  </div>
                  <div className="text-[7.5px] font-mono tracking-[0.22em] text-[#0B1B3E] font-bold uppercase mt-0.5">
                    GEMOLOGICAL LABORATORY
                  </div>
                </div>

                <div className="hidden sm:block h-16 w-[1.5px] bg-[#C5A059]" />

                <div className="text-center sm:text-left">
                  <div className="font-cinzel font-extrabold text-lg sm:text-xl tracking-wider text-[#0B1B3E] border-b border-[#C5A059] pb-1">
                    GEMOLOGICAL LABORATORY
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-cinzel font-bold tracking-[0.25em] text-[#1E335E] pt-1.5 text-center">
                    ANALYSE &bull; IDENTIFY &bull; ASSURE
                  </div>
                </div>
              </div>

              {/* Centered Dark Navy Pill: GEMSTONE IDENTIFICATION REPORT */}
              <div className="flex items-center justify-center gap-3 my-3">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C5A059]" />
                <div className="px-6 sm:px-10 py-2 rounded-full bg-gradient-to-r from-[#071330] via-[#0E2454] to-[#071330] text-white font-cinzel font-bold text-xs sm:text-sm tracking-[0.18em] uppercase shadow-md border border-[#C5A059]/40">
                  GEMSTONE IDENTIFICATION REPORT
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C5A059]" />
              </div>

              {/* Report Number + Date of Issue (Left) & Large Stone Photo (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-5">
                <div className="md:col-span-7 space-y-2 text-sm font-sans">
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-[#0B1B3E]">
                      Report Number
                    </span>
                    <span className="col-span-7 font-bold text-slate-950 font-mono">
                      :{' '}
                      <InlineEditable
                        value={certificate.reportNumber}
                        onChange={(val) => onChange({ reportNumber: val })}
                      />
                    </span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 font-semibold text-[#0B1B3E]">
                      Date of Issue
                    </span>
                    <span className="col-span-7 font-semibold text-slate-900">
                      :{' '}
                      <InlineEditable
                        value={certificate.issueDate}
                        onChange={(val) => onChange({ issueDate: val })}
                      />
                    </span>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col items-center">
                  {certificate.imageUrl.includes('sample_sapphire') ? (
                    <div
                      style={{ width: '215px', height: '165px' }}
                      className="flex flex-col items-center justify-center relative"
                    >
                      <img
                        src={getDisplayStoneSrc(certificate.imageUrl)}
                        alt={certificate.variety}
                        className="w-full h-[132px] object-contain drop-shadow-[0_10px_16px_rgba(11,27,62,0.18)] relative z-10"
                      />
                      {/* Subtle Studio Mirror Reflection */}
                      <img
                        src={getDisplayStoneSrc(certificate.imageUrl)}
                        alt=""
                        aria-hidden="true"
                        style={{
                          transform: 'scaleY(-1)',
                          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)'
                        }}
                        className="w-full h-[36px] object-contain -mt-2 opacity-60 pointer-events-none select-none"
                      />
                      {certificate.showMicroscopeOnReport && certificate.microscopeImageUrl && (
                        <div className="absolute bottom-1.5 right-1.5 z-20 w-14 h-14 rounded-lg border-2 border-[#C5A059] overflow-hidden shadow-md bg-slate-950">
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
                      style={{ width: '210px', height: '155px' }}
                      className="rounded-xl bg-white p-1.5 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative"
                    >
                      <img
                        src={getDisplayStoneSrc(certificate.imageUrl)}
                        alt={certificate.variety}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {certificate.showMicroscopeOnReport && certificate.microscopeImageUrl && (
                        <div className="absolute bottom-1.5 right-1.5 w-14 h-14 rounded-lg border-2 border-[#C5A059] overflow-hidden shadow-md bg-slate-950">
                          <img
                            src={certificate.microscopeImageUrl}
                            alt="Inclusion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section Bar 1: GEMSTONE IDENTIFICATION */}
              <div className="rounded-full bg-gradient-to-r from-[#071330] via-[#132C63] to-[#D4AF37]/30 px-5 py-1.5 mb-3">
                <h3 className="font-cinzel font-bold text-xs sm:text-sm tracking-[0.14em] text-white uppercase">
                  GEMSTONE IDENTIFICATION
                </h3>
              </div>

              <div className="space-y-2 text-xs sm:text-[13px] px-2 mb-6">
                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Species / Variety
                  </span>
                  <span className="col-span-7 sm:col-span-8 font-bold text-[#0B1B3E]">
                    :{' '}
                    <InlineEditable
                      value={`${certificate.species} / ${certificate.variety}`}
                      onChange={(val) => onChange({ variety: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Weight
                  </span>
                  <span className="col-span-7 sm:col-span-8 font-bold text-slate-950">
                    :{' '}
                    <InlineEditable
                      value={certificate.weight}
                      onChange={(val) => onChange({ weight: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Shape and Cutting Style
                  </span>
                  <span className="col-span-7 sm:col-span-8 text-slate-900">
                    :{' '}
                    <InlineEditable
                      value={certificate.shapeAndCut}
                      onChange={(val) => onChange({ shapeAndCut: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Measurements
                  </span>
                  <span className="col-span-7 sm:col-span-8 font-mono text-slate-900">
                    :{' '}
                    <InlineEditable
                      value={certificate.dimensions}
                      onChange={(val) => onChange({ dimensions: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Colour
                  </span>
                  <span className="col-span-7 sm:col-span-8 text-slate-900">
                    :{' '}
                    <InlineEditable
                      value={certificate.color}
                      onChange={(val) => onChange({ color: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Transparency
                  </span>
                  <span className="col-span-7 sm:col-span-8 text-slate-900">
                    :{' '}
                    <InlineEditable
                      value={certificate.transparency}
                      onChange={(val) => onChange({ transparency: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    R.I. / Specific Gravity
                  </span>
                  <span className="col-span-7 sm:col-span-8 font-mono text-slate-900">
                    :{' '}
                    <InlineEditable
                      value={certificate.refractiveIndex || '1.762 – 1.770'}
                      onChange={(val) => onChange({ refractiveIndex: val })}
                    />{' '}
                    &bull; S.G.{' '}
                    <InlineEditable
                      value={certificate.specificGravity || '4.00'}
                      onChange={(val) => onChange({ specificGravity: val })}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-12 py-0.5">
                  <span className="col-span-5 sm:col-span-4 font-semibold text-slate-700">
                    Treatment
                  </span>
                  <span className="col-span-7 sm:col-span-8 font-bold text-[#0B1B3E]">
                    :{' '}
                    <InlineEditable
                      value={certificate.treatment}
                      onChange={(val) => onChange({ treatment: val })}
                    />
                  </span>
                </div>
              </div>

              {/* Section Bar 2: LABORATORY OBSERVATIONS */}
              <div className="rounded-full bg-gradient-to-r from-[#071330] via-[#132C63] to-[#D4AF37]/30 px-5 py-1.5 mb-3">
                <h3 className="font-cinzel font-bold text-xs sm:text-sm tracking-[0.14em] text-white uppercase">
                  LABORATORY OBSERVATIONS
                </h3>
              </div>

              <div className="px-2 text-xs sm:text-[13px] text-slate-800 leading-relaxed mb-8 space-y-1.5">
                <div>
                  <InlineEditable
                    multiline
                    value={certificate.microscopicObservations}
                    onChange={(val) => onChange({ microscopicObservations: val })}
                  />
                </div>
                <div className="text-slate-600 italic text-xs">
                  <InlineEditable
                    multiline
                    value={certificate.comments}
                    onChange={(val) => onChange({ comments: val })}
                  />
                </div>
              </div>

              {/* Bottom Signature, Center QR Code & Right Gold Foil Seal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-2">
                {/* Left: Authorized Signatory */}
                <div className="text-center">
                  <div className="font-playfair italic text-lg sm:text-xl whitespace-nowrap text-blue-800 font-bold tracking-wide -mb-1 select-none">
                    <InlineEditable
                      value={certificate.gemologistName || 'K. Perera'}
                      onChange={(val) => onChange({ gemologistName: val })}
                    />
                  </div>
                  <div className="border-t border-[#C5A059] pt-1.5 mt-1">
                    <div className="text-xs font-bold text-[#0B1B3E]">
                      Authorized Signatory
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Senior Gemologist
                    </div>
                  </div>
                </div>

                {/* Center: QR Verification Code */}
                <div className="flex flex-col items-center">
                  {qrDataUrl && (
                    <div className="bg-white p-1.5 rounded border border-slate-300 shadow-sm">
                      <img src={qrDataUrl} alt="Verify QR" className="w-20 h-20" />
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-[#0B1B3E] mt-1">
                    Verify Report
                  </span>
                </div>

                {/* Right: Crisp Serrated Gold Foil Seal */}
                <div className="flex justify-center sm:justify-end">
                  <div className="relative w-28 h-28 flex items-center justify-center drop-shadow-md select-none">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      <defs>
                        <radialGradient id="wtcSealGold" cx="35%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#FFF2B2" />
                          <stop offset="45%" stopColor="#E0B84C" />
                          <stop offset="85%" stopColor="#B88724" />
                          <stop offset="100%" stopColor="#8C6212" />
                        </radialGradient>
                        <path id="sealTopArc" d="M 22,60 A 38,38 0 1,1 98,60" />
                        <path id="sealBotArc" d="M 21,62 A 39,39 0 0,0 99,62" />
                      </defs>
                      {/* Serrated Starburst Perimeter (36 points) */}
                      <polygon
                        fill="url(#wtcSealGold)"
                        stroke="#7A540E"
                        strokeWidth="0.8"
                        points={Array.from({ length: 72 }, (_, i) => {
                          const angle = (i * Math.PI) / 36;
                          const r = i % 2 === 0 ? 57 : 52.5;
                          return `${(60 + r * Math.cos(angle)).toFixed(2)},${(60 + r * Math.sin(angle)).toFixed(2)}`;
                        }).join(' ')}
                      />
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#6E4B0A" strokeWidth="1" opacity="0.7" />
                      <circle cx="60" cy="60" r="32" fill="none" stroke="#6E4B0A" strokeWidth="0.9" opacity="0.7" />
                      <text fontSize="5.4" fontWeight="700" fill="#2B1D02" letterSpacing="0.8">
                        <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
                          ★ AUTHENTIC GEMOLOGICAL REPORT ★
                        </textPath>
                      </text>
                      <text fontSize="5.4" fontWeight="700" fill="#2B1D02" letterSpacing="0.8">
                        <textPath href="#sealBotArc" startOffset="50%" textAnchor="middle">
                          TRUSTED CERTIFICATION
                        </textPath>
                      </text>
                      <text x="60" y="57" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="serif" fill="#2B1D02" letterSpacing="1">
                        WTC
                      </text>
                      <text x="60" y="70" textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="serif" fill="#2B1D02" letterSpacing="0.6">
                        GEM LAB
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Footer Disclaimer */}
              <div className="text-center mt-6 pt-3 border-t border-slate-200 space-y-0.5">
                <p className="text-[10.5px] italic text-slate-600">
                  This report is issued for identification purposes only and does not constitute a valuation.
                </p>
                <div className="text-xs font-bold text-[#0B1B3E]">
                  {LAB_CONTACT_INFO.website}
                </div>
              </div>
            </div>

            {/* Bottom Sweeping Navy & Gold Wave Footer */}
            <svg
              viewBox="0 0 820 75"
              className="w-full h-16 block pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,30 Q 260,65 820,5 L 820,14 Q 260,75 0,40 Z"
                fill="url(#a4Gold)"
              />
              <path d="M 0,36 Q 260,70 820,12 L 820,75 L 0,75 Z" fill="url(#a4Navy)" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
