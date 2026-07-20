// Single source of truth for the app's look, per spec section 9 (UI style):
// blue/white palette, 16px rounded cards, 48dp touch targets, 14sp minimum body text.
// Change a value here and every screen that imports `theme` picks it up.

export const colors = {
  primary: "#0b3d91",
  primaryPressed: "#092f70",
  background: "#ffffff",
  card: "#f5f8ff",
  border: "#d1d9f0",
  text: "#111827",
  textMuted: "#6b7280",
  placeholder: "#9ca3af",
  white: "#ffffff",
  onPrimaryMuted: "#dbe4ff",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  card: 16,
  input: 12,
};

export const fontSize = {
  body: 14,
  subtitle: 16,
  title: 20,
  heading: 26,
};

export const touchTarget = {
  minHeight: 48,
};

const theme = { colors, spacing, radius, fontSize, touchTarget };

export default theme;
