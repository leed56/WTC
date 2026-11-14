export interface GemConstantRecord {
  id: string;
  species: string;
  defaultVariety: string;
  category: 'Natural' | 'Synthetic' | 'Simulant';
  riMin: number;
  riMax: number;
  birefringenceMin: number;
  birefringenceMax: number;
  isOTL?: boolean; // Over the limit of standard refractometer (> 1.81)
  opticCharacter: string;
  sgMin: number;
  sgMax: number;
  sgTypical: number;
  dispersion?: string;
  uvFluorescence: string;
  colorVarietyMap: Record<string, string>; // hue -> specific variety name
  diagnosticNotes: string;
  defaultMicroscopic: string;
}

export interface GemColorSwatch {
  id: string;
  tradeName: string;
  hueFamily: 'Blue' | 'Red' | 'Pink' | 'Pinkish-Orange' | 'Orange' | 'Yellow' | 'Green' | 'Violet' | 'Purple' | 'Padparadscha' | 'Brown' | 'Colorless' | 'Color-Change';
  hex: string;
  gradient: string;
}

export interface InclusionRule {
  id: string;
  label: string;
  category: 'unheated' | 'heated' | 'treated' | 'synthetic';
  observationText: string;
  conclusionImpact: {
    stoneType: 'Natural' | 'Heated' | 'Synthetic' | 'Treated';
    treatmentTitle: string;
    commentAddition: string;
  };
}

export const GEM_COLOR_SWATCHES: GemColorSwatch[] = [
  {
    id: 'royal-blue',
    tradeName: 'Vivid Royal Blue',
    hueFamily: 'Blue',
    hex: '#1E3A8A',
    gradient: 'from-blue-700 via-blue-800 to-indigo-950'
  },
  {
    id: 'cornflower-blue',
    tradeName: 'Cornflower Blue',
    hueFamily: 'Blue',
    hex: '#3B82F6',
    gradient: 'from-blue-400 via-blue-500 to-blue-700'
  },
  {
    id: 'medium-blue',
    tradeName: 'Medium Intense Blue',
    hueFamily: 'Blue',
    hex: '#2563EB',
    gradient: 'from-sky-500 via-blue-600 to-blue-800'
  },
  {
    id: 'cobalt-blue',
    tradeName: 'Vivid Cobalt Blue',
    hueFamily: 'Blue',
    hex: '#1D4ED8',
    gradient: 'from-blue-500 via-indigo-600 to-blue-900'
  },
  {
    id: 'pigeon-blood-red',
    tradeName: 'Pigeon Blood Red',
    hueFamily: 'Red',
    hex: '#B91C1C',
    gradient: 'from-red-600 via-red-700 to-rose-950'
  },
  {
    id: 'vivid-red',
    tradeName: 'Vivid Crimson Red',
    hueFamily: 'Red',
    hex: '#DC2626',
    gradient: 'from-red-500 via-red-600 to-red-800'
  },
  {
    id: 'padparadscha',
    tradeName: 'Pinkish-Orange (Padparadscha)',
    hueFamily: 'Padparadscha',
    hex: '#FB7185',
    gradient: 'from-rose-400 via-orange-400 to-pink-600'
  },
  {
    id: 'vivid-pink',
    tradeName: 'Vivid Hot Pink',
    hueFamily: 'Pink',
    hex: '#EC4899',
    gradient: 'from-pink-400 via-pink-600 to-rose-700'
  },
  {
    id: 'emerald-green',
    tradeName: 'Vivid Emerald Green',
    hueFamily: 'Green',
    hex: '#059669',
    gradient: 'from-emerald-400 via-emerald-600 to-teal-900'
  },
  {
    id: 'forest-green',
    tradeName: 'Intense Mint / Forest Green',
    hueFamily: 'Green',
    hex: '#16A34A',
    gradient: 'from-green-500 via-emerald-600 to-green-900'
  },
  {
    id: 'canary-yellow',
    tradeName: 'Vivid Canary Yellow',
    hueFamily: 'Yellow',
    hex: '#EAB308',
    gradient: 'from-yellow-300 via-amber-400 to-yellow-600'
  },
  {
    id: 'golden-orange',
    tradeName: 'Imperial Mandarin Orange',
    hueFamily: 'Orange',
    hex: '#EA580C',
    gradient: 'from-amber-500 via-orange-600 to-red-700'
  },
  {
    id: 'royal-purple',
    tradeName: 'Royal Violet-Purple',
    hueFamily: 'Purple',
    hex: '#7C3AED',
    gradient: 'from-purple-500 via-violet-700 to-indigo-950'
  },
  {
    id: 'honey-brown',
    tradeName: 'Golden Honey / Champagne',
    hueFamily: 'Brown',
    hex: '#B45309',
    gradient: 'from-amber-600 via-yellow-800 to-stone-900'
  },
  {
    id: 'color-change',
    tradeName: 'Greenish-Blue to Purplish-Red (Color-Change)',
    hueFamily: 'Color-Change',
    hex: '#0D9488',
    gradient: 'from-teal-500 via-purple-600 to-rose-700'
  },
  {
    id: 'colorless-white',
    tradeName: 'Colorless / Pure White',
    hueFamily: 'Colorless',
    hex: '#E2E8F0',
    gradient: 'from-slate-100 via-slate-300 to-slate-500'
  }
];

export const GEM_CONSTANTS_DB: GemConstantRecord[] = [
  {
    id: 'opal',
    species: 'Natural Opal',
    defaultVariety: 'Natural Precious Opal',
    category: 'Natural',
    riMin: 1.370,
    riMax: 1.470,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Amorphous — S.R. / Patchy ADR)',
    sgMin: 1.98,
    sgMax: 2.25,
    sgTypical: 2.15,
    uvFluorescence: 'White/Light Opal: Inert to Moderate Bluish-White or Greenish under LW/SWUV',
    colorVarietyMap: {
      Colorless: 'Natural Crystal / White Opal',
      Orange: 'Natural Mexican Fire Opal',
      Red: 'Natural Reddish-Orange Fire Opal',
      Blue: 'Natural Blue Opal',
      Green: 'Natural Black / Boulder Opal',
      Yellow: 'Natural Honey / Fire Opal'
    },
    diagnosticNotes: 'Very low R.I. (1.44–1.46 typical, down to 1.37 in hydrophane) and low S.G. (~2.15); precious opal exhibits play-of-color diffraction.',
    defaultMicroscopic: 'Three-dimensional silica sphere diffraction (play-of-color patches), "lizard-skin" or columnar structure in hydrophane opal.'
  },
  {
    id: 'fluorite',
    species: 'Natural Fluorite',
    defaultVariety: 'Natural Fluorite',
    category: 'Natural',
    riMin: 1.432,
    riMax: 1.436,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 3.16,
    sgMax: 3.20,
    sgTypical: 3.18,
    uvFluorescence: 'Strong Violet-Blue under LWUV',
    colorVarietyMap: {
      Purple: 'Natural Purple Fluorite',
      Violet: 'Natural Violet Fluorite',
      Green: 'Natural Emerald-Green Fluorite',
      Blue: 'Natural Blue Fluorite',
      Yellow: 'Natural Yellow Fluorite',
      'Color-Change': 'Natural Color-Change Fluorite'
    },
    diagnosticNotes: 'Very low R.I. (1.434) with higher S.G. (3.18) than Opal; strong LWUV blue-violet fluorescence and octahedral cleavage.',
    defaultMicroscopic: 'Two-phase and three-phase fluid inclusions, sharp angular color banding, and incipient octahedral cleavage.'
  },
  {
    id: 'moldavite',
    species: 'Natural Tektite Glass (Moldavite)',
    defaultVariety: 'Natural Moldavite',
    category: 'Natural',
    riMin: 1.480,
    riMax: 1.510,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Amorphous — S.R.)',
    sgMin: 2.30,
    sgMax: 2.45,
    sgTypical: 2.38,
    uvFluorescence: 'Inert under LWUV and SWUV',
    colorVarietyMap: {
      Green: 'Natural Forest-Green Moldavite'
    },
    diagnosticNotes: 'Natural impact glass with lechatelierite (worm-like silica glass) inclusions and elongated gas bubbles.',
    defaultMicroscopic: 'Flow swirl marks, elongated gas bubbles, and diagnostic worm-like lechatelierite inclusions.'
  },
  {
    id: 'feldspar-moonstone',
    species: 'Natural Feldspar (Orthoclase)',
    defaultVariety: 'Natural Moonstone',
    category: 'Natural',
    riMin: 1.518,
    riMax: 1.526,
    birefringenceMin: 0.005,
    birefringenceMax: 0.008,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (-)',
    sgMin: 2.56,
    sgMax: 2.59,
    sgTypical: 2.57,
    uvFluorescence: 'Weak Blue or Orange under LWUV/SWUV',
    colorVarietyMap: {
      Blue: 'Natural Blue-Sheen Moonstone',
      Colorless: 'Natural Rainbow / White Moonstone',
      Orange: 'Natural Peach Moonstone',
      Yellow: 'Natural Golden Orthoclase'
    },
    diagnosticNotes: 'Classic Sri Lankan adularescence (blue/white sheen) with characteristic "centipede" cleavage tension cracks.',
    defaultMicroscopic: 'Diagnostic "centipede" inclusions (stress cracks intersecting twin lamellae) and exsolution lamellae.'
  },
  {
    id: 'feldspar-labradorite',
    species: 'Natural Feldspar (Plagioclase)',
    defaultVariety: 'Natural Labradorite / Sunstone',
    category: 'Natural',
    riMin: 1.530,
    riMax: 1.572,
    birefringenceMin: 0.007,
    birefringenceMax: 0.010,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+/-)',
    sgMin: 2.62,
    sgMax: 2.72,
    sgTypical: 2.68,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Blue: 'Natural Blue-Flash Labradorite',
      Orange: 'Natural Oregon Sunstone',
      Red: 'Natural Red Sunstone',
      Yellow: 'Natural Golden Labradorite'
    },
    diagnosticNotes: 'Exhibits labradorescence (iridescent sheen) or aventurescence from oriented copper/hematite platelets.',
    defaultMicroscopic: 'Polysynthetic twin striations and oriented reflective metallic platelets.'
  },
  {
    id: 'chalcedony',
    species: 'Natural Cryptocrystalline Quartz (Chalcedony)',
    defaultVariety: 'Natural Chalcedony / Agate',
    category: 'Natural',
    riMin: 1.530,
    riMax: 1.540,
    birefringenceMin: 0.004,
    birefringenceMax: 0.004,
    opticCharacter: 'Aggregate Reaction (AGG)',
    sgMin: 2.58,
    sgMax: 2.64,
    sgTypical: 2.60,
    uvFluorescence: 'Inert to Weak Greenish-Yellow under SWUV',
    colorVarietyMap: {
      Green: 'Natural Chrysoprase',
      Orange: 'Natural Carnelian',
      Blue: 'Natural Blue Chalcedony',
      Red: 'Natural Sard / Red Agate'
    },
    diagnosticNotes: 'Microcrystalline quartz aggregate; spot R.I. ~1.535 with translucent waxy-to-vitreous luster.',
    defaultMicroscopic: 'Fibrous banded microcrystalline structure.'
  },
  {
    id: 'amber',
    species: 'Natural Amber (Fossilized Resin)',
    defaultVariety: 'Natural Baltic / Burmese Amber',
    category: 'Natural',
    riMin: 1.539,
    riMax: 1.545,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Amorphous — S.R.)',
    sgMin: 1.05,
    sgMax: 1.10,
    sgTypical: 1.08,
    uvFluorescence: 'Strong Chalky Blue / Yellow-Green under LWUV',
    colorVarietyMap: {
      Yellow: 'Natural Golden Amber',
      Orange: 'Natural Cognac Amber',
      Brown: 'Natural Cherry / Dark Amber'
    },
    diagnosticNotes: 'Extremely low S.G. (1.08 — floats in saturated salt water) and warm resinous touch.',
    defaultMicroscopic: 'Flow lines, spherical gas bubbles, and preserved botanical/insect organic inclusions.'
  },
  {
    id: 'iolite',
    species: 'Natural Cordierite (Iolite)',
    defaultVariety: 'Natural Iolite',
    category: 'Natural',
    riMin: 1.540,
    riMax: 1.578,
    birefringenceMin: 0.008,
    birefringenceMax: 0.012,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (-)',
    sgMin: 2.57,
    sgMax: 2.61,
    sgTypical: 2.59,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Blue: 'Natural Violet-Blue Iolite',
      Violet: 'Natural Violet Iolite',
      Purple: 'Natural Purplish-Blue Iolite'
    },
    diagnosticNotes: 'Extreme pleochroism (Violet-Blue, Pale Blue, and Colorless/Yellowish-Gray); lower R.I. and S.G. than Tanzanite and Sapphire.',
    defaultMicroscopic: 'Oriented reddish hematite/goethite platelets ("bloodshot iolite") and rounded zircon halos.'
  },
  {
    id: 'scapolite',
    species: 'Natural Scapolite',
    defaultVariety: 'Natural Golden / Violet Scapolite',
    category: 'Natural',
    riMin: 1.540,
    riMax: 1.607,
    birefringenceMin: 0.004,
    birefringenceMax: 0.037,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 2.56,
    sgMax: 2.77,
    sgTypical: 2.68,
    uvFluorescence: 'Yellow/Colorless: Strong Orange-Yellow under LWUV; Violet: Weak Red',
    colorVarietyMap: {
      Yellow: 'Natural Golden Scapolite',
      Violet: 'Natural Violet Cat’s Eye Scapolite',
      Purple: 'Natural Purple Scapolite',
      Pink: 'Natural Pink Scapolite'
    },
    diagnosticNotes: 'Strong orange-yellow LWUV fluorescence in golden varieties; uniaxial (-) optic figure.',
    defaultMicroscopic: 'Parallel needle-like growth tubes and two-phase fluid inclusions.'
  },
  {
    id: 'quartz',
    species: 'Natural Quartz',
    defaultVariety: 'Natural Amethyst',
    category: 'Natural',
    riMin: 1.544,
    riMax: 1.553,
    birefringenceMin: 0.009,
    birefringenceMax: 0.009,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (+)',
    sgMin: 2.64,
    sgMax: 2.67,
    sgTypical: 2.65,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Purple: 'Natural Amethyst',
      Violet: 'Natural Amethyst',
      Yellow: 'Natural Citrine',
      Orange: 'Natural Madeira Citrine',
      Pink: 'Natural Rose Quartz',
      Brown: 'Natural Smoky Quartz',
      Colorless: 'Natural Rock Crystal Quartz'
    },
    diagnosticNotes: 'Constant R.I. (1.544–1.553) and S.G. (2.65) with diagnostic bull’s-eye optic figure under conoscope.',
    defaultMicroscopic: 'Tiger-stripe / zebra-stripe Brazil-law twin lamellae and two-phase liquid feathers.'
  },
  {
    id: 'coral',
    species: 'Natural Calcareous Coral',
    defaultVariety: 'Natural Precious Coral',
    category: 'Natural',
    riMin: 1.486,
    riMax: 1.658,
    birefringenceMin: 0.172,
    birefringenceMax: 0.172,
    opticCharacter: 'Aggregate Reaction (AGG — Spot ~1.55)',
    sgMin: 2.60,
    sgMax: 2.70,
    sgTypical: 2.65,
    uvFluorescence: 'Inert to Weak Orange-Pink',
    colorVarietyMap: {
      Red: 'Natural Oxblood / Momo Red Coral',
      Pink: 'Natural Angel-Skin Pink Coral',
      Colorless: 'Natural White Coral'
    },
    diagnosticNotes: 'Fine parallel longitudinal striations ("wood-grain" structure) and calcareous composition.',
    defaultMicroscopic: 'Parallel wavy longitudinal striations and pinpoint surface pits.'
  },
  {
    id: 'beryl-emerald',
    species: 'Natural Beryl',
    defaultVariety: 'Natural Emerald',
    category: 'Natural',
    riMin: 1.565,
    riMax: 1.602,
    birefringenceMin: 0.004,
    birefringenceMax: 0.009,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 2.67,
    sgMax: 2.78,
    sgTypical: 2.72,
    uvFluorescence: 'Usually Inert to Weak Red under LWUV',
    colorVarietyMap: {
      Green: 'Natural Emerald',
      Blue: 'Natural Aquamarine',
      Pink: 'Natural Morganite',
      'Pinkish-Orange': 'Natural Morganite',
      Yellow: 'Natural Heliodor (Golden Beryl)',
      Colorless: 'Natural Goshenite'
    },
    diagnosticNotes: 'Classic multi-phase (liquid-gas-crystal) jagged inclusions in Emerald; rain-like parallel growth tubes in Aquamarine.',
    defaultMicroscopic: 'Natural two-phase and three-phase fluid inclusions, mica/actinolite platelets, and natural healed fissures.'
  },
  {
    id: 'nephrite',
    species: 'Natural Nephrite Jade',
    defaultVariety: 'Natural Nephrite Jade',
    category: 'Natural',
    riMin: 1.600,
    riMax: 1.627,
    birefringenceMin: 0.027,
    birefringenceMax: 0.027,
    opticCharacter: 'Aggregate Reaction (AGG — Spot ~1.61)',
    sgMin: 2.90,
    sgMax: 3.10,
    sgTypical: 2.95,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Green: 'Natural Spinach-Green Nephrite Jade',
      Colorless: 'Natural Mutton-Fat White Nephrite'
    },
    diagnosticNotes: 'Felted fibrous tremolite-actinolite aggregate; lower R.I. (~1.61) and S.G. (~2.95) than Jadeite.',
    defaultMicroscopic: 'Interlocking fibrous tremolite-actinolite mat texture.'
  },
  {
    id: 'topaz',
    species: 'Natural Topaz',
    defaultVariety: 'Natural Imperial Topaz',
    category: 'Natural',
    riMin: 1.609,
    riMax: 1.643,
    birefringenceMin: 0.008,
    birefringenceMax: 0.011,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.49,
    sgMax: 3.57,
    sgTypical: 3.53,
    uvFluorescence: 'Imperial/Pink: Weak Orange-Yellow under LWUV; Blue: Inert to weak green',
    colorVarietyMap: {
      Blue: 'Natural Blue Topaz',
      Orange: 'Natural Imperial Topaz',
      Pink: 'Natural Pink Imperial Topaz',
      Yellow: 'Natural Golden Topaz',
      Colorless: 'Natural White Topaz'
    },
    diagnosticNotes: 'Separates easily from Tourmaline and Quartz by its high Specific Gravity (~3.53) and low birefringence (0.008–0.010).',
    defaultMicroscopic: 'Two-phase and three-phase cavities containing immiscible liquids, and basal cleavage planes.'
  },
  {
    id: 'turquoise',
    species: 'Natural Turquoise',
    defaultVariety: 'Natural Turquoise',
    category: 'Natural',
    riMin: 1.610,
    riMax: 1.650,
    birefringenceMin: 0.040,
    birefringenceMax: 0.040,
    opticCharacter: 'Aggregate Reaction (AGG — Spot ~1.61)',
    sgMin: 2.60,
    sgMax: 2.90,
    sgTypical: 2.76,
    uvFluorescence: 'Weak Greenish-Yellow to Inert under LWUV',
    colorVarietyMap: {
      Blue: 'Natural Robin’s-Egg Blue Turquoise',
      Green: 'Natural Greenish-Blue Turquoise'
    },
    diagnosticNotes: 'Cryptocrystalline opaque-to-semitranslucent aggregate with ~1.61 spot R.I. and characteristic matrix veining.',
    defaultMicroscopic: 'Fine granular matte-to-waxy surface with limonite or sandstone matrix veins.'
  },
  {
    id: 'tourmaline',
    species: 'Natural Tourmaline',
    defaultVariety: 'Natural Tourmaline',
    category: 'Natural',
    riMin: 1.618,
    riMax: 1.648,
    birefringenceMin: 0.018,
    birefringenceMax: 0.040,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 3.01,
    sgMax: 3.26,
    sgTypical: 3.06,
    uvFluorescence: 'Usually Inert; Pink/Rubellite may show weak violet under SWUV',
    colorVarietyMap: {
      Red: 'Natural Rubellite Tourmaline',
      Pink: 'Natural Pink Tourmaline',
      Green: 'Natural Verdelite (Green) Tourmaline',
      Blue: 'Natural Indicolite / Paraiba-Type Tourmaline',
      Yellow: 'Natural Canary Tourmaline'
    },
    diagnosticNotes: 'High birefringence (0.018–0.022) causing strong doubling of back facet junctions and strong pleochroism.',
    defaultMicroscopic: 'Thread-like trichites (irregular liquid-gas capillaries) and hollow growth tubes parallel to the c-axis.'
  },
  {
    id: 'apatite',
    species: 'Natural Apatite',
    defaultVariety: 'Natural Neon Blue-Green Apatite',
    category: 'Natural',
    riMin: 1.628,
    riMax: 1.649,
    birefringenceMin: 0.002,
    birefringenceMax: 0.006,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 3.16,
    sgMax: 3.23,
    sgTypical: 3.20,
    uvFluorescence: 'Yellow: Violet-Pink under LWUV; Blue: Weak-Moderate Violet-Blue',
    colorVarietyMap: {
      Blue: 'Natural Paraiba-Color Neon Blue Apatite',
      Green: 'Natural Asparagus / Mint Green Apatite',
      Yellow: 'Natural Golden Apatite',
      Violet: 'Natural Violet Apatite'
    },
    diagnosticNotes: 'Similar R.I. to Tourmaline (~1.635) but MUCH lower birefringence (0.002–0.005) and diagnostic 580nm rare-earth spectrum.',
    defaultMicroscopic: 'Parallel growth tubes, fluid inclusions, and absence of strong facet-junction doubling.'
  },
  {
    id: 'andalusite',
    species: 'Natural Andalusite',
    defaultVariety: 'Natural Pleochroic Andalusite',
    category: 'Natural',
    riMin: 1.629,
    riMax: 1.649,
    birefringenceMin: 0.007,
    birefringenceMax: 0.013,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (-)',
    sgMin: 3.12,
    sgMax: 3.18,
    sgTypical: 3.15,
    uvFluorescence: 'Inert to Weak Yellow-Green under SWUV',
    colorVarietyMap: {
      Brown: 'Natural Green-to-Reddish-Brown Andalusite',
      Green: 'Natural Viridine Green Andalusite',
      Orange: 'Natural Orange-Brown Andalusite'
    },
    diagnosticNotes: 'Unmistakable olive-green and brownish-red pleochroism visible to the naked eye.',
    defaultMicroscopic: 'Fine needle-like inclusions and strong pleochroic color zoning.'
  },
  {
    id: 'danburite',
    species: 'Natural Danburite',
    defaultVariety: 'Natural Golden / Colorless Danburite',
    category: 'Natural',
    riMin: 1.630,
    riMax: 1.639,
    birefringenceMin: 0.006,
    birefringenceMax: 0.008,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+/-)',
    sgMin: 2.93,
    sgMax: 3.02,
    sgTypical: 3.00,
    uvFluorescence: 'Sky Blue to Blue-Green under LWUV',
    colorVarietyMap: {
      Colorless: 'Natural Colorless Danburite',
      Yellow: 'Natural Champagne / Yellow Danburite',
      Pink: 'Natural Pale Pink Danburite'
    },
    diagnosticNotes: 'Separated from Topaz by lower S.G. (~3.00 vs 3.53) and from Tourmaline by lower birefringence (~0.006).',
    defaultMicroscopic: 'Clean interior with occasional hollow tubes and two-phase liquid inclusions.'
  },
  {
    id: 'peridot',
    species: 'Natural Forsterite–Olivine (Peridot)',
    defaultVariety: 'Natural Peridot',
    category: 'Natural',
    riMin: 1.650,
    riMax: 1.690,
    birefringenceMin: 0.035,
    birefringenceMax: 0.038,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+/-)',
    sgMin: 3.28,
    sgMax: 3.44,
    sgTypical: 3.34,
    uvFluorescence: 'Inert under LWUV and SWUV',
    colorVarietyMap: {
      Green: 'Natural Lime / Olive Green Peridot',
      Yellow: 'Natural Yellowish-Green Peridot'
    },
    diagnosticNotes: 'Very high birefringence (0.036) with strong doubling of back facets and classic "lily-pad" discoid inclusions.',
    defaultMicroscopic: 'Classic "lily-pad" discoid cleavage halos around dark chromite/spinel octahedra.'
  },
  {
    id: 'sillimanite',
    species: 'Natural Sillimanite (Fibrolite)',
    defaultVariety: 'Natural Cat’s Eye / Blue Sillimanite',
    category: 'Natural',
    riMin: 1.653,
    riMax: 1.684,
    birefringenceMin: 0.015,
    birefringenceMax: 0.022,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.20,
    sgMax: 3.27,
    sgTypical: 3.25,
    uvFluorescence: 'Inert to Weak Red under LWUV',
    colorVarietyMap: {
      Blue: 'Natural Sri Lankan Blue Sillimanite',
      Brown: 'Natural Cat’s Eye Sillimanite',
      Colorless: 'Natural Colorless Sillimanite'
    },
    diagnosticNotes: 'Classic Sri Lankan collector gem; fibrous parallel needles produce sharp chatoyancy in cabochons.',
    defaultMicroscopic: 'Dense parallel fibrous needles and crystal inclusions.'
  },
  {
    id: 'jadeite',
    species: 'Natural Jadeite Jade',
    defaultVariety: 'Natural Imperial / Burmese Jadeite',
    category: 'Natural',
    riMin: 1.654,
    riMax: 1.693,
    birefringenceMin: 0.013,
    birefringenceMax: 0.020,
    opticCharacter: 'Aggregate Reaction (AGG — Spot ~1.66)',
    sgMin: 3.24,
    sgMax: 3.43,
    sgTypical: 3.34,
    uvFluorescence: 'Inert (B-type polymer-impregnated may fluoresce chalky blue under LWUV)',
    colorVarietyMap: {
      Green: 'Natural Imperial Green Jadeite',
      Purple: 'Natural Lavender Jadeite',
      Colorless: 'Natural Icy White Jadeite'
    },
    diagnosticNotes: 'Interlocking granular aggregate ("orange-peel" surface dimpling) with 437nm absorption line and S.G. ~3.34.',
    defaultMicroscopic: 'Granular interlocking pyroxene crystal texture with natural iron-stained grain boundaries (in A-jade).'
  },
  {
    id: 'spodumene',
    species: 'Natural Spodumene',
    defaultVariety: 'Natural Kunzite / Hiddenite',
    category: 'Natural',
    riMin: 1.660,
    riMax: 1.676,
    birefringenceMin: 0.014,
    birefringenceMax: 0.016,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.15,
    sgMax: 3.21,
    sgTypical: 3.18,
    uvFluorescence: 'Kunzite: Strong Orange-Pink under LWUV and SWUV',
    colorVarietyMap: {
      Pink: 'Natural Kunzite (Pink-Violet Spodumene)',
      Purple: 'Natural Lilac Kunzite',
      Green: 'Natural Hiddenite (Green Spodumene)',
      Yellow: 'Natural Triphane (Yellow Spodumene)'
    },
    diagnosticNotes: 'Strong pleochroism, pronounced cleavage planes, and vibrant orange-pink UV fluorescence in Kunzite.',
    defaultMicroscopic: 'Etch channels, cleavage feathers, and two-phase fluid inclusions.'
  },
  {
    id: 'diopside',
    species: 'Natural Diopside',
    defaultVariety: 'Natural Chrome Diopside',
    category: 'Natural',
    riMin: 1.663,
    riMax: 1.728,
    birefringenceMin: 0.024,
    birefringenceMax: 0.030,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.22,
    sgMax: 3.55,
    sgTypical: 3.29,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Green: 'Natural Chrome Diopside',
      Yellow: 'Natural Yellowish-Green Diopside',
      Brown: 'Natural Black Star Diopside'
    },
    diagnosticNotes: 'High birefringence (~0.028) showing strong back-facet doubling and chromium absorption spectrum.',
    defaultMicroscopic: 'Intersecting cleavage planes and oriented needle inclusions.'
  },
  {
    id: 'sinhalite',
    species: 'Natural Sinhalite',
    defaultVariety: 'Natural Golden-Brown Sinhalite',
    category: 'Natural',
    riMin: 1.665,
    riMax: 1.712,
    birefringenceMin: 0.036,
    birefringenceMax: 0.039,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (-)',
    sgMin: 3.45,
    sgMax: 3.51,
    sgTypical: 3.48,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Brown: 'Natural Champagne / Golden-Brown Sinhalite',
      Yellow: 'Natural Golden-Yellow Sinhalite',
      Green: 'Natural Greenish-Brown Sinhalite'
    },
    diagnosticNotes: 'Rare Sri Lankan borate mineral with high birefringence (0.037) and biaxial (-) sign; separated from Peridot by higher S.G. (~3.48).',
    defaultMicroscopic: 'Strong back-facet doubling and occasional acicular needles.'
  },
  {
    id: 'zoisite-tanzanite',
    species: 'Natural Zoisite',
    defaultVariety: 'Natural Tanzanite',
    category: 'Natural',
    riMin: 1.690,
    riMax: 1.702,
    birefringenceMin: 0.008,
    birefringenceMax: 0.013,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.30,
    sgMax: 3.38,
    sgTypical: 3.35,
    uvFluorescence: 'Inert under LWUV and SWUV',
    colorVarietyMap: {
      Violet: 'Natural Tanzanite (Blue-Violet Zoisite)',
      Blue: 'Natural Tanzanite',
      Purple: 'Natural Tanzanite',
      Green: 'Natural Chrome Green Zoisite'
    },
    diagnosticNotes: 'Strong trichroism (Blue, Violet-Purple, and Burgundy/Bronze depending on thermal state).',
    defaultMicroscopic: 'Clean interior with occasional parallel growth tubes and graphite platelets.'
  },
  {
    id: 'kyanite',
    species: 'Natural Kyanite',
    defaultVariety: 'Natural Royal Blue Kyanite',
    category: 'Natural',
    riMin: 1.712,
    riMax: 1.734,
    birefringenceMin: 0.012,
    birefringenceMax: 0.017,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (-)',
    sgMin: 3.53,
    sgMax: 3.68,
    sgTypical: 3.62,
    uvFluorescence: 'Inert to Weak Red under LWUV',
    colorVarietyMap: {
      Blue: 'Natural Sapphire-Blue Kyanite',
      Green: 'Natural Teal / Green Kyanite',
      Orange: 'Natural Orange Kyanite'
    },
    diagnosticNotes: 'Overlaps Spinel in R.I. (~1.72) and S.G. (~3.62) but is DOUBLY REFRACTING (birefringence 0.015) with strong pleochroism.',
    defaultMicroscopic: 'Pronounced parallel color banding, cleavage planes, and distinct double refraction.'
  },
  {
    id: 'spinel',
    species: 'Natural Spinel',
    defaultVariety: 'Natural Spinel',
    category: 'Natural',
    riMin: 1.712,
    riMax: 1.736,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 3.57,
    sgMax: 3.66,
    sgTypical: 3.60,
    uvFluorescence: 'Red/Pink: Strong Red (organ-pipe) under LWUV; Blue: Inert to weak',
    colorVarietyMap: {
      Red: 'Natural Red Spinel',
      Blue: 'Natural Cobalt Blue Spinel',
      Pink: 'Natural Mahenge / Vivid Pink Spinel',
      Purple: 'Natural Lavender / Purple Spinel',
      Orange: 'Natural Flame Orange Spinel',
      Violet: 'Natural Violet Spinel'
    },
    diagnosticNotes: 'Isotropic (singly refracting) with octahedral negative crystals; separates immediately from doubly refracting Corundum.',
    defaultMicroscopic: 'Minute octahedral negative crystals aligned in rows, iron-stained healed tension fractures, and singly refracting character.'
  },
  {
    id: 'taaffeite',
    species: 'Natural Taaffeite (Magnesiotaaffeite)',
    defaultVariety: 'Natural Mauve-Violet Taaffeite',
    category: 'Natural',
    riMin: 1.717,
    riMax: 1.725,
    birefringenceMin: 0.004,
    birefringenceMax: 0.006,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 3.59,
    sgMax: 3.63,
    sgTypical: 3.61,
    uvFluorescence: 'Inert to Weak Green under SWUV',
    colorVarietyMap: {
      Violet: 'Natural Mauve-Violet Taaffeite',
      Purple: 'Natural Purplish-Pink Taaffeite',
      Pink: 'Natural Pinkish-Mauve Taaffeite',
      Red: 'Natural Red Taaffeite'
    },
    diagnosticNotes: 'Overlaps Spinel in R.I. (~1.72) and S.G. (~3.61) but is DOUBLY REFRACTING (birefringence 0.004–0.005).',
    defaultMicroscopic: 'Apatite and zircon crystal inclusions, healed fingerprints, and distinct uniaxial interference figure.'
  },
  {
    id: 'garnet-grossular',
    species: 'Natural Grossular Garnet',
    defaultVariety: 'Natural Tsavorite Garnet',
    category: 'Natural',
    riMin: 1.730,
    riMax: 1.748,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 3.57,
    sgMax: 3.68,
    sgTypical: 3.61,
    uvFluorescence: 'Inert to Weak Orange under LWUV',
    colorVarietyMap: {
      Green: 'Natural Tsavorite Garnet',
      Orange: 'Natural Hessonite (Cinnamon) Garnet',
      Brown: 'Natural Hessonite Garnet',
      Yellow: 'Natural Grossular Garnet'
    },
    diagnosticNotes: 'Hessonite exhibits classic "treacle" / whiskey-in-water swirled appearance; Tsavorite shows graphite & apatite crystals.',
    defaultMicroscopic: 'Characteristic rounded diopside/apatite crystals and roiled heat-wave internal texture (in Hessonite).'
  },
  {
    id: 'garnet-pyrope-almandine',
    species: 'Natural Garnet (Pyrope–Almandine–Spessartine)',
    defaultVariety: 'Natural Rhodolite Garnet',
    category: 'Natural',
    riMin: 1.730,
    riMax: 1.820,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 3.70,
    sgMax: 4.30,
    sgTypical: 3.88,
    uvFluorescence: 'Inert under LWUV and SWUV (Iron quenched)',
    colorVarietyMap: {
      Red: 'Natural Almandine / Pyrope Garnet',
      Purple: 'Natural Rhodolite Garnet',
      Pink: 'Natural Malaya / Rhodolite Garnet',
      Orange: 'Natural Spessartine (Mandarin) Garnet'
    },
    diagnosticNotes: 'Isotropic with strong iron absorption bands at 504nm, 520nm, and 573nm; often shows anomalous strain.',
    defaultMicroscopic: 'Intersecting acicular rutile needles in 3 directions, rounded zircon crystals with stress halos.'
  },
  {
    id: 'chrysoberyl',
    species: 'Natural Chrysoberyl',
    defaultVariety: 'Natural Chrysoberyl',
    category: 'Natural',
    riMin: 1.744,
    riMax: 1.763,
    birefringenceMin: 0.008,
    birefringenceMax: 0.011,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.68,
    sgMax: 3.78,
    sgTypical: 3.73,
    uvFluorescence: 'Yellow/Green: Inert to weak; Alexandrite: Weak Red under LW/SWUV',
    colorVarietyMap: {
      Yellow: 'Natural Golden Chrysoberyl',
      Green: 'Natural Greenish-Yellow Chrysoberyl',
      Brown: 'Natural Honey Cymophane (Cat’s Eye Chrysoberyl)',
      'Color-Change': 'Natural Alexandrite'
    },
    diagnosticNotes: 'Strong 444nm iron band in yellow/green chrysoberyl; distinct chromium spectrum in Alexandrite.',
    defaultMicroscopic: 'Fine parallel silk needles, stepped twin planes, and two-phase liquid fingerprint inclusions.'
  },
  {
    id: 'corundum',
    species: 'Natural Corundum',
    defaultVariety: 'Natural Blue Sapphire',
    category: 'Natural',
    riMin: 1.760,
    riMax: 1.772,
    birefringenceMin: 0.008,
    birefringenceMax: 0.010,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 3.95,
    sgMax: 4.05,
    sgTypical: 4.00,
    uvFluorescence: 'Blue: Inert to weak; Red/Pink: Strong Red under LWUV',
    colorVarietyMap: {
      Blue: 'Natural Blue Sapphire',
      Red: 'Natural Ruby',
      Padparadscha: 'Natural Padparadscha Sapphire',
      'Pinkish-Orange': 'Natural Padparadscha Sapphire',
      Pink: 'Natural Pink Sapphire',
      Yellow: 'Natural Yellow Sapphire',
      Orange: 'Natural Orange Sapphire',
      Green: 'Natural Green Sapphire',
      Purple: 'Natural Purple Sapphire',
      Violet: 'Natural Violet Sapphire',
      'Color-Change': 'Natural Color-Change Sapphire',
      Colorless: 'Natural White Sapphire (Leucosapphire)'
    },
    diagnosticNotes: 'Diagnostic 450nm iron absorption complex in blue/yellow varieties; chromium emission lines at 692/694nm in Ruby.',
    defaultMicroscopic: 'Natural rutile silk needles intersecting at 60°/120°, angular hexagonal growth zoning, and healed liquid fingerprints.'
  },
  {
    id: 'sphene',
    species: 'Natural Titanite (Sphene)',
    defaultVariety: 'Natural Chrome / Golden Sphene',
    category: 'Natural',
    riMin: 1.843,
    riMax: 2.110,
    birefringenceMin: 0.100,
    birefringenceMax: 0.135,
    isOTL: true,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.45,
    sgMax: 3.55,
    sgTypical: 3.52,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Green: 'Natural Chrome Green Sphene',
      Yellow: 'Natural Golden-Yellow Sphene',
      Brown: 'Natural Honey-Brown Sphene'
    },
    diagnosticNotes: 'Over-the-limit (OTL > 1.81) with extreme birefringence (0.100–0.135) and fire exceeding diamond.',
    defaultMicroscopic: 'Extreme doubling of back-facet junctions and two-phase fluid inclusions.'
  },
  {
    id: 'garnet-demantoid',
    species: 'Natural Andradite Garnet (Demantoid)',
    defaultVariety: 'Natural Demantoid Garnet',
    category: 'Natural',
    riMin: 1.880,
    riMax: 1.940,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    isOTL: true,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 3.77,
    sgMax: 3.95,
    sgTypical: 3.85,
    uvFluorescence: 'Inert',
    colorVarietyMap: {
      Green: 'Natural Demantoid Garnet',
      Yellow: 'Natural Topazolite Garnet'
    },
    diagnosticNotes: 'OTL (>1.81) isotropic green garnet with high dispersion and diagnostic "horsetail" byssolite fiber inclusions.',
    defaultMicroscopic: 'Diagnostic radiating golden "horsetail" chrysotile/byssolite fiber bundles.'
  },
  {
    id: 'zircon',
    species: 'Natural Zircon',
    defaultVariety: 'Natural Starlight Blue Zircon',
    category: 'Natural',
    riMin: 1.810,
    riMax: 1.984,
    birefringenceMin: 0.035,
    birefringenceMax: 0.059,
    isOTL: true,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (+)',
    sgMin: 4.00,
    sgMax: 4.80,
    sgTypical: 4.68,
    uvFluorescence: 'Blue/Colorless: Weak to Moderate Mustard-Yellow under SWUV',
    colorVarietyMap: {
      Blue: 'Natural Starlight Blue Zircon',
      Brown: 'Natural Honey / Brown Zircon',
      Orange: 'Natural Orange-Brown Hyacinth Zircon',
      Red: 'Natural Hyacinth Red Zircon',
      Green: 'Natural Metamict Green Zircon',
      Yellow: 'Natural Golden Zircon',
      Colorless: 'Natural Matura White Zircon'
    },
    diagnosticNotes: 'Over-the-limit (OTL > 1.81) on standard refractometers with extreme facet doubling and high S.G. (~4.68).',
    defaultMicroscopic: 'Pronounced doubling of opposite facet junctions, angular growth zoning, and stress cracks.'
  },
  {
    id: 'synthetic-emerald',
    species: 'Synthetic Beryl (Hydrothermal / Flux)',
    defaultVariety: 'Synthetic Hydrothermal Emerald',
    category: 'Synthetic',
    riMin: 1.560,
    riMax: 1.576,
    birefringenceMin: 0.003,
    birefringenceMax: 0.006,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 2.65,
    sgMax: 2.70,
    sgTypical: 2.68,
    uvFluorescence: 'Moderate to Strong Crimson Red under LWUV and SWUV',
    colorVarietyMap: {
      Green: 'Synthetic Hydrothermal Emerald'
    },
    diagnosticNotes: 'Lower R.I. (1.561–1.574) and S.G. (2.66–2.69) than most natural emeralds.',
    defaultMicroscopic: 'Chevron/wavy growth structures, two-phase nail-head spicules clinging to phenakite crystals, or wispy flux veils.'
  },
  {
    id: 'synthetic-spinel',
    species: 'Synthetic Spinel (Flame Fusion)',
    defaultVariety: 'Synthetic Spinel',
    category: 'Synthetic',
    riMin: 1.725,
    riMax: 1.730,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting with strong Tabby / Cross-Hatch ADR',
    sgMin: 3.62,
    sgMax: 3.65,
    sgTypical: 3.64,
    uvFluorescence: 'Strong Chalky Blue or Greenish-White under SWUV',
    colorVarietyMap: {
      Blue: 'Synthetic Cobalt-Doped Blue Spinel',
      Green: 'Synthetic Green Spinel',
      Yellow: 'Synthetic Yellowish-Green Spinel',
      Colorless: 'Synthetic Colorless Spinel'
    },
    diagnosticNotes: 'Higher R.I. (~1.728) and S.G. (~3.64) than natural spinel (1.718 / 3.60) due to excess alumina; shows strong cross-hatch ADR.',
    defaultMicroscopic: 'Profiled gas bubbles, curved striae, and diagnostic cross-hatch anomalous double refraction (ADR) under polariscope.'
  },
  {
    id: 'synthetic-alexandrite',
    species: 'Synthetic Chrysoberyl (Czochralski / Flux)',
    defaultVariety: 'Synthetic Alexandrite',
    category: 'Synthetic',
    riMin: 1.744,
    riMax: 1.758,
    birefringenceMin: 0.008,
    birefringenceMax: 0.010,
    opticCharacter: 'Doubly Refracting (D.R.) — Biaxial (+)',
    sgMin: 3.70,
    sgMax: 3.74,
    sgTypical: 3.72,
    uvFluorescence: 'Strong Red under LWUV and SWUV',
    colorVarietyMap: {
      'Color-Change': 'Synthetic Alexandrite (Czochralski / Flux)',
      Purple: 'Synthetic Alexandrite',
      Green: 'Synthetic Alexandrite'
    },
    diagnosticNotes: 'Identical R.I. and S.G. to natural Alexandrite; separated by curved striae, flux veils, or strong red UV reaction.',
    defaultMicroscopic: 'Curved growth bands, triangular platinum platelets, or wispy flux fingerprints.'
  },
  {
    id: 'synthetic-corundum',
    species: 'Synthetic Corundum (Laboratory-Created)',
    defaultVariety: 'Synthetic Sapphire / Ruby (Flame Fusion)',
    category: 'Synthetic',
    riMin: 1.760,
    riMax: 1.770,
    birefringenceMin: 0.008,
    birefringenceMax: 0.009,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (-)',
    sgMin: 3.98,
    sgMax: 4.01,
    sgTypical: 4.00,
    uvFluorescence: 'Blue: Strong Chalky Greenish-Blue under SWUV; Red: Very Strong Red under LW/SWUV',
    colorVarietyMap: {
      Blue: 'Synthetic Blue Sapphire (Flame Fusion)',
      Red: 'Synthetic Ruby (Flame Fusion / Flux)',
      Pink: 'Synthetic Pink Sapphire',
      Yellow: 'Synthetic Yellow Sapphire',
      Padparadscha: 'Synthetic Padparadscha-Color Corundum'
    },
    diagnosticNotes: 'Shares identical R.I. (1.762–1.770) and S.G. (4.00) with natural corundum; separated by curved striae, gas bubbles, or flux veils.',
    defaultMicroscopic: 'Curved growth striae ("record grooves"), spherical or tadpole-shaped gas bubbles, and Plato sand-clock twinning.'
  },
  {
    id: 'yag-simulant',
    species: 'Synthetic YAG (Yttrium Aluminum Garnet)',
    defaultVariety: 'Synthetic YAG Simulant',
    category: 'Simulant',
    riMin: 1.830,
    riMax: 1.836,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    isOTL: true,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 4.50,
    sgMax: 4.60,
    sgTypical: 4.55,
    uvFluorescence: 'Inert to Weak Orange under LWUV',
    colorVarietyMap: {
      Colorless: 'Synthetic Colorless YAG',
      Green: 'Synthetic Chrome-Green YAG',
      Yellow: 'Synthetic Canary YAG'
    },
    diagnosticNotes: 'Man-made garnet structure (OTL >1.81) with high S.G. (~4.55).',
    defaultMicroscopic: 'Clean interior with occasional spherical gas bubbles and swirl striae.'
  },
  {
    id: 'ggg-simulant',
    species: 'Synthetic GGG (Gadolinium Gallium Garnet)',
    defaultVariety: 'Synthetic GGG Simulant',
    category: 'Simulant',
    riMin: 1.970,
    riMax: 2.030,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    isOTL: true,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 6.95,
    sgMax: 7.09,
    sgTypical: 7.05,
    uvFluorescence: 'Weak Orange-Pink under SWUV',
    colorVarietyMap: {
      Colorless: 'Synthetic Colorless GGG'
    },
    diagnosticNotes: 'Extremely high Specific Gravity (~7.05) and OTL R.I. (~1.97).',
    defaultMicroscopic: 'Clean interior with occasional metallic iridium/platinum platelets.'
  },
  {
    id: 'cubic-zirconia',
    species: 'Synthetic Cubic Zirconia (CZ)',
    defaultVariety: 'Synthetic Cubic Zirconia',
    category: 'Simulant',
    riMin: 2.150,
    riMax: 2.180,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    isOTL: true,
    opticCharacter: 'Singly Refracting (Isotropic — S.R.)',
    sgMin: 5.60,
    sgMax: 6.00,
    sgTypical: 5.80,
    uvFluorescence: 'Weak-to-Moderate Yellowish-Orange under LWUV',
    colorVarietyMap: {
      Colorless: 'Colorless Cubic Zirconia (CZ)',
      Pink: 'Pink Cubic Zirconia',
      Yellow: 'Canary Cubic Zirconia',
      Blue: 'Blue Cubic Zirconia'
    },
    diagnosticNotes: 'Very high S.G. (~5.80) and OTL R.I. (~2.15) with high dispersion.',
    defaultMicroscopic: 'Clean interior, rounded facet junctions, and occasional unmelted zirconia powder particles.'
  },
  {
    id: 'moissanite',
    species: 'Synthetic Silicon Carbide (Moissanite)',
    defaultVariety: 'Synthetic Moissanite',
    category: 'Simulant',
    riMin: 2.648,
    riMax: 2.691,
    birefringenceMin: 0.043,
    birefringenceMax: 0.043,
    isOTL: true,
    opticCharacter: 'Doubly Refracting (D.R.) — Uniaxial (+)',
    sgMin: 3.21,
    sgMax: 3.23,
    sgTypical: 3.22,
    uvFluorescence: 'Inert to Weak Orange under LWUV',
    colorVarietyMap: {
      Colorless: 'Colorless Synthetic Moissanite',
      Green: 'Green Synthetic Moissanite'
    },
    diagnosticNotes: 'Extreme OTL R.I. (2.65–2.69) and high birefringence (0.043) causing distinct doubling of pavilion facet edges.',
    defaultMicroscopic: 'Strong doubling of back-facet junctions and fine parallel white pinpoint needles.'
  },
  {
    id: 'glass-simulant',
    species: 'Man-Made Glass (Paste / Lead Glass)',
    defaultVariety: 'Manufactured Glass Imitation',
    category: 'Simulant',
    riMin: 1.480,
    riMax: 1.700,
    birefringenceMin: 0.000,
    birefringenceMax: 0.000,
    opticCharacter: 'Singly Refracting (Amorphous — S.R.)',
    sgMin: 2.35,
    sgMax: 4.10,
    sgTypical: 2.60,
    uvFluorescence: 'Chalky Blue, Greenish, or Inert under SWUV',
    colorVarietyMap: {
      Blue: 'Blue Glass Imitation',
      Red: 'Red Glass Imitation',
      Green: 'Green Glass Imitation',
      Yellow: 'Yellow Glass Imitation',
      Pink: 'Pink Glass Imitation'
    },
    diagnosticNotes: 'Amorphous (isotropic with snake-like anomalous strain); contains spherical gas bubbles and flow swirl marks.',
    defaultMicroscopic: 'Spherical/torpedo gas bubbles, flow swirl striae, concave conchoidal fracture surfaces, and warm thermal touch.'
  }
];

export const INCLUSION_DIAGNOSTIC_RULES: InclusionRule[] = [
  // UNHEATED NATURAL
  {
    id: 'intact-rutile-silk',
    label: 'Intact Unaltered Rutile Silk Needles (60°/120°)',
    category: 'unheated',
    observationText: 'Intact, sharp acicular rutile silk needles intersecting at 60°/120° with no thermal resorption.',
    conclusionImpact: {
      stoneType: 'Natural',
      treatmentTitle: 'No Indications of Thermal Treatment (Unheated)',
      commentAddition: 'Intact natural rutile silk and unaltered internal crystal structure confirm absence of thermal enhancement.'
    }
  },
  {
    id: 'intact-fluid-feathers',
    label: 'Unaltered Multi-Phase Fluid Inclusions',
    category: 'unheated',
    observationText: 'Unaltered two-phase and three-phase primary fluid cavities with no thermal expansion fractures.',
    conclusionImpact: {
      stoneType: 'Natural',
      treatmentTitle: 'No Indications of Thermal Treatment (Unheated)',
      commentAddition: 'Unruptured primary fluid inclusions confirm natural unheated state.'
    }
  },
  {
    id: 'angular-growth-zoning',
    label: 'Sharp Angular / Hexagonal Growth Zoning',
    category: 'unheated',
    observationText: 'Distinct straight angular and hexagonal growth zoning characteristic of natural crystal growth.',
    conclusionImpact: {
      stoneType: 'Natural',
      treatmentTitle: 'No Indications of Thermal Treatment (Unheated)',
      commentAddition: 'Natural angular crystal growth banding verified under darkfield microscopy.'
    }
  },
  {
    id: 'natural-crystal-guests',
    label: 'Unaltered Mineral Guest Crystals (Zircon / Mica / Apatite)',
    category: 'unheated',
    observationText: 'Well-formed natural guest crystals (zircon/apatite/mica) without high-temperature tension halos.',
    conclusionImpact: {
      stoneType: 'Natural',
      treatmentTitle: 'No Indications of Thermal Treatment (Unheated)',
      commentAddition: 'Diagnostic natural mineral guest inclusions observed.'
    }
  },

  // HEATED (THERMAL MODIFICATION)
  {
    id: 'dissolved-dotted-silk',
    label: 'Dissolved / Dotted Rutile Silk ("Snowball" Texture)',
    category: 'heated',
    observationText: 'Partially resorbed and dotted rutile silk needles indicative of high-temperature thermal processing.',
    conclusionImpact: {
      stoneType: 'Heated',
      treatmentTitle: 'Indications of Thermal Treatment (Heated)',
      commentAddition: 'Traditional heat treatment detected via partially dissolved rutile silk.'
    }
  },
  {
    id: 'discoid-tension-halos',
    label: 'Discoid Stress Fractures ("Lily-Pad" Thermal Halos)',
    category: 'heated',
    observationText: 'Discoid thermal expansion fractures and glassy tension halos surrounding crystal inclusions.',
    conclusionImpact: {
      stoneType: 'Heated',
      treatmentTitle: 'Indications of Thermal Treatment (Heated)',
      commentAddition: 'Diagnostic thermal expansion halos observed under magnification. No foreign lattice fillers detected.'
    }
  },
  {
    id: 'chalky-swuv-zones',
    label: 'Chalky Blue SWUV Fluorescence Zones',
    category: 'heated',
    observationText: 'Localized chalky greenish-blue luminescence under Shortwave UV (SWUV) associated with thermal alteration.',
    conclusionImpact: {
      stoneType: 'Heated',
      treatmentTitle: 'Indications of Thermal Treatment (Heated)',
      commentAddition: 'Shortwave UV luminescence response consistent with thermal enhancement.'
    }
  },

  // CLARITY ENHANCED / TREATED
  {
    id: 'flash-effect-filling',
    label: 'Blue / Orange Flash-Effect in Surface Fissures (Glass/Resin)',
    category: 'treated',
    observationText: 'Blue and orange interference flash colors along surface-reaching fissures with trapped flattened gas bubbles.',
    conclusionImpact: {
      stoneType: 'Treated',
      treatmentTitle: 'Clarity Enhanced (Foreign Filler in Fissures Detected)',
      commentAddition: 'Significant clarity enhancement via high-refractive-index foreign filler in surface-reaching fissures.'
    }
  },
  {
    id: 'minor-clarity-oiling',
    label: 'Traditional Clarity Oiling in Surface Fissures (Emerald)',
    category: 'treated',
    observationText: 'Faint dendritic oil films within surface-reaching fractures typical of traditional emerald clarity enhancement.',
    conclusionImpact: {
      stoneType: 'Treated',
      treatmentTitle: 'Indications of Clarity Enhancement (Minor Oil)',
      commentAddition: 'Minor clarity enhancement (oil) in surface-reaching fissures, standard trade practice for emerald.'
    }
  },

  // SYNTHETIC / SIMULANT
  {
    id: 'curved-striae-bubbles',
    label: 'Curved Growth Striae & Tadpole Gas Bubbles (Flame Fusion)',
    category: 'synthetic',
    observationText: 'Curved growth striae and spherical/elongated gas bubbles characteristic of Verneuil flame-fusion synthesis.',
    conclusionImpact: {
      stoneType: 'Synthetic',
      treatmentTitle: 'Laboratory-Created Synthetic (Flame Fusion)',
      commentAddition: 'Laboratory-grown synthetic gemstone created via Verneuil flame-fusion process.'
    }
  },
  {
    id: 'flux-veils-platinum',
    label: 'Wispy Flux Veils & Metallic Platinum Platelets (Flux-Grown)',
    category: 'synthetic',
    observationText: 'Wispy, high-relief twisted flux fingerprint veils and opaque hexagonal metallic platelets.',
    conclusionImpact: {
      stoneType: 'Synthetic',
      treatmentTitle: 'Laboratory-Created Synthetic (Flux-Grown)',
      commentAddition: 'Laboratory-grown synthetic gemstone produced via flux-melt crystallization.'
    }
  },
  {
    id: 'hydrothermal-chevrons',
    label: 'Chevron Growth & Nail-Head Spicules (Hydrothermal)',
    category: 'synthetic',
    observationText: 'Chevron/houndstooth cellular growth marks and two-phase nail-head spicules characteristic of hydrothermal growth.',
    conclusionImpact: {
      stoneType: 'Synthetic',
      treatmentTitle: 'Laboratory-Created Synthetic (Hydrothermal)',
      commentAddition: 'Laboratory-grown synthetic gemstone produced via hydrothermal synthesis.'
    }
  }
];

export function calculateHydrostaticSG(
  airWeightInput: string | number,
  waterWeightInput: string | number
): { sg: number | null; displacement: number | null; error?: string } {
  const air = typeof airWeightInput === 'string' ? parseFloat(airWeightInput) : airWeightInput;
  const water = typeof waterWeightInput === 'string' ? parseFloat(waterWeightInput) : waterWeightInput;

  if (isNaN(air) || air <= 0) {
    return { sg: null, displacement: null };
  }
  if (isNaN(water) || water <= 0) {
    return { sg: null, displacement: null };
  }
  if (water >= air) {
    return {
      sg: null,
      displacement: null,
      error: 'Water weight must be strictly less than weight in air (W_water < W_air).'
    };
  }

  const displacement = air - water;
  const sg = air / displacement;

  if (sg < 1.05 || sg > 7.5) {
    return {
      sg: Number(sg.toFixed(2)),
      displacement: Number(displacement.toFixed(3)),
      error: `Calculated S.G. (${sg.toFixed(2)}) is outside standard gemstone density bounds (2.00 – 5.00). Check balance tare.`
    };
  }

  return {
    sg: Number(sg.toFixed(2)),
    displacement: Number(displacement.toFixed(3))
  };
}

export interface ScoredGemCandidate {
  record: GemConstantRecord;
  score: number;
  riMatched: boolean;
  sgMatched: boolean;
  suggestedVariety: string;
  matchReasons: string[];
}

export function resolveVarietyForHue(
  gem: GemConstantRecord,
  selectedHue?: string
): string {
  if (selectedHue && gem.colorVarietyMap[selectedHue]) {
    return gem.colorVarietyMap[selectedHue];
  }
  if (selectedHue) {
    const cleanSpecies = gem.species
      .replace(/^Natural\s+/i, '')
      .replace(/^Synthetic\s+/i, '')
      .replace(/\s*\(.*?\)\s*/g, '')
      .trim();
    const prefix =
      gem.category === 'Synthetic'
        ? 'Synthetic'
        : gem.category === 'Simulant'
        ? ''
        : 'Natural';
    return `${prefix ? prefix + ' ' : ''}${selectedHue} ${cleanSpecies}`.trim();
  }
  return gem.defaultVariety;
}

export function filterAndRankGemstones(params: {
  riMin?: number | null;
  riMax?: number | null;
  riTolerance?: number;
  isOTL?: boolean;
  sg?: number | null;
  sgTolerance?: number;
  selectedHue?: string;
}): ScoredGemCandidate[] {
  const {
    riMin = null,
    riMax = null,
    riTolerance = 0.012,
    isOTL = false,
    sg = null,
    sgTolerance = 0.06,
    selectedHue = 'Blue'
  } = params;

  const hasRI = (riMin !== null && !isNaN(riMin) && riMin > 1.0) || isOTL;
  const hasSG = sg !== null && !isNaN(sg) && sg > 1.0;

  const results: ScoredGemCandidate[] = [];

  for (const gem of GEM_CONSTANTS_DB) {
    let riMatched = true;
    let sgMatched = true;
    let score = 50;
    const matchReasons: string[] = [];

    // 1. R.I. Matching
    if (hasRI) {
      if (isOTL) {
        if (gem.isOTL || gem.riMax >= 1.80) {
          riMatched = true;
          score += 30;
          matchReasons.push('Matches OTL (>1.81) Refractometer Range');
        } else {
          riMatched = false;
        }
      } else if (riMin !== null) {
        const effectiveMax = riMax !== null && !isNaN(riMax) && riMax >= riMin ? riMax : riMin;
        // Check overlap between [riMin - tol, effectiveMax + tol] and [gem.riMin, gem.riMax]
        const userLow = riMin - riTolerance;
        const userHigh = effectiveMax + riTolerance;

        if (userHigh >= gem.riMin && userLow <= gem.riMax) {
          riMatched = true;
          const gemMid = (gem.riMin + gem.riMax) / 2;
          const userMid = (riMin + effectiveMax) / 2;
          const diff = Math.abs(gemMid - userMid);
          const closeness = Math.max(0, 35 - Math.round(diff * 1200));
          score += closeness;
          matchReasons.push(`R.I. ${gem.riMin.toFixed(3)}–${gem.riMax.toFixed(3)} within ±${riTolerance}`);
        } else {
          riMatched = false;
        }
      }
    }

    // 2. S.G. Matching
    if (hasSG && sg !== null) {
      const sgLow = gem.sgMin - sgTolerance;
      const sgHigh = gem.sgMax + sgTolerance;
      if (sg >= sgLow && sg <= sgHigh) {
        sgMatched = true;
        const diff = Math.abs(gem.sgTypical - sg);
        const closeness = Math.max(0, 35 - Math.round(diff * 250));
        score += closeness;
        matchReasons.push(`S.G. ${gem.sgMin.toFixed(2)}–${gem.sgMax.toFixed(2)} (Typical ${gem.sgTypical.toFixed(2)})`);
      } else {
        sgMatched = false;
      }
    }

    // Filter out non-matches when criteria are active
    if (hasRI && !riMatched) continue;
    if (hasSG && !sgMatched) continue;

    // 3. Color / Variety resolution
    const suggestedVariety = resolveVarietyForHue(gem, selectedHue);
    if (selectedHue && gem.colorVarietyMap[selectedHue]) {
      score += 10;
    }

    // Prefer Natural slightly over Synthetic when constants are identical (microscopy separates them)
    if (gem.category === 'Natural') {
      score += 5;
    }

    results.push({
      record: gem,
      score: Math.min(99, score),
      riMatched,
      sgMatched,
      suggestedVariety,
      matchReasons
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
