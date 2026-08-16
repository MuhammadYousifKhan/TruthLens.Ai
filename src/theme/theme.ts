// Single source of truth for the app's look.
//
// Direction: "The Evidence Sheet" — the app is treated as a document to be
// read, not a surface to be lit. A ruled field, a flush-left column, and
// numbers set at report scale. Structure carries the hierarchy, so nothing
// has to glow to feel considered.
//
// Two palettes, one semantic name set. Nothing here is imported into a
// module-scope StyleSheet.create — screens call `makeStyles(t)` with the
// resolved palette from `useTheme()` so both modes work at runtime.
//
// Contrast: every text/surface pair clears WCAG 2.1 AA (4.5:1 body, 3:1 large
// text and UI). Glass ratios are measured against the worst-case backdrop —
// the wash at full strength — not the average.

export type ThemeMode = "light" | "dark";

export type Palette = {
  mode: ThemeMode;

  // ---- Ground -------------------------------------------------------------
  /** App ground. */
  surfaceBase: string;
  /** The 26px ruled field drawn over the ground. */
  surfaceGrid: string;
  /** Single radial tint. Replaces the old drifting aurora — static. */
  surfaceWash: string;
  /** The one translucent hero surface per screen. */
  surfaceGlass: string;
  /** Opaque card — ReportCard, sheets, anything view-shot captures. */
  surfacePanel: string;
  /** Recessed fill: inputs, meter tracks, the disclaimer block. */
  surfaceSunken: string;

  // ---- Rules --------------------------------------------------------------
  /** List rules and card edges. */
  lineHairline: string;
  /** 2px section rule. */
  lineStrong: string;
  /** Lit top edge (dark) / inset white highlight (light). */
  lineCatchlight: string;

  // ---- Text ---------------------------------------------------------------
  textPrimary: string;
  textSecondary: string;
  /** Overlines and meta. Large or bold only — 3.7:1. */
  textTertiary: string;
  textPlaceholder: string;

  // ---- Accent -------------------------------------------------------------
  /** Mark, primary action, AI verdict. UI and large text only. */
  accentBrand: string;
  /** The accent at paragraph size, where 4.5:1 is required. */
  accentBrandText: string;
  /** Filled primary button ground. */
  accentBrandFill: string;
  /** Label on the filled accent button. */
  accentOn: string;

  // ---- Status -------------------------------------------------------------
  // Never used alone to carry meaning — always paired with a label, usually
  // an icon too.
  statusAi: string;
  statusAiSoft: string;
  statusAiOn: string;
  statusUncertain: string;
  statusUncertainSoft: string;
  statusUncertainOn: string;
  statusAuthentic: string;
  statusAuthenticSoft: string;
  statusAuthenticOn: string;
  statusInfo: string;
  statusInfoSoft: string;
  statusInfoOn: string;

  /** Backdrop behind a modal. */
  scrim: string;
  /** Placeholder fill where a photo has not loaded. */
  imagePlaceholder: string;
};

const dark: Palette = {
  mode: "dark",

  surfaceBase: "#1A1817",
  surfaceGrid: "rgba(248, 244, 244, 0.05)",
  surfaceWash: "rgba(255, 86, 60, 0.22)",
  surfaceGlass: "rgba(248, 244, 244, 0.08)",
  surfacePanel: "#201E1D",
  surfaceSunken: "rgba(16, 14, 14, 0.50)",

  lineHairline: "rgba(248, 244, 244, 0.26)",
  lineStrong: "rgba(248, 244, 244, 0.34)",
  lineCatchlight: "rgba(248, 244, 244, 0.42)",

  textPrimary: "#F8F4F4", // 16.1:1
  textSecondary: "#A3A1A0", // 6.9:1
  textTertiary: "#736F6E", // 3.7:1
  textPlaceholder: "#6A6664", // 3.2:1

  accentBrand: "#FF563C", // 5.6:1
  accentBrandText: "#FF9783", // 8.9:1
  accentBrandFill: "#FF563C",
  accentOn: "#1A1817", // 5.6:1 on the fill

  statusAi: "#FF563C", // 5.6:1
  statusAiSoft: "rgba(255, 86, 60, 0.12)",
  statusAiOn: "#1A1817",
  statusUncertain: "#F3A83C", // 8.8:1
  statusUncertainSoft: "rgba(243, 168, 60, 0.12)",
  statusUncertainOn: "#241A08",
  statusAuthentic: "#4EC98C", // 8.4:1
  statusAuthenticSoft: "rgba(78, 201, 140, 0.12)",
  statusAuthenticOn: "#14231C",
  statusInfo: "#8AA6FF", // 7.6:1
  statusInfoSoft: "rgba(138, 166, 255, 0.12)",
  statusInfoOn: "#1A1817",

  scrim: "rgba(16, 14, 14, 0.62)",
  imagePlaceholder: "#2A2523",
};

const light: Palette = {
  mode: "light",

  surfaceBase: "#F3F2F2",
  surfaceGrid: "rgba(32, 30, 29, 0.055)",
  surfaceWash: "rgba(236, 48, 19, 0.14)",
  surfaceGlass: "rgba(255, 255, 255, 0.72)",
  surfacePanel: "#FFFFFF",
  surfaceSunken: "#FFFFFF",

  lineHairline: "rgba(32, 30, 29, 0.34)",
  lineStrong: "rgba(32, 30, 29, 0.40)",
  // In light mode the catch-light inverts: a near-white inset top edge does
  // the work the lit edge does on dark.
  lineCatchlight: "rgba(255, 255, 255, 0.95)",

  textPrimary: "#201E1D", // 14.9:1
  textSecondary: "#6B6867", // 4.9:1
  textTertiary: "#7D7979", // 3.7:1
  textPlaceholder: "#8B8785", // 3.0:1

  accentBrand: "#EC3013", // 3.8:1 — UI and large text only
  accentBrandText: "#AE1800", // 6.5:1
  accentBrandFill: "#DD2B0F",
  accentOn: "#FFFFFF", // 4.7:1 on the fill

  statusAi: "#EC3013", // 3.8:1
  statusAiSoft: "rgba(236, 48, 19, 0.09)",
  statusAiOn: "#FFFFFF",
  statusUncertain: "#8A5000", // 5.8:1
  statusUncertainSoft: "rgba(138, 80, 0, 0.09)",
  statusUncertainOn: "#FFFFFF",
  statusAuthentic: "#1A6F4A", // 5.5:1
  statusAuthenticSoft: "rgba(26, 111, 74, 0.09)",
  statusAuthenticOn: "#FFFFFF",
  statusInfo: "#2B52C9", // 6.1:1
  statusInfoSoft: "rgba(43, 82, 201, 0.09)",
  statusInfoOn: "#FFFFFF",

  scrim: "rgba(32, 30, 29, 0.42)",
  imagePlaceholder: "#D5D1CF",
};

export const palettes = { dark, light };

// ---------------------------------------------------------------------------
// Mode-independent scales
// ---------------------------------------------------------------------------

// 4px base. Every gap, pad, and margin in the app is one of these.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Every corner goes to zero. A button reads as a button because it is a filled
// rectangle with a flush-left label and a 52px height, not because it is a
// capsule. Keeping the names lets screens stay unchanged.
export const radius = {
  pill: 0,
  input: 0,
  card: 0,
  sheet: 0,
  hero: 0,
};

export const fontSize = {
  micro: 11,
  caption: 13,
  body: 15,
  subtitle: 17,
  title: 20,
  heading: 34,
  display: 40,
  hero: 52,
  /** Report-scale figure: the result percentage, a quiz score. */
  numeral: 88,
};

// Tracking is stored in px (React Native has no em unit), derived from the
// design's em values at each size.
export const letterSpacing = {
  hero: -1.56, // -0.03em
  display: -1.2, // -0.03em
  heading: -0.85, // -0.025em
  title: -0.4, // -0.02em
  subtitle: 0,
  body: 0,
  caption: 0,
  overline: 2.2, // 0.20em
  numeral: -4.4, // -0.05em
  /** Uppercase button labels. */
  label: 0.75,
};

export const lineHeight = {
  hero: 50,
  display: 39,
  heading: 35,
  title: 25,
  subtitle: 24,
  body: 23,
  caption: 18,
  overline: 14,
  numeral: 72,
};

// Urdu needs materially more leading than Latin at every size. Applied
// whenever language === "ur".
export const lineHeightUrdu = {
  hero: 72,
  display: 58,
  heading: 50,
  title: 34,
  subtitle: 32,
  body: 30,
  caption: 26,
  overline: 20,
  numeral: 72,
};

export const fontFamily = {
  regular: "Archivo_400Regular",
  semibold: "Archivo_600SemiBold",
  extrabold: "Archivo_800ExtraBold",
  urduRegular: "NotoNaskhArabic_400Regular",
  urduSemibold: "NotoNaskhArabic_600SemiBold",
  urduBold: "NotoNaskhArabic_700Bold",
};

// Physics profiles. Nothing loops in the background any more — the field is
// static — so `ambient` is 0 and kept only so old references still resolve.
export const motion = {
  instant: 120,
  fast: 180,
  base: 280,
  slow: 420,
  page: 520,
  ambient: 0,
  stagger: 55,
};

export const touchTarget = {
  minHeight: 48,
  /** Filled primary action. */
  primaryHeight: 52,
};

/** Blur intensities for the handful of surfaces that get real expo-blur. */
export const blur = {
  subtle: 18,
  standard: 28,
  heavy: 48,
};

/** The ruled field drawn behind every screen. */
export const field = {
  gridSize: 26,
  /** Ruler tick pitch on the Result band meter. */
  tickPitch: 11.2,
};

// Spreadable absolute-fill shorthand. RN 0.86's types do not expose
// StyleSheet.absoluteFillObject, and StyleSheet.absoluteFill cannot be spread
// into a style object, so overlays use this instead.
export const absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

const theme = {
  palettes,
  spacing,
  radius,
  fontSize,
  letterSpacing,
  lineHeight,
  lineHeightUrdu,
  fontFamily,
  motion,
  touchTarget,
  blur,
  field,
};

export default theme;
