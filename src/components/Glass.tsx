import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { usePalette } from "../theme/ThemeContext";
import { blur as blurTokens, radius as radiusTokens } from "../theme/theme";

/**
 * Surfaces.
 *
 * The three tones mean something different than they used to. Most cards in
 * this design are opaque and ruled; translucency is demoted to one hero panel
 * per screen, which is exactly what makes the app look complete on Android
 * with zero real blur.
 *
 *   default — opaque panel with a 1px hairline. Most cards.
 *   strong  — the translucent hero. 8% white over the field in dark, 72% white
 *             in light. This is the only tone that gets a catch-light.
 *   sunken  — the recessed fill: inputs, meter tracks, the disclaimer block.
 *
 * The catch-light inverts between modes. On dark it is a lit top edge, the cue
 * that a surface faces the light. On light that reads as nothing, so the
 * surface is sold instead by a near-white inset top edge plus a soft ink
 * shadow.
 */

const USE_REAL_BLUR = Platform.OS === "ios" || Platform.OS === "web";

type Tone = "default" | "strong" | "sunken";

type GlassProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  radius?: number;
  /** Draws the catch-light. Only meaningful on `strong`. */
  highlight?: boolean;
  /** Tints the border and adds a faint inner wash — used for status surfaces. */
  accent?: string;
  /** Thickens the border to 2px. Used on answered quiz options and reveals. */
  accentStrong?: boolean;
};

export function GlassCard({
  children,
  style,
  tone = "default",
  radius = radiusTokens.card,
  highlight = true,
  accent,
  accentStrong = false,
}: GlassProps) {
  const t = usePalette();
  const isLight = t.mode === "light";

  const fill =
    tone === "strong" ? t.surfaceGlass : tone === "sunken" ? t.surfaceSunken : t.surfacePanel;

  const border = accent ?? t.lineHairline;
  const showCatchlight = highlight && tone === "strong";

  return (
    <View
      style={[
        {
          backgroundColor: fill,
          borderWidth: accentStrong ? 2 : 1,
          borderColor: border,
          borderRadius: radius,
          overflow: "hidden",
        },
        // Light mode sells a raised surface with a shadow rather than a lit
        // edge; dark mode has no shadow anywhere in the system.
        showCatchlight && isLight && styles.lightLift,
        style,
      ]}
    >
      {accent && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: isLight ? 0.07 : 0.1 }]}
          pointerEvents="none"
        />
      )}
      {showCatchlight && (
        <View
          style={[styles.catchlight, { backgroundColor: t.lineCatchlight }]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

type BlurCardProps = GlassProps & {
  intensity?: number;
};

/**
 * Real backdrop blur, for the four hero surfaces only (Result, Learn, Profile
 * stats, Quiz result). On Android it falls back to GlassCard tone="strong" —
 * and because the field behind it is flat rather than drifting, the fallback
 * is nearly indistinguishable. That is the point of dropping the aurora.
 */
export function BlurCard({
  children,
  style,
  tone = "strong",
  radius = radiusTokens.card,
  highlight = true,
  accent,
  accentStrong,
  intensity = blurTokens.standard,
}: BlurCardProps) {
  const t = usePalette();
  const isLight = t.mode === "light";

  if (!USE_REAL_BLUR) {
    return (
      <GlassCard
        style={style}
        tone={tone}
        radius={radius}
        highlight={highlight}
        accent={accent}
        accentStrong={accentStrong}
      >
        {children}
      </GlassCard>
    );
  }

  return (
    // borderRadius is not applied to BlurView when set directly, so the radius
    // lives on an overflow-hidden wrapper instead (per expo-blur docs).
    <View
      style={[
        {
          borderWidth: accentStrong ? 2 : 1,
          borderColor: accent ?? t.lineHairline,
          borderRadius: radius,
          overflow: "hidden",
        },
        highlight && isLight && styles.lightLift,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />
      {/* A tint over the blur keeps contrast stable regardless of what is
          behind it — the worst case the ratios were measured against. */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: t.surfaceGlass }]}
        pointerEvents="none"
      />
      {accent && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: isLight ? 0.07 : 0.1 }]}
          pointerEvents="none"
        />
      )}
      {highlight && (
        <View
          style={[styles.catchlight, { backgroundColor: t.lineCatchlight }]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  catchlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  lightLift: {
    shadowColor: "#2D2B2B",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
