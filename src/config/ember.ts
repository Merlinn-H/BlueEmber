// Settings of the "ember that reveals itself" effect (brief section 7).
// One entry per page type; the global tuning values are in `emberDefaults` and can be adjusted
// live with ?debug in the URL, then copied back here.

export type EmberPageKey = 'home' | 'realisations' | 'projet' | 'services' | 'agence' | 'contact' | 'legal' | 'notfound';

export interface FragmentSpec {
  /** Screen edge that cuts the fragment ('center' = centred, cut by the bottom edge only). */
  x: 'left' | 'right' | 'center';
  y: 'top' | 'middle' | 'bottom';
  /** Width in vw on desktop. */
  size: number;
  /** Share of the width hidden by the left or right edge (0 to 1). */
  cutX: number;
  /** Share of the height hidden by the top or bottom edge (0 to 1). */
  cutY: number;
}

export interface EmberPage {
  /** Effect strength for the page (1 = full). Sections can override it with data-ember-intensity. */
  intensity: number;
  /** Brush radius multiplier. */
  radius: number;
  /** Project pages: stronger effect in the hero than in the body. */
  heroIntensity?: number;
  /** Contact page: effect strength on the form (0 = none). */
  formIntensity?: number;
  fragment: FragmentSpec;
}

export const emberPages: Record<EmberPageKey, EmberPage> = {
  home: { intensity: 1, radius: 1, fragment: { x: 'left', y: 'bottom', size: 26, cutX: 0.28, cutY: 0.1 } },
  realisations: { intensity: 0.9, radius: 1, fragment: { x: 'right', y: 'top', size: 20, cutX: 0.28, cutY: 0 } },
  projet: {
    intensity: 0.15,
    heroIntensity: 0.4,
    radius: 0.8,
    fragment: { x: 'right', y: 'bottom', size: 12, cutX: 0.25, cutY: 0.1 },
  },
  services: { intensity: 0.6, radius: 0.9, fragment: { x: 'left', y: 'middle', size: 18, cutX: 0.3, cutY: 0 } },
  agence: { intensity: 0.6, radius: 0.9, fragment: { x: 'right', y: 'bottom', size: 22, cutX: 0.28, cutY: 0.1 } },
  contact: {
    intensity: 0.7,
    formIntensity: 0,
    radius: 0.9,
    fragment: { x: 'left', y: 'bottom', size: 20, cutX: 0.28, cutY: 0.1 },
  },
  legal: { intensity: 0.2, radius: 0.7, fragment: { x: 'right', y: 'bottom', size: 10, cutX: 0.2, cutY: 0.1 } },
  notfound: { intensity: 1, radius: 1.2, fragment: { x: 'center', y: 'bottom', size: 30, cutX: 0, cutY: 0.3 } },
};

/** Mobile: the fragment is about 40vw wide, always at the bottom, cut by a side edge. */
export const emberMobileFragment = { size: 40, cutX: 0.3, cutY: 0.1 } as const;

/** Global tuning values. The ?debug panel edits a copy of this object live. */
export interface EmberParams {
  brush: {
    /** Brush radius at rest (px, for a 1440px wide screen; scaled with the viewport width). */
    radiusMin: number;
    /** Brush radius at high speed. */
    radiusMax: number;
    /** Roughness of the burnt edge of the reveal (0 = clean gaussian). */
    edgeNoise: number;
  };
  speed: {
    /** Pointer speed (px/s) that gives full intensity. */
    reference: number;
    /** Intensity floor for slow gestures. */
    minIntensity: number;
  };
  trail: {
    /** Exponential decay time constant (s): almost invisible after 3.3 x tau. */
    tau: number;
  };
  look: {
    /** Size of the cracks cells (px). */
    crackScale: number;
    /** Width of the cracks (in cell units). */
    crackWidth: number;
    /** Size of the ash clouds (px). */
    ashScale: number;
    /** Heat distortion, maximum offset in px. */
    heat: number;
    /** Breathing of the cracks (+- share of brightness). */
    flicker: number;
    /** Strength of the blue halo around the cursor (1 = rgba(76,120,168,.35)). */
    halo: number;
    /** Share of the ivory hot core (0 hides it). */
    core: number;
  };
  sparks: {
    max: number;
    /** Most sparks born per frame at full speed. */
    perFrame: number;
    riseMin: number;
    riseMax: number;
    lifeMin: number;
    lifeMax: number;
    /** Share of orange sparks (the rest is titane-pale / ivory). */
    orangeShare: number;
  };
  burst: {
    radius: number;
    duration: number;
    sparks: number;
  };
  zones: {
    /** Calm zones: share of the effect removed inside (0.7 = 70 %). */
    reduce: number;
    /** Fade of the calm effect outside the zone edges (px). */
    fade: number;
    /** Heat ceiling under long text (keeps contrast above 4.5:1, see npm run contrast:check). */
    calmCap: number;
    /** Heat ceiling under display titles: cracks stay blue, never pale or ivory. */
    softCap: number;
  };
  rim: {
    /** Maximum opacity of the rim light on the fragment. */
    opacity: number;
    /** Width of the rim light (px). */
    width: number;
  };
  render: {
    /** Resolution of the ember render relative to the canvas (0.5 = half). */
    scale: number;
    /** Lower scale used when the frame rate drops. */
    minScale: number;
    /** devicePixelRatio cap. */
    dprMax: number;
    /** The loop stops after this long without input once the trail is out (ms). */
    idleMs: number;
    /** Average fps under which the quality is lowered. */
    fpsFloor: number;
  };
}

export const emberDefaults: EmberParams = {
  brush: { radiusMin: 90, radiusMax: 160, edgeNoise: 0.35 },
  speed: { reference: 1500, minIntensity: 0.25 },
  trail: { tau: 0.45 },
  look: { crackScale: 170, crackWidth: 0.055, ashScale: 260, heat: 4, flicker: 0.15, halo: 1, core: 1 },
  sparks: { max: 200, perFrame: 3, riseMin: 40, riseMax: 120, lifeMin: 1, lifeMax: 1.5, orangeShare: 0.15 },
  burst: { radius: 260, duration: 0.6, sparks: 20 },
  zones: { reduce: 0.7, fade: 40, calmCap: 0.15, softCap: 0.6 },
  rim: { opacity: 0.4, width: 10 },
  render: { scale: 0.5, minScale: 0.35, dprMax: 1.5, idleMs: 2500, fpsFloor: 45 },
};
