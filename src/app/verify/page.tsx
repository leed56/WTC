'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, Search, AlertCircle, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { GemCertificate, INITIAL_CERTIFICATES } from '@/lib/gemData';
import { findCertificateByNumber, getStoredCertificates } from '@/lib/certificateStore';
import CertificateViewer from '@/components/CertificateViewer';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryId = searchParams.get('id');

  const [searchId, setSearchId] = useState(queryId || '');
  const [currentCert, setCurrentCert] = useState<GemCertificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [allCertificates, setAllCertificates] = useState<GemCertificate[]>(INITIAL_CERTIFICATES);

  useEffect(() => {
    const list = getStoredCertificates();
    setAllCertificates(list);

    if (queryId) {
      const match = findCertificateByNumber(queryId);
      setCurrentCert(match);
      setHasSearched(true);
      setSearchId(queryId);
    }
  }, [queryId]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    const trimmed = searchId.trim().toUpperCase();
    router.push(`/verify?id=${encodeURIComponent(trimmed)}`);
    const match = findCertificateByNumber(trimmed);
    setCurrentCert(match);
    setHasSearched(true);
  };

  const handleQuickSelect = (id: string) => {
    setSearchId(id);
    router.push(`/verify?id=${encodeURIComponent(id)}`);
    const match = findCertificateByNumber(id);
    setCurrentCert(match);
    setHasSearched(true);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Header */}
        <div className="no-print text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Report Database Check</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Online Report Verification
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Verify the authenticity of any WTC Gem Lab certificate by entering the official report number or scanning the QR code on your certificate card.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-amber-400" />
              </div>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. WTC-2026-1048"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Now</span>
            </button>
          </form>

          {/* Quick Click Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Recent Reports:</span>
            {allCertificates.slice(0, 5).map((c) => (
              <button
                key={c.reportNumber}
                onClick={() => handleQuickSelect(c.reportNumber)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition ${
                  currentCert?.reportNumber === c.reportNumber
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {c.reportNumber} ({c.stoneType})
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {currentCert ? (
          <div className="animate-in fade-in duration-300">
            <CertificateViewer cert={currentCert} showBackToSearch={true} />
          </div>
        ) : hasSearched ? (
          <div className="max-w-xl mx-auto p-8 rounded-2xl bg-slate-900/80 border border-red-500/30 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Report Not Found</h3>
            <p className="text-xs text-slate-400 mt-2">
              No official record matching report number <span className="font-mono text-amber-400 font-bold">&quot;{searchId}&quot;</span> was found in our verification registry.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Please double check the format on your printed certificate (e.g., <code className="text-slate-300">WTC-2026-1048</code>) or contact our laboratory support directly.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => handleQuickSelect('WTC-2026-1048')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 border border-slate-700"
              >
                Try Sample: WTC-2026-1048
              </button>
            </div>
          </div>
        ) : (
          /* Empty State Guide */
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">Enter a Report Number above</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Our digital database provides tamper-proof verification of stone weight, species, natural origin, thermal treatment, and synthetic discrimination.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Report Verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
