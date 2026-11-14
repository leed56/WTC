'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  Scale,
  Camera,
  Palette,
  Microscope,
  FileText,
  CheckCircle2,
  Sparkles,
  Flame,
  Layers,
  Send,
  Printer,
  Settings,
  ArrowLeft,
  RotateCcw,
  Upload,
  Eye,
  ExternalLink,
  AlertCircle,
  Sliders,
  QrCode
} from 'lucide-react';
import { GemCertificate } from '@/lib/gemData';
import {
  GEM_CONSTANTS_DB,
  GEM_COLOR_SWATCHES,
  INCLUSION_DIAGNOSTIC_RULES,
  calculateHydrostaticSG,
  filterAndRankGemstones,
  resolveVarietyForHue,
  GemConstantRecord,
  GemColorSwatch
} from '@/lib/gemConstantsDb';
import {
  addOrUpdateCertificate,
  getStoredCertificates
} from '@/lib/certificateStore';
import EditableReportTemplates, {
  ReportTemplateFormat
} from '@/components/EditableReportTemplates';

const WASSAPI_STORAGE_KEY = 'wtc_wassapi_config_v1';
const AI_VISION_STORAGE_KEY = 'wtc_ai_vision_config_v1';

const SAMPLE_STONE_PHOTOS = [
  {
    label: 'Royal Blue Sapphire',
    url: '/brand/sample_sapphire.png'
  },
  {
    label: 'Pigeon Blood Ruby',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop'
  },
  {
    label: 'Vivid Emerald',
    url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=800&auto=format&fit=crop'
  },
  {
    label: 'Cobalt Spinel',
    url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?q=80&w=800&auto=format&fit=crop'
  }
];

export default function StaffLabEnginePage() {
  // =========================================================================
  // 1. REFRACTIVE INDEX (R.I.) BENCH STATE
  // =========================================================================
  const [riMinInput, setRiMinInput] = useState<string>('1.762');
  const [riMaxInput, setRiMaxInput] = useState<string>('1.770');
  const [riTolerance, setRiTolerance] = useState<number>(0.012);
  const [isOTL, setIsOTL] = useState<boolean>(false);

  // =========================================================================
  // 2. HYDROSTATIC SPECIFIC GRAVITY (S.G.) BENCH STATE (Air vs. Water Weight)
  // =========================================================================
  const [airWeight, setAirWeight] = useState<string>('2.40');
  const [waterWeight, setWaterWeight] = useState<string>('1.80');
  const [sgTolerance, setSgTolerance] = useState<number>(0.06);
  const [manualSgOverride, setManualSgOverride] = useState<string>('');

  // =========================================================================
  // 3. COLOR, PHOTOGRAPHY & MICROSCOPE STATE
  // =========================================================================
  const [selectedSwatch, setSelectedSwatch] = useState<GemColorSwatch>(
    GEM_COLOR_SWATCHES[0]
  );
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('corundum');
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([
    'intact-rutile-silk',
    'angular-growth-zoning'
  ]);

  // =========================================================================
  // 4. ACTIVE REPORT TEMPLATE & CERTIFICATE STATE
  // =========================================================================
  const [activeFormat, setActiveFormat] = useState<ReportTemplateFormat>('pvc');
  const [notification, setNotification] = useState<string | null>(null);

  const [certificate, setCertificate] = useState<GemCertificate>({
    reportNumber: 'WTC-26-000842',
    issueDate: '2026-11-14',
    stoneType: 'Natural',
    species: 'Natural Corundum',
    variety: 'Natural Blue Sapphire',
    shapeAndCut: 'Oval Mixed Cut',
    weight: '2.40 Carats',
    dimensions: '8.40 × 6.50 × 4.35 mm',
    color: 'Vivid Royal Blue',
    transparency: 'Transparent',
    treatment: 'No Indications of Thermal Treatment (Unheated)',
    treatmentDetails:
      'Intact natural rutile silk and unaltered internal crystal structure confirm absence of thermal enhancement.',
    refractiveIndex: '1.762 – 1.770',
    birefringence: '0.008',
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    specificGravity: '4.00',
    fluorescence: 'Inert under Longwave & Shortwave UV',
    microscopicObservations:
      'Intact, sharp acicular rutile silk needles intersecting at 60°/120° with no thermal resorption. Distinct straight angular and hexagonal growth zoning.',
    comments:
      'Intact natural rutile silk and unaltered internal crystal structure confirm absence of thermal enhancement.',
    imageUrl: '/brand/sample_sapphire.png',
    microscopeImageUrl: '',
    showMicroscopeOnReport: true,
    gemologistName: 'Dr. K. Perera, FGA, DGA',
    secondGemologistName: 'S. Jayawardena, GIA GG',
    clientName: '',
    clientPhone: '+94 77 ',
    securityHash: 'WTC-26-AUTH-000842-LK',
    status: 'Issued'
  });

  // =========================================================================
  // 5. WASSAPI / WHATSAPP API STATE
  // =========================================================================
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);
  const [wassapiEndpoint, setWassapiEndpoint] = useState<string>(
    'https://api.wassenger.com/v1/messages'
  );
  const [wassapiKey, setWassapiKey] = useState<string>('');
  const [wassapiDeviceId, setWassapiDeviceId] = useState<string>('');
  const [whatsappSending, setWhatsappSending] = useState<boolean>(false);
  const [whatsappResult, setWhatsappResult] = useState<{
    success?: boolean;
    message?: string;
    waDirectUrl?: string;
    messagePreview?: string;
  } | null>(null);

  // =========================================================================
  // 6. AI MICROSCOPE VISION ANALYZER STATE (Gemini / OpenAI)
  // =========================================================================
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [aiModel, setAiModel] = useState<string>('gemini-2.5-flash');
  const [aiApiKey, setAiApiKey] = useState<string>('');
  const [aiSettingsOpen, setAiSettingsOpen] = useState<boolean>(false);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    detectedFeatures?: string[];
    matchedRuleIds?: string[];
    suggestedClassification?: string;
    confidenceScore?: number;
    gemologistNotes?: string;
    cautionNote?: string;
  } | null>(null);

  // Load saved Wassapi & AI Vision config from localStorage and set today's date
  useEffect(() => {
    setCertificate((prev) => ({
      ...prev,
      issueDate: new Date().toISOString().split('T')[0]
    }));
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(WASSAPI_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.endpoint) setWassapiEndpoint(parsed.endpoint);
          if (parsed.key) setWassapiKey(parsed.key);
          if (parsed.deviceId) setWassapiDeviceId(parsed.deviceId);
        }
        const rawAi = localStorage.getItem(AI_VISION_STORAGE_KEY);
        if (rawAi) {
          const parsedAi = JSON.parse(rawAi);
          if (parsedAi.provider) setAiProvider(parsedAi.provider);
          if (parsedAi.model) setAiModel(parsedAi.model);
          if (parsedAi.apiKey) setAiApiKey(parsedAi.apiKey);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveAiConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        AI_VISION_STORAGE_KEY,
        JSON.stringify({ provider: aiProvider, model: aiModel, apiKey: aiApiKey })
      );
      showToast('AI Vision API credentials saved to browser.');
      setAiSettingsOpen(false);
    }
  };

  const handleAnalyzeMicroscope = async () => {
    if (!certificate.microscopeImageUrl) {
      setAiError('Please upload a microscope photomicrograph first.');
      return;
    }
    setAiAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const res = await fetch('/api/microscope/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: certificate.microscopeImageUrl,
          provider: aiProvider,
          model: aiModel,
          apiKey: aiApiKey,
          refractiveIndex: certificate.refractiveIndex,
          specificGravity: certificate.specificGravity,
          species: certificate.species,
          variety: certificate.variety,
          color: certificate.color
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAiError(data.error || 'Failed to analyze microscope image.');
        if (data.needsKey) setAiSettingsOpen(true);
        return;
      }

      setAiAnalysis(data.analysis);
      showToast(
        `AI Microscope Analysis complete (${data.analysis?.confidenceScore || 90}% confidence). Review and apply findings.`
      );
    } catch (err: any) {
      setAiError(err?.message || 'Network error while analyzing microscope image.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApplyAiFindings = () => {
    if (!aiAnalysis) return;
    const validIds = (aiAnalysis.matchedRuleIds || []).filter((id) =>
      INCLUSION_DIAGNOSTIC_RULES.some((r) => r.id === id)
    );
    if (validIds.length > 0) {
      setSelectedRuleIds(validIds);
    }

    const activeRules = INCLUSION_DIAGNOSTIC_RULES.filter((r) =>
      validIds.includes(r.id)
    );
    const decisiveRule =
      activeRules.find((r) => r.category === 'synthetic') ||
      activeRules.find((r) => r.category === 'treated') ||
      activeRules.find((r) => r.category === 'heated') ||
      activeRules.find((r) => r.category === 'unheated');

    setCertificate((prev) => ({
      ...prev,
      stoneType:
        (aiAnalysis.suggestedClassification as any) ||
        decisiveRule?.conclusionImpact.stoneType ||
        prev.stoneType,
      treatment:
        decisiveRule?.conclusionImpact.treatmentTitle || prev.treatment,
      microscopicObservations:
        aiAnalysis.gemologistNotes || prev.microscopicObservations,
      comments:
        decisiveRule?.conclusionImpact.commentAddition ||
        aiAnalysis.gemologistNotes ||
        prev.comments
    }));

    showToast('AI inclusion findings applied to the live report!');
  };

  const saveWassapiConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        WASSAPI_STORAGE_KEY,
        JSON.stringify({
          endpoint: wassapiEndpoint,
          key: wassapiKey,
          deviceId: wassapiDeviceId
        })
      );
      showToast('Wassapi API credentials saved to browser.');
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // =========================================================================
  // DERIVED CALCULATIONS: BIREFRINGENCE & HYDROSTATIC S.G.
  // =========================================================================
  const parsedRiMin = useMemo(() => {
    const v = parseFloat(riMinInput);
    return isNaN(v) ? null : v;
  }, [riMinInput]);

  const parsedRiMax = useMemo(() => {
    const v = parseFloat(riMaxInput);
    return isNaN(v) ? null : v;
  }, [riMaxInput]);

  const calculatedBirefringence = useMemo(() => {
    if (isOTL) return 'OTL (>1.81)';
    if (parsedRiMin === null) return null;
    if (parsedRiMax === null || parsedRiMax <= parsedRiMin) return '0.000 (Isotropic)';
    return (parsedRiMax - parsedRiMin).toFixed(3);
  }, [parsedRiMin, parsedRiMax, isOTL]);

  const sgCalculation = useMemo(() => {
    return calculateHydrostaticSG(airWeight, waterWeight);
  }, [airWeight, waterWeight]);

  const effectiveSg = useMemo(() => {
    if (manualSgOverride.trim() !== '') {
      const m = parseFloat(manualSgOverride);
      if (!isNaN(m) && m > 1.0) return m;
    }
    return sgCalculation.sg;
  }, [manualSgOverride, sgCalculation.sg]);

  // =========================================================================
  // FILTERED & RANKED GEMSTONE CANDIDATES (STAGE 1 + STAGE 2 + STAGE 3)
  // =========================================================================
  const rankedCandidates = useMemo(() => {
    return filterAndRankGemstones({
      riMin: parsedRiMin,
      riMax: parsedRiMax,
      riTolerance,
      isOTL,
      sg: effectiveSg,
      sgTolerance,
      selectedHue: selectedSwatch.hueFamily
    });
  }, [
    parsedRiMin,
    parsedRiMax,
    riTolerance,
    isOTL,
    effectiveSg,
    sgTolerance,
    selectedSwatch.hueFamily
  ]);

  // Sync calculated R.I., Birefringence, Weight in Air, and S.G. to Certificate
  useEffect(() => {
    const updates: Partial<GemCertificate> = {};

    if (isOTL) {
      updates.refractiveIndex = 'OTL (> 1.810)';
      updates.birefringence = 'High';
    } else if (parsedRiMin !== null) {
      if (parsedRiMax !== null && parsedRiMax > parsedRiMin) {
        updates.refractiveIndex = `${parsedRiMin.toFixed(3)} – ${parsedRiMax.toFixed(3)}`;
        updates.birefringence = (parsedRiMax - parsedRiMin).toFixed(3);
      } else {
        updates.refractiveIndex = `${parsedRiMin.toFixed(3)} (Single)`;
        updates.birefringence = 'None (Isotropic)';
      }
    }

    const parsedAir = parseFloat(airWeight);
    if (!isNaN(parsedAir) && parsedAir > 0) {
      updates.weight = `${parsedAir.toFixed(2)} Carats`;
    }

    if (effectiveSg !== null) {
      updates.specificGravity = effectiveSg.toFixed(2);
    }

    setCertificate((prev) => ({ ...prev, ...updates }));
  }, [parsedRiMin, parsedRiMax, isOTL, airWeight, effectiveSg]);

  // Apply Candidate Species Selection
  const handleSelectCandidate = (gem: GemConstantRecord, suggestedVariety: string) => {
    setSelectedSpeciesId(gem.id);
    setCertificate((prev) => ({
      ...prev,
      species: gem.species,
      variety: suggestedVariety,
      opticCharacter: gem.opticCharacter,
      fluorescence: gem.uvFluorescence,
      stoneType:
        gem.category === 'Synthetic'
          ? 'Synthetic'
          : gem.category === 'Simulant'
          ? 'Treated'
          : prev.stoneType === 'Synthetic'
          ? 'Natural'
          : prev.stoneType
    }));
    showToast(`Applied candidate: ${suggestedVariety} (${gem.species})`);
  };

  // Apply Color Swatch Selection
  const handleSelectColorSwatch = (swatch: GemColorSwatch) => {
    setSelectedSwatch(swatch);
    const activeGem =
      GEM_CONSTANTS_DB.find((g) => g.id === selectedSpeciesId) ||
      rankedCandidates[0]?.record;

    let updatedVariety = certificate.variety;
    if (activeGem) {
      updatedVariety = resolveVarietyForHue(activeGem, swatch.hueFamily);
    }

    setCertificate((prev) => ({
      ...prev,
      color: swatch.tradeName,
      variety: updatedVariety
    }));
  };

  // Toggle Microscopic Inclusion Rule
  const handleToggleInclusionRule = (ruleId: string) => {
    setSelectedRuleIds((prev) => {
      const next = prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId];

      const activeRules = INCLUSION_DIAGNOSTIC_RULES.filter((r) =>
        next.includes(r.id)
      );

      if (activeRules.length > 0) {
        // Priority: synthetic > treated > heated > unheated
        const synthRule = activeRules.find((r) => r.category === 'synthetic');
        const treatedRule = activeRules.find((r) => r.category === 'treated');
        const heatedRule = activeRules.find((r) => r.category === 'heated');
        const unheatedRule = activeRules.find((r) => r.category === 'unheated');

        const decisiveRule =
          synthRule || treatedRule || heatedRule || unheatedRule || activeRules[0];

        const observations = activeRules.map((r) => r.observationText).join(' ');
        const comments = activeRules
          .map((r) => r.conclusionImpact.commentAddition)
          .join(' ');

        setCertificate((curr) => ({
          ...curr,
          stoneType: decisiveRule.conclusionImpact.stoneType,
          treatment: decisiveRule.conclusionImpact.treatmentTitle,
          microscopicObservations: observations,
          comments
        }));
      }

      return next;
    });
  };

  // Handle File Upload (Stone Image or Microscope Image) -> Base64 Data URL
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageUrl' | 'microscopeImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCertificate((prev) => ({
          ...prev,
          [field]: reader.result as string,
          ...(field === 'microscopeImageUrl' ? { showMicroscopeOnReport: true } : {})
        }));
        showToast(
          field === 'imageUrl'
            ? 'Stone macro photograph uploaded.'
            : 'Microscope inclusion photomicrograph uploaded.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Save & Issue Certificate to Registry
  const handleSaveToRegistry = () => {
    const cleanNumber = certificate.reportNumber.trim().toUpperCase();
    const updatedCert: GemCertificate = {
      ...certificate,
      reportNumber: cleanNumber,
      securityHash: `WTC-26-AUTH-${cleanNumber.slice(-6)}-LK`,
      status: 'Issued'
    };
    setCertificate(updatedCert);
    addOrUpdateCertificate(updatedCert);
    showToast(
      `Official Report ${cleanNumber} saved to WTC Gem Lab Registry! QR verification is now live.`
    );
  };

  // Generate New Report Number
  const handleNewReportId = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const nextNo = `WTC-26-${rand}`;
    setCertificate((prev) => ({
      ...prev,
      reportNumber: nextNo,
      securityHash: `WTC-26-AUTH-${String(rand).slice(-4)}-LK`
    }));
  };

  // Send via Wassapi / WhatsApp API
  const handleDispatchWhatsApp = async () => {
    setWhatsappSending(true);
    setWhatsappResult(null);
    try {
      // Save report first so the verification link works immediately
      handleSaveToRegistry();

      const origin =
        typeof window !== 'undefined' ? window.location.origin : 'https://wtcgemlab.lk';
      const verifyUrl = `${origin}/verify?id=${encodeURIComponent(
        certificate.reportNumber
      )}`;

      const formatLabel =
        activeFormat === 'sticker'
          ? 'Simple Verbal Report (Sticker)'
          : activeFormat === 'pvc'
          ? 'PVC Smart Card Report'
          : 'A4 Gemological Certificate';

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: certificate.clientPhone,
          clientName: certificate.clientName,
          reportNumber: certificate.reportNumber,
          variety: certificate.variety,
          species: certificate.species,
          weight: certificate.weight,
          treatment: certificate.treatment,
          refractiveIndex: certificate.refractiveIndex,
          specificGravity: certificate.specificGravity,
          verifyUrl,
          reportFormat: formatLabel,
          apiEndpoint: wassapiEndpoint,
          apiKey: wassapiKey,
          deviceId: wassapiDeviceId
        })
      });

      const data = await res.json();
      setWhatsappResult({
        success: data.success,
        message:
          data.notice ||
          (data.success
            ? `Dispatched successfully to ${data.recipient} via Wassapi!`
            : data.error),
        waDirectUrl: data.waDirectUrl,
        messagePreview: data.messagePreview
      });
    } catch (err: any) {
      setWhatsappResult({
        success: false,
        message: err?.message || 'Failed to reach WhatsApp dispatch endpoint.'
      });
    } finally {
      setWhatsappSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Notification (Hidden when printing) */}
        {notification && (
          <div className="no-print fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 text-xs font-mono shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* =================================================================
            TOP WORKBENCH HEADER (Hidden when printing)
           ================================================================= */}
        <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Registry Table</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemological Diagnostic Engine &amp; Report Studio</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black text-white">
              WTC Staff Gemological Workbench
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Step-by-step R.I. &rarr; Hydrostatic S.G. (Air/Water) &rarr; Color &amp; Macro Photo &rarr; Microscope Inclusion Engine &rarr; Live 3-Format Report Templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleNewReportId}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>New Report No</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToRegistry}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Issue ({certificate.reportNumber})</span>
            </button>

            <button
              type="button"
              onClick={() => setWhatsappModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp / Wassapi</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            4-STAGE GEMOLOGICAL DIAGNOSTIC ENGINE GRID (Hidden when printing)
           ================================================================= */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: STEP 1 (R.I.), STEP 2 (S.G. Air/Water), STEP 3 (Color & Photos), STEP 4 (Microscope) */}
          <div className="lg:col-span-7 space-y-6">
            {/* -------------------------------------------------------------
                STAGE 1: REFRACTIVE INDEX (R.I.) RECORD & AUTO BIREFRINGENCE
               ------------------------------------------------------------- */}
            <div className="rounded-2xl bg-[#0B132B] border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h2 className="font-cinzel font-bold text-base sm:text-lg text-white">
                      Refractive Index (R.I.) Entry
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Enter observed refractometer readings to filter candidate gemstones
                    </p>
                  </div>
                </div>

                {/* Quick Bench Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Presets:</span>
                  {[
                    { label: 'Corundum (1.762–1.770)', min: '1.762', max: '1.770', otl: false },
                    { label: 'Spinel (1.718)', min: '1.718', max: '1.718', otl: false },
                    { label: 'Emerald (1.577–1.583)', min: '1.577', max: '1.583', otl: false },
                    { label: 'Chrysoberyl (1.746–1.755)', min: '1.746', max: '1.755', otl: false },
                    { label: 'Zircon (OTL >1.81)', min: '1.925', max: '1.984', otl: true }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setIsOTL(p.otl);
                        setRiMinInput(p.min);
                        setRiMaxInput(p.max);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-mono transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    R.I. Minimum (n_min)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    disabled={isOTL}
                    value={riMinInput}
                    onChange={(e) => setRiMinInput(e.target.value)}
                    placeholder="e.g. 1.762"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    R.I. Maximum (n_max)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    disabled={isOTL}
                    value={riMaxInput}
                    onChange={(e) => setRiMaxInput(e.target.value)}
                    placeholder="e.g. 1.770"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Calculated Birefringence (&Delta;n)
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold flex items-center justify-between">
                    <span>{calculatedBirefringence || '—'}</span>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOTL}
                        onChange={(e) => setIsOTL(e.target.checked)}
                        className="rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                      />
                      <span>OTL (&gt;1.81)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                STAGE 2: HYDROSTATIC SPECIFIC GRAVITY (S.G.) CALCULATOR
               ------------------------------------------------------------- */}
            <div className="rounded-2xl bg-[#0B132B] border border-cyan-500/30 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h2 className="font-cinzel font-bold text-base sm:text-lg text-white">
                      Hydrostatic Specific Gravity (S.G.) Calculator
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Enter Weight in Air and Weight Inside Water: S.G. = Air Weight / (Air Weight &minus; Water Weight)
                    </p>
                  </div>
                </div>

                {/* Quick Hydrostatic Test Examples */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAirWeight('2.40');
                      setWaterWeight('1.80');
                      setManualSgOverride('');
                    }}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-mono"
                  >
                    Sapphire (Air 2.40 / Water 1.80 &rarr; 4.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAirWeight('3.60');
                      setWaterWeight('2.60');
                      setManualSgOverride('');
                    }}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-mono"
                  >
                    Spinel (Air 3.60 / Water 2.60 &rarr; 3.60)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAirWeight('2.72');
                      setWaterWeight('1.72');
                      setManualSgOverride('');
                    }}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-mono"
                  >
                    Emerald (Air 2.72 / Water 1.72 &rarr; 2.72)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    1. Weight in Air (W_air ct)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={airWeight}
                    onChange={(e) => setAirWeight(e.target.value)}
                    placeholder="e.g. 2.40"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    2. Weight Inside Water (W_water ct)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={waterWeight}
                    onChange={(e) => setWaterWeight(e.target.value)}
                    placeholder="e.g. 1.80"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono text-amber-300">
                      Or Type Exact S.G.
                    </label>
                    {manualSgOverride.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setManualSgOverride('')}
                        className="text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        Use Hydrostatic
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={manualSgOverride}
                    onChange={(e) => setManualSgOverride(e.target.value)}
                    placeholder="e.g. 4.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-200 placeholder-slate-500 font-mono text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 mb-1 font-bold">
                    Active Specific Gravity (S.G.)
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-cyan-950/50 border-2 border-cyan-400/50 text-cyan-300 font-mono text-base font-black flex items-center justify-between">
                    <span>{effectiveSg !== null ? effectiveSg.toFixed(2) : '—'}</span>
                    {manualSgOverride.trim() !== '' ? (
                      <span className="text-[10px] text-amber-300 font-semibold">
                        Direct S.G.
                      </span>
                    ) : sgCalculation.displacement !== null ? (
                      <span className="text-[10px] text-slate-400 font-normal">
                        &Delta;W: {sgCalculation.displacement} ct
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {sgCalculation.error && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sgCalculation.error}</span>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                STAGE 3: STONE PICTURE, COLOR SWATCHES & DIMENSIONS
               ------------------------------------------------------------- */}
            <div className="rounded-2xl bg-[#0B132B] border border-emerald-500/30 p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-base sm:text-lg text-white">
                    Stone Photograph, Color Selection &amp; Dimensions
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Upload the macro gemstone photo and select trade color to refine variety
                  </p>
                </div>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">
                  Select Gemstone Color / Trade Hue (Auto-updates Variety &amp; Report Color):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GEM_COLOR_SWATCHES.map((sw) => {
                    const isSelected = selectedSwatch.id === sw.id;
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => handleSelectColorSwatch(sw)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/40 shrink-0 shadow-inner"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), ${sw.hex} 65%)`
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">
                            {sw.tradeName}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400">
                            {sw.hueFamily}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stone Picture Upload + Physical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-slate-800/80">
                {/* Stone Photo Uploader (5 cols) */}
                <div className="sm:col-span-5 space-y-2">
                  <label className="block text-xs font-mono text-slate-300">
                    Gemstone Macro Picture
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl bg-white p-1 border-2 border-amber-500/40 overflow-hidden shrink-0">
                      <img
                        src={certificate.imageUrl}
                        alt="Stone Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs transition w-full justify-center">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Stone Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'imageUrl')}
                          className="hidden"
                        />
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_STONE_PHOTOS.map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() =>
                              setCertificate((prev) => ({ ...prev, imageUrl: s.url }))
                            }
                            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[9.5px] font-mono text-slate-300 border border-slate-700"
                          >
                            {s.label.split(' ')[1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cut, Dimensions, Transparency (7 cols) */}
                <div className="sm:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Shape &amp; Cut
                    </label>
                    <select
                      value={certificate.shapeAndCut}
                      onChange={(e) =>
                        setCertificate((prev) => ({ ...prev, shapeAndCut: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Oval Mixed Cut">Oval Mixed Cut</option>
                      <option value="Cushion Mixed Cut">Cushion Mixed Cut</option>
                      <option value="Octagonal Step Cut (Emerald Cut)">
                        Octagonal Step Cut (Emerald Cut)
                      </option>
                      <option value="Round Brilliant / Mixed Cut">
                        Round Brilliant / Mixed Cut
                      </option>
                      <option value="Pear Mixed Cut">Pear Mixed Cut</option>
                      <option value="Heart Mixed Cut">Heart Mixed Cut</option>
                      <option value="Oval Cabochon">Oval Cabochon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Measurements (L &times; W &times; D mm)
                    </label>
                    <input
                      type="text"
                      value={certificate.dimensions}
                      onChange={(e) =>
                        setCertificate((prev) => ({ ...prev, dimensions: e.target.value }))
                      }
                      placeholder="8.40 × 6.50 × 4.35 mm"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Transparency
                    </label>
                    <select
                      value={certificate.transparency}
                      onChange={(e) =>
                        setCertificate((prev) => ({ ...prev, transparency: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Transparent">Transparent</option>
                      <option value="Semi-Transparent">Semi-Transparent</option>
                      <option value="Translucent">Translucent</option>
                      <option value="Opaque">Opaque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      Custom Color Description
                    </label>
                    <input
                      type="text"
                      value={certificate.color}
                      onChange={(e) =>
                        setCertificate((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                STAGE 4: MICROSCOPE IMAGE & INCLUSION DIAGNOSTIC ENGINE
               ------------------------------------------------------------- */}
            <div className="rounded-2xl bg-[#0B132B] border border-purple-500/30 p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 font-mono font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h2 className="font-cinzel font-bold text-base sm:text-lg text-white">
                      Microscope Image &amp; Inclusion Diagnostic Engine
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Upload photomicrograph and check observed inclusions to auto-determine Natural / Heated / Synthetic
                    </p>
                  </div>
                </div>

                {/* Microscope Image Upload + AI Vision Analyzer Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 font-mono text-xs transition">
                    <Microscope className="w-3.5 h-3.5 text-purple-300" />
                    <span>
                      {certificate.microscopeImageUrl
                        ? 'Change Microscope Image'
                        : 'Upload Microscope Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'microscopeImageUrl')}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={aiAnalyzing}
                    onClick={handleAnalyzeMicroscope}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {aiAnalyzing ? 'Analyzing Inclusions...' : 'AI Analyze Photo'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiSettingsOpen(!aiSettingsOpen)}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition"
                    title="Configure Gemini / OpenAI Vision API Key"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Settings</span>
                  </button>

                  {certificate.microscopeImageUrl && (
                    <div className="w-10 h-10 rounded-lg border border-purple-400 overflow-hidden">
                      <img
                        src={certificate.microscopeImageUrl}
                        alt="Microscope"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* AI Vision Settings Drawer */}
              {aiSettingsOpen && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-300">
                      Vision AI Engine Configuration (Gemini / OpenAI)
                    </span>
                    <button
                      type="button"
                      onClick={saveAiConfig}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-bold"
                    >
                      Save AI Settings
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                        AI Provider
                      </label>
                      <select
                        value={aiProvider}
                        onChange={(e) => {
                          const next = e.target.value as 'gemini' | 'openai';
                          setAiProvider(next);
                          setAiModel(next === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o');
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      >
                        <option value="gemini">Google Gemini Vision</option>
                        <option value="openai">OpenAI GPT-4o Vision</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                        API Key (Saved in Browser)
                      </label>
                      <input
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        placeholder="Paste Gemini or OpenAI key..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Error Banner */}
              {aiError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Diagnostic Result Panel */}
              {aiAnalysis && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-400/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-mono text-[10px] font-bold">
                        AI Vision Co-Pilot &bull; {aiAnalysis.confidenceScore ?? 90}% Confidence
                      </span>
                      {aiAnalysis.suggestedClassification && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-bold">
                          Suggested: {aiAnalysis.suggestedClassification}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyAiFindings}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs shadow transition"
                    >
                      Apply AI Findings to Report &rarr;
                    </button>
                  </div>

                  {aiAnalysis.detectedFeatures && aiAnalysis.detectedFeatures.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-200 list-disc list-inside">
                      {aiAnalysis.detectedFeatures.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  )}

                  {aiAnalysis.gemologistNotes && (
                    <p className="text-xs text-amber-200/90 italic border-t border-slate-800 pt-2">
                      &ldquo;{aiAnalysis.gemologistNotes}&rdquo;
                    </p>
                  )}

                  {aiAnalysis.cautionNote && (
                    <p className="text-[10.5px] font-mono text-slate-400">
                      Gemologist Verification Note: {aiAnalysis.cautionNote}
                    </p>
                  )}
                </div>
              )}

              {/* Inclusion Checkboxes by Diagnostic Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INCLUSION_DIAGNOSTIC_RULES.map((rule) => {
                  const checked = selectedRuleIds.includes(rule.id);
                  const badgeColor =
                    rule.category === 'unheated'
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : rule.category === 'heated'
                      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : rule.category === 'synthetic'
                      ? 'text-purple-300 border-purple-500/30 bg-purple-500/10'
                      : 'text-blue-300 border-blue-500/30 bg-blue-500/10';

                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => handleToggleInclusionRule(rule.id)}
                      className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                        checked
                          ? 'bg-slate-800/95 border-amber-400 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-600 text-amber-500 focus:ring-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white leading-snug">
                            {rule.label}
                          </span>
                        </div>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${badgeColor}`}
                        >
                          {rule.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: REAL-TIME FILTERED GEMSTONE CANDIDATES & ENGINE SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-gradient-to-b from-[#0E1938] to-[#091124] border-2 border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Live Diagnostic Identification Engine
                  </span>
                  <h3 className="text-lg font-cinzel font-black text-white">
                    Matching Gemstone Candidates ({rankedCandidates.length})
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                  R.I. + S.G. Filter
                </span>
              </div>

              {/* Current Active Filter Summary */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-[9.5px] text-slate-400 block uppercase">R.I. Input</span>
                  <span className="text-amber-300 font-bold">
                    {isOTL
                      ? 'OTL >1.81'
                      : `${riMinInput || '—'}–${riMaxInput || '—'}`}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block uppercase">
                    Hydrostatic S.G.
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {effectiveSg !== null ? effectiveSg.toFixed(2) : 'All'}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block uppercase">Hue</span>
                  <span className="text-emerald-300 font-bold">
                    {selectedSwatch.hueFamily}
                  </span>
                </div>
              </div>

              {/* Candidate List */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {rankedCandidates.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-300 font-semibold">
                      No gemstone matches both R.I. ({riMinInput}–{riMaxInput}) and S.G. (
                      {effectiveSg?.toFixed(2)}).
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Check if the stone is a composite doublet, glass imitation, or widen the R.I./S.G. tolerance below.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRiTolerance(0.03);
                        setSgTolerance(0.15);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold"
                    >
                      Widen Search Tolerance
                    </button>
                  </div>
                ) : (
                  rankedCandidates.map((cand, idx) => {
                    const isSelected = selectedSpeciesId === cand.record.id;
                    return (
                      <div
                        key={cand.record.id}
                        className={`p-3.5 rounded-xl border transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-lg'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                                #{idx + 1} &bull; {cand.score}% Match
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  cand.record.category === 'Natural'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : cand.record.category === 'Synthetic'
                                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                    : 'bg-red-500/10 text-red-300 border-red-500/30'
                                }`}
                              >
                                {cand.record.category}
                              </span>
                            </div>

                            <h4 className="font-cinzel font-bold text-sm text-white mt-1.5">
                              {cand.suggestedVariety}
                            </h4>
                            <div className="text-[11px] text-slate-400">
                              Species: <strong className="text-slate-200">{cand.record.species}</strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleSelectCandidate(cand.record, cand.suggestedVariety)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isSelected ? 'Selected ✓' : 'Apply to Report'}
                          </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-slate-300">
                          <span>
                            R.I: {cand.record.riMin.toFixed(3)}–{cand.record.riMax.toFixed(3)}
                          </span>
                          <span>
                            S.G: {cand.record.sgMin.toFixed(2)}–{cand.record.sgMax.toFixed(2)} (Typ{' '}
                            {cand.record.sgTypical.toFixed(2)})
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                          {cand.record.diagnosticNotes}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Active Conclusion Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                  Synthesized Report Conclusion:
                </div>
                <div className="font-cinzel font-black text-base text-white">
                  {certificate.variety} ({certificate.weight})
                </div>
                <div className="text-xs font-semibold text-emerald-400">
                  {certificate.treatment}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            STAGE 5 & 6: LIVE EDITABLE 3-TYPE REPORT STUDIO (PRINT TARGET)
           ================================================================= */}
        <div className="pt-6 border-t border-slate-800">
          <div className="no-print mb-4">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">
              Stage 05 &bull; Live WYSIWYG Report Templates
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-0.5">
              3 Official Report Templates (Click Any Field to Edit &amp; Print / PDF)
            </h2>
          </div>

          <EditableReportTemplates
            certificate={certificate}
            onChange={(updates) =>
              setCertificate((prev) => ({ ...prev, ...updates }))
            }
            activeFormat={activeFormat}
            onFormatChange={setActiveFormat}
            onSaveAndIssue={handleSaveToRegistry}
            onOpenWhatsApp={() => setWhatsappModalOpen(true)}
          />
        </div>
      </div>

      {/* ===================================================================
          WASSAPI / WHATSAPP API DISPATCH MODAL
         =================================================================== */}
      {whatsappModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-[#0B132B] border-2 border-[#25D366]/60 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#25D366]/20 text-[#25D366]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-white">
                    WhatsApp Report Dispatch (Wassapi API)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Send official report verification &amp; digital twin link to client via Wassapi / WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={certificate.clientName || ''}
                  onChange={(e) =>
                    setCertificate((prev) => ({ ...prev, clientName: e.target.value }))
                  }
                  placeholder="e.g. Mr. R. Wijesinghe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Client WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={certificate.clientPhone || ''}
                  onChange={(e) =>
                    setCertificate((prev) => ({ ...prev, clientPhone: e.target.value }))
                  }
                  placeholder="+94 77 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Wassapi API Gateway Configuration */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Wassapi / WhatsApp Gateway Credentials</span>
                </span>
                <button
                  type="button"
                  onClick={saveWassapiConfig}
                  className="text-[11px] font-mono text-emerald-400 hover:underline"
                >
                  Save Credentials
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                    Wassapi API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={wassapiEndpoint}
                    onChange={(e) => setWassapiEndpoint(e.target.value)}
                    placeholder="https://api.wassenger.com/v1/messages"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                    API Key / Token (Optional for Direct Mode)
                  </label>
                  <input
                    type="password"
                    value={wassapiKey}
                    onChange={(e) => setWassapiKey(e.target.value)}
                    placeholder="Enter Wassapi API Token..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono text-slate-400 mb-1">
                    Device / Instance ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={wassapiDeviceId}
                    onChange={(e) => setWassapiDeviceId(e.target.value)}
                    placeholder="e.g. instance_01"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Dispatch Response / Direct Launch */}
            {whatsappResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                  whatsappResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border-red-500/40 text-red-200'
                }`}
              >
                <div className="font-bold">{whatsappResult.message}</div>
                {whatsappResult.waDirectUrl && (
                  <div className="pt-2">
                    <a
                      href={whatsappResult.waDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-slate-950 font-bold text-xs shadow-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Message in WhatsApp Now</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={whatsappSending}
                onClick={handleDispatchWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-cinzel font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {whatsappSending
                    ? 'Dispatching via Wassapi...'
                    : 'Send Report via Wassapi / WhatsApp'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
