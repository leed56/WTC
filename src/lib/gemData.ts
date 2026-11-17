export interface GemCertificate {
  reportNumber: string;
  issueDate: string;
  stoneType: 'Natural' | 'Heated' | 'Synthetic' | 'Treated';
  species: string;
  variety: string;
  shapeAndCut: string;
  weight: string; // in carats e.g. "1.25 Carats"
  dimensions: string; // e.g. "7.10 x 5.20 x 3.40 mm"
  color: string; // e.g. "Blue", "Royal Blue", "Pigeon Blood Red"
  transparency: string; // e.g. "Transparent", "Semi-Transparent"
  treatment: string;
  treatmentDetails?: string;
  originOpinion?: string;
  refractiveIndex?: string;
  birefringence?: string;
  opticCharacter?: string;
  specificGravity?: string;
  fluorescence?: string;
  microscopicObservations: string;
  comments: string;
  imageUrl: string;
  microscopeImageUrl?: string;
  showMicroscopeOnReport?: boolean;
  gemologistName?: string;
  secondGemologistName?: string;
  clientName?: string;
  clientPhone?: string;
  qrCodeUrl?: string;
  securityHash: string;
  status: 'Issued' | 'Archived';
}

export const LAB_CONTACT_INFO = {
  name: "WTC GEM LAB",
  tagline: "International Standards. Trusted Certainty.",
  subtagline: "Your Trusted Gemological Partner in Sri Lanka and Beyond",
  motto: "ANALYSE • IDENTIFY • ASSURE",
  address: "World Trade Center, No 26, 5th floor, Colombo 01, Sri Lanka",
  phone: "+94 77 058 5935",
  mobile: "+94 77 058 5935",
  email: "inquiry@wtcgemlab.lk",
  website: "www.wtcgemlab.lk",
  hours: "Monday – Friday: 9:00 AM – 6:00 PM (Sat: 9:00 AM – 2:00 PM)"
};

export const INITIAL_CERTIFICATES: GemCertificate[] = [
  {
    reportNumber: "WTC-26-000125",
    issueDate: "2026-11-07",
    stoneType: "Natural",
    species: "Natural Corundum",
    variety: "Natural Blue Sapphire",
    shapeAndCut: "Oval Mixed Cut",
    weight: "1.25 Carats",
    dimensions: "7.10 × 5.20 × 3.40 mm",
    color: "Blue",
    transparency: "Transparent",
    treatment: "As determined by examination (No evidence of significant treatment)",
    treatmentDetails: "Tested for thermal alteration; natural rutile needles and intact fluid inclusions confirm unheated state.",
    originOpinion: "Sri Lanka (Ceylon)",
    refractiveIndex: "1.762 - 1.770",
    specificGravity: "4.00",
    fluorescence: "Inert under Longwave & Shortwave UV",
    microscopicObservations: "Natural gemstone with no indications of synthetic origin. Intact natural silk (rutile) and characteristic natural healing fissures.",
    comments: "This report is issued for identification purposes only and does not constitute a valuation.",
    imageUrl: "/brand/wtc_pvc_card.jpeg",
    securityHash: "WTC-26-AUTH-000125-LK",
    status: "Issued"
  },
  {
    reportNumber: "WTC-26-000284",
    issueDate: "2026-11-08",
    stoneType: "Heated",
    species: "Natural Corundum",
    variety: "Natural Ruby",
    shapeAndCut: "Oval Mixed Cut",
    weight: "2.18 Carats",
    dimensions: "8.15 × 6.40 × 4.25 mm",
    color: "Pigeon Blood Red",
    transparency: "Transparent",
    treatment: "Indications of Thermal Treatment (Heated)",
    treatmentDetails: "Traditional thermal treatment detected. Partially dissolved rutile silk and altered discoid stress fractures observed under magnification.",
    originOpinion: "Mozambique",
    refractiveIndex: "1.760 - 1.768",
    specificGravity: "4.00",
    fluorescence: "Strong Red under LWUV, Moderate Red under SWUV",
    microscopicObservations: "Partially dissolved silk, discoid thermal expansion halos around crystal inclusions. No lead-glass or resin residues detected.",
    comments: "Traditional heat treatment to enhance clarity and color. Natural origin confirmed.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    securityHash: "WTC-26-AUTH-000284-LK",
    status: "Issued"
  },
  {
    reportNumber: "WTC-26-000392",
    issueDate: "2026-11-09",
    stoneType: "Synthetic",
    species: "Synthetic Beryl",
    variety: "Synthetic Hydrothermal Emerald",
    shapeAndCut: "Emerald Cut (Octagonal Step Cut)",
    weight: "2.40 Carats",
    dimensions: "8.50 × 6.30 × 4.60 mm",
    color: "Vivid Emerald Green",
    transparency: "Transparent",
    treatment: "Synthetic (Laboratory Created - Hydrothermal)",
    treatmentDetails: "Identified as laboratory-grown emerald created via hydrothermal synthesis.",
    originOpinion: "Laboratory Created",
    refractiveIndex: "1.568 - 1.574",
    specificGravity: "2.68",
    fluorescence: "Moderate Orangey-Red under LWUV",
    microscopicObservations: "Distinct chevron/wavy growth patterns and hydrothermal two-phase nail-head spicules characteristic of hydrothermal synthesis.",
    comments: "Laboratory-grown gemstone possessing chemical, physical, and optical properties equivalent to natural emerald.",
    imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=800&auto=format&fit=crop",
    securityHash: "WTC-26-AUTH-000392-LK",
    status: "Issued"
  },
  {
    reportNumber: "WTC-26-000415",
    issueDate: "2026-11-05",
    stoneType: "Natural",
    species: "Natural Spinel",
    variety: "Natural Cobalt Blue Spinel",
    shapeAndCut: "Cushion Brilliant",
    weight: "3.15 Carats",
    dimensions: "8.90 × 7.60 × 5.10 mm",
    color: "Vivid Cobalt Blue",
    transparency: "Transparent",
    treatment: "No Indications of Any Treatment (Untreated)",
    treatmentDetails: "Screened for heating and diffusion. Completely natural and untreated specimen.",
    originOpinion: "Sri Lanka (Ceylon)",
    refractiveIndex: "1.718 (Isotropic)",
    specificGravity: "3.60",
    fluorescence: "Inert under LWUV and SWUV",
    microscopicObservations: "Iron-stained healed tension fractures, minute octahedral inclusions, and typical singly refracting optic character.",
    comments: "Rare untreated Ceylon cobalt blue spinel with vibrant electric luster.",
    imageUrl: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?q=80&w=800&auto=format&fit=crop",
    securityHash: "WTC-26-AUTH-000415-LK",
    status: "Issued"
  }
];

export const SERVICE_CATEGORIES = [
  {
    id: "natural-screening",
    title: "Gemstone Identification",
    subtitle: "Accurate Species & Variety Verification",
    description: "Determines whether a gemstone is genuine natural mineral formed in the earth or an imitation, glass, composite, or synthetic counterpart.",
    turnaround: "Same Day – 24 Hours",
    priceRange: "LKR 300 – 4,500",
    features: [
      "Species and mineral variety determination",
      "Optical characterization & Refractive Index testing",
      "Specific gravity & hydrostatic density measurement",
      "Detailed microscopic inclusion mapping",
      "Official WTC Gem Lab Digital QR & Hardcopy Report"
    ]
  },
  {
    id: "treatment-screening",
    title: "Treatment Analysis",
    subtitle: "Heated vs. Unheated Determination",
    description: "Critical screening for Corundum (Sapphire & Ruby) and other gemstones to detect thermal modification, lattice diffusion, lead-glass filling, or clarity oils.",
    turnaround: "24 – 48 Hours",
    priceRange: "LKR 1,200 – 4,500",
    features: [
      "Discrimination between unheated and thermally heated stones",
      "Inspection of internal stress halos & rutile dissolution",
      "Detection of surface diffusion, oiling, or polymer filling",
      "Explicit statement on report: 'Unheated' or 'Heated'",
      "High-resolution photographic documentation"
    ]
  },
  {
    id: "synthetic-screening",
    title: "Synthetic & Simulant Discrimination",
    subtitle: "Laboratory-Created & Imitation Detection",
    description: "Definitive separation of natural gemstones from flux-grown, hydrothermal, flame fusion synthetics, glass imitations, and composite stones.",
    turnaround: "Same Day – 24 Hours",
    priceRange: "LKR 300 – 4,500",
    features: [
      "Detection of diagnostic synthetic growth structures",
      "Multi-wavelength ultraviolet luminescence profiling",
      "Gas bubble, flux veil, and seed plate microscopic analysis",
      "Explicit statement on report: 'Synthetic' or 'Natural'"
    ]
  },
  {
    id: "physical-constants",
    title: "Physical & Optical Constants Testing",
    subtitle: "Precision Instrument Measurements",
    description: "Systematic scientific assessment using sodium-light refractometry, hydrostatic specific gravity, and polariscopic strain analysis.",
    turnaround: "Same Day (Express Available)",
    priceRange: "LKR 300 – 4,500",
    features: [
      "Accurate Refractive Index (R.I.) and birefringence testing",
      "Hydrostatic micro-balance density calculation",
      "Crossed polarizers strain and optical character determination",
      "Precise digital millimeter measurement and weight recording"
    ]
  }
];

export const METHODOLOGY_STEPS = [
  {
    step: "01",
    title: "Optical Gemological Microscopy",
    description: "Using precision stereomicroscopes with darkfield, brightfield, polarized, and fiber-optic illumination. Gemologists examine natural vs synthetic growth lines, fluid inclusions, two/three-phase inclusions, and diagnostic thermal halos that confirm or rule out heat treatment."
  },
  {
    step: "02",
    title: "Refractometry & Birefringence",
    description: "Measurement of the exact Refractive Index (R.I.) and double refraction using gemological refractometers with monochromatic sodium light filters, conclusively identifying mineral species and optical character."
  },
  {
    step: "03",
    title: "Hydrostatic Specific Gravity Testing",
    description: "Precision density measurement using high-accuracy electronic micro-balances, validating gemstone mass against exact mineral specific gravities."
  },
  {
    step: "04",
    title: "Polariscopic Strain & Optic Axis Analysis",
    description: "Crossed polarizers reveal isotropic vs. anisotropic optical behavior, optic sign, and anomalous strain birefringence indicative of synthetic growth or treatment."
  },
  {
    step: "05",
    title: "Shortwave & Longwave UV Fluorescence",
    description: "Multi-wavelength ultraviolet inspection detects diagnostic luminescence, chalky synthetic fluorescence, and phosphorescence indicative of synthetic emeralds, rubies, or treated corundum."
  },
  {
    step: "06",
    title: "Spectroscopic Absorption Analysis",
    description: "Direct-vision and diffraction-grating gem spectroscopes identify characteristic optical absorption bands (such as the 450nm iron line in natural blue sapphires or chromium lines in rubies)."
  }
];
