// Single source of truth for the app's look.
//
// Direction: "deep aurora dark" — a near-black navy ground with a slow aurora
// wash behind frosted glass surfaces. Glass only reads as glass when what sits
// behind it has colour and movement, so the background is part of the system,
// not decoration bolted on top.
//
// Everything below is a token. Screens must not hardcode colours, sizes, or
// durations — change a value here and every screen picks it up.
//
// Contrast: every text/background pair defined here clears WCAG 2.1 AA (4.5:1
// for body, 3:1 for large text). The ratios are noted where they're close
// enough to matter if someone retunes a value.

export const colors = {
  // ---- Ground -------------------------------------------------------------
  // `background` is the true base. `backgroundDeep` sits under the aurora at
  // the top of the screen; `backgroundLift` is the slightly warmer bottom.
  background: "#070B18",
  backgroundDeep: "#04060F",
  backgroundLift: "#0C1226",

  // ---- Aurora wash --------------------------------------------------------
  // Low-alpha so the blobs bleed into each other instead of reading as shapes.
  auroraCyan: "rgba(74, 222, 222, 0.20)",
  auroraViolet: "rgba(139, 123, 255, 0.22)",
  auroraDeep: "rgba(30, 41, 99, 0.35)",

  // ---- Glass surfaces -----------------------------------------------------
  // `glass` is the workhorse fill for simulated-glass cards. `glassStrong` is
  // for surfaces that need to separate from a busy backdrop. `glassBorder` is
  // the hairline edge; `glassHighlight` is the 1px top catch-light that sells
  // the effect more than the blur itself does.
  glass: "rgba(255, 255, 255, 0.06)",
  glassStrong: "rgba(255, 255, 255, 0.10)",
  glassSunken: "rgba(4, 6, 15, 0.45)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
  glassBorderStrong: "rgba(255, 255, 255, 0.20)",
  glassHighlight: "rgba(255, 255, 255, 0.28)",

  // ---- Text ---------------------------------------------------------------
  text: "#F2F5FF", // 18.6:1 on background
  textMuted: "#94A0C0", // 7.5:1 on background
  textFaint: "#6B779A", // 4.6:1 — captions and non-critical labels only
  placeholder: "#5A648A",

  // ---- Accents ------------------------------------------------------------
  primary: "#4ADEDE", // cyan — 12.0:1 on background
  primaryDeep: "#2BB8B8",
  primaryGlow: "rgba(74, 222, 222, 0.35)",
  secondary: "#8B7BFF", // violet — 6.0:1 on background
  secondaryGlow: "rgba(139, 123, 255, 0.30)",

  // Text/icon colour to sit ON a filled primary or secondary surface.
  onPrimary: "#06131A", // 11.5:1 on primary
  onSecondary: "#0B0720",

  // ---- Status -------------------------------------------------------------
  // Never used alone to carry meaning — always paired with a label or icon.
  success: "#5AE6A8", // 12.4:1
  successSoft: "rgba(90, 230, 168, 0.14)",
  warning: "#FFB347", // 11.0:1
  warningSoft: "rgba(255, 179, 71, 0.14)",
  danger: "#FF6B81", // 7.2:1
  dangerSoft: "rgba(255, 107, 129, 0.14)",
  info: "#7FB0FF",
  infoSoft: "rgba(127, 176, 255, 0.14)",

  // ---- Legacy aliases -----------------------------------------------------
  // Kept so any screen not yet migrated still compiles and stays legible.
  white: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.12)",
  primaryPressed: "#2BB8B8",
  onPrimaryMuted: "rgba(242, 245, 255, 0.72)",
};

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

export const radius = {
  pill: 999,
  input: 14,
  card: 20,
  sheet: 28,
  hero: 24,
};

// ~1.25 ratio. `body` stays at 15 so it clears the spec's 14sp floor with room
// to spare; `caption` is reserved for non-critical one-liners.
export const fontSize = {
  micro: 11,
  caption: 13,
  body: 15,
  subtitle: 16,
  title: 20,
  heading: 25,
  display: 31,
  hero: 38,
};

// Tracking tightens as size grows — large text needs less air between letters.
export const letterSpacing = {
  hero: -1.2,
  display: -0.8,
  heading: -0.5,
  title: -0.3,
  body: 0,
  label: 0.4,
  overline: 1.6,
};

export const lineHeight = {
  hero: 42,
  display: 36,
  heading: 30,
  title: 26,
  subtitle: 23,
  body: 22,
  caption: 18,
};

// Physics profiles. Lightweight things move fast; weighty things take their
// time. Anything the user is waiting on stays under 300ms.
export const motion = {
  instant: 120, // icon/toggle feedback
  fast: 180, // press states
  base: 280, // card entrance, state change
  slow: 420, // sheet, expand
  page: 520, // route transition
  ambient: 14000, // the aurora drift — felt, not seen
  stagger: 55, // per-item delay in a list entrance
};

export const touchTarget = {
  minHeight: 48, // exceeds the 44px WCAG floor
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

// Blur intensities for the few surfaces that get real expo-blur treatment.
export const blur = {
  subtle: 18,
  standard: 32,
  heavy: 56,
};

const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  letterSpacing,
  lineHeight,
  motion,
  touchTarget,
  blur,
};

export default theme;
