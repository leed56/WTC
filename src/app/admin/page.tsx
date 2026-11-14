'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Flame,
  Layers,
  FileCheck2,
  Printer
} from 'lucide-react';
import { GemCertificate, INITIAL_CERTIFICATES } from '@/lib/gemData';
import {
  getStoredCertificates,
  fetchCertificatesFromApi,
  saveCertificateToApi,
  deleteCertificateFromApi,
  resetToDefaultCertificates
} from '@/lib/certificateStore';
import StaffAuthGate from '@/components/StaffAuthGate';

export default function AdminPage() {
  const [certs, setCerts] = useState<GemCertificate[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for new certificate
  const [newCert, setNewCert] = useState<Partial<GemCertificate>>({
    reportNumber: 'WTC-2026-7841',
    issueDate: '2026-11-12',
    stoneType: 'Natural',
    species: 'Natural Corundum',
    variety: 'Natural Blue Sapphire',
    shapeAndCut: 'Cushion Mixed Cut',
    weight: '3.50 ct',
    dimensions: '9.20 x 7.80 x 5.10 mm',
    color: 'Vivid Royal Blue',
    transparency: 'Transparent',
    treatment: 'No Indications of Thermal Treatment (Unheated)',
    treatmentDetails: 'Natural rutile silk needles intact. No thermal alteration observed under microscopic examination.',
    originOpinion: 'Sri Lanka (Ceylon)',
    refractiveIndex: '1.762 - 1.770',
    specificGravity: '4.00',
    fluorescence: 'Inert under Longwave & Shortwave UV',
    microscopicObservations: 'Intact rutile silk, liquid healed fractures, undisturbed zoning.',
    comments: 'Exceptional natural sapphire with unenhanced color and transparency.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    securityHash: 'WTC-AUTH-7841-VER',
    status: 'Issued'
  });

  useEffect(() => {
    setCerts(getStoredCertificates());
    fetchCertificatesFromApi().then((list) => setCerts(list));
  }, []);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (reportNumber: string) => {
    if (confirm(`Are you sure you want to delete report ${reportNumber}?`)) {
      await deleteCertificateFromApi(reportNumber);
      setCerts(await fetchCertificatesFromApi());
      showNotify(`Deleted report ${reportNumber}`);
    }
  };

  const handleReset = () => {
    if (confirm('Reset certificate database to default seed records?')) {
      const reset = resetToDefaultCertificates();
      setCerts(reset);
      showNotify('Database reset to default certificates.');
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.reportNumber || !newCert.variety) return;

    const fullCert: GemCertificate = {
      reportNumber: newCert.reportNumber.trim().toUpperCase(),
      issueDate: newCert.issueDate || new Date().toISOString().split('T')[0],
      stoneType: newCert.stoneType as any,
      species: newCert.species || 'Natural Corundum',
      variety: newCert.variety,
      shapeAndCut: newCert.shapeAndCut || 'Oval Mixed Cut',
      weight: newCert.weight || '1.00 ct',
      dimensions: newCert.dimensions || '6.00 x 4.00 x 3.00 mm',
      color: newCert.color || 'Vivid',
      transparency: newCert.transparency || 'Transparent',
      treatment: newCert.treatment || 'No Indications of Thermal Treatment (Unheated)',
      treatmentDetails: newCert.treatmentDetails,
      originOpinion: newCert.originOpinion,
      refractiveIndex: newCert.refractiveIndex,
      specificGravity: newCert.specificGravity,
      fluorescence: newCert.fluorescence,
      microscopicObservations: newCert.microscopicObservations || 'Standard diagnostic inclusions examined.',
      comments: newCert.comments || 'Verified under standard gemological procedures.',
      imageUrl: newCert.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      securityHash: `WTC-AUTH-${Math.floor(1000 + Math.random() * 9000)}-SEC`,
      status: 'Issued'
    };

    await saveCertificateToApi(fullCert);
    setCerts(await fetchCertificatesFromApi());
    setIsModalOpen(false);
    showNotify(`Report ${fullCert.reportNumber} created successfully!`);

    // Reset form for next
    setNewCert({
      reportNumber: `WTC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      stoneType: 'Natural',
      species: 'Natural Corundum',
      variety: 'Natural Blue Sapphire',
      shapeAndCut: 'Cushion Mixed Cut',
      weight: '3.50 ct',
      dimensions: '9.20 x 7.80 x 5.10 mm',
      color: 'Vivid Royal Blue',
      transparency: 'Transparent',
      treatment: 'No Indications of Thermal Treatment (Unheated)',
      treatmentDetails: 'Natural rutile silk needles intact. No thermal alteration observed.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      microscopicObservations: 'Intact silk, liquid healed fractures, undisturbed zoning.',
      comments: 'Tested under standard gemological procedures.',
      status: 'Issued'
    });
  };

  const filteredCerts = certs.filter((c) => {
    const matchesType = filterType === 'all' || c.stoneType.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      c.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.species.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <StaffAuthGate portalTitle="WTC Gem Lab Registry Admin">
      <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Notification */}
        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff Administration Suite</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">
              Certificate Registry &amp; Issuance
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Issue, manage, and verify official WTC Gem Lab identification reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/staff-lab"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-cinzel font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gemological Diagnostic Engine (R.I. &amp; S.G. Studio)</span>
            </Link>

            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition"
              title="Reset Demo Records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Issue</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Report No, Variety, Species..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'natural', 'heated', 'synthetic', 'treated'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                  filterType === t
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50 uppercase text-[11px]">
                  <th className="py-3 px-4">Report Number</th>
                  <th className="py-3 px-4">Variety / Species</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Treatment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No certificates match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((c) => (
                    <tr key={c.reportNumber} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {c.reportNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-sans">{c.variety}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{c.species}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.stoneType === 'Natural'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : c.stoneType === 'Heated'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : c.stoneType === 'Synthetic'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {c.stoneType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{c.weight}</td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-300 max-w-xs truncate font-sans">
                        {c.treatment}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{c.issueDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/verify?id=${encodeURIComponent(c.reportNumber)}`}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition"
                            title="Verify Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.reportNumber)}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Issue New Certificate */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-serif font-bold text-white">
                    Issue New Gemological Report
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-mono"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateCertificate} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Report Number *</label>
                    <input
                      type="text"
                      required
                      value={newCert.reportNumber}
                      onChange={(e) => setNewCert({ ...newCert, reportNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={newCert.issueDate}
                      onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Stone Classification *</label>
                    <select
                      value={newCert.stoneType}
                      onChange={(e) => setNewCert({ ...newCert, stoneType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    >
                      <option value="Natural">Natural (Unheated)</option>
                      <option value="Heated">Heated</option>
                      <option value="Synthetic">Synthetic / Lab-Grown</option>
                      <option value="Treated">Treated (Clarity Enhanced)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Mineral Species</label>
                    <input
                      type="text"
                      value={newCert.species}
                      onChange={(e) => setNewCert({ ...newCert, species: e.target.value })}
                      placeholder="e.g. Natural Corundum"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Identification Variety *</label>
                    <input
                      type="text"
                      required
                      value={newCert.variety}
                      onChange={(e) => setNewCert({ ...newCert, variety: e.target.value })}
                      placeholder="e.g. Natural Blue Sapphire"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Carat Weight *</label>
                    <input
                      type="text"
                      required
                      value={newCert.weight}
                      onChange={(e) => setNewCert({ ...newCert, weight: e.target.value })}
                      placeholder="e.g. 4.25 ct"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Shape &amp; Cut</label>
                    <input
                      type="text"
                      value={newCert.shapeAndCut}
                      onChange={(e) => setNewCert({ ...newCert, shapeAndCut: e.target.value })}
                      placeholder="e.g. Oval Mixed Cut"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={newCert.dimensions}
                      onChange={(e) => setNewCert({ ...newCert, dimensions: e.target.value })}
                      placeholder="e.g. 9.80 x 7.40 x 5.10 mm"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Color Description</label>
                    <input
                      type="text"
                      value={newCert.color}
                      onChange={(e) => setNewCert({ ...newCert, color: e.target.value })}
                      placeholder="e.g. Vivid Royal Blue"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Transparency</label>
                    <input
                      type="text"
                      value={newCert.transparency}
                      onChange={(e) => setNewCert({ ...newCert, transparency: e.target.value })}
                      placeholder="e.g. Transparent"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Treatment Conclusion *</label>
                  <input
                    type="text"
                    required
                    value={newCert.treatment}
                    onChange={(e) => setNewCert({ ...newCert, treatment: e.target.value })}
                    placeholder="e.g. No Indications of Thermal Treatment (Unheated)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold text-amber-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Microscopic Observations</label>
                  <textarea
                    rows={2}
                    value={newCert.microscopicObservations}
                    onChange={(e) => setNewCert({ ...newCert, microscopicObservations: e.target.value })}
                    placeholder="Describe natural inclusions, silk integrity, or thermal halos..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Photograph Image URL</label>
                  <input
                    type="url"
                    value={newCert.imageUrl}
                    onChange={(e) => setNewCert({ ...newCert, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Publish Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </StaffAuthGate>
  );
}
