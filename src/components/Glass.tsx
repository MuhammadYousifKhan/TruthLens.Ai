import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { blur as blurTokens, colors, radius as radiusTokens } from "../theme/theme";

/**
 * Glass surfaces.
 *
 * Two implementations, one API:
 *
 *   GlassCard  — layered translucent fill. No GPU blur pass, so it is safe to
 *                use dozens of times per screen. This is the default.
 *   BlurCard   — real backdrop blur via expo-blur, for a handful of hero
 *                surfaces. On Android it falls back to GlassCard, because real
 *                blur there needs BlurTargetView plumbing on every screen and
 *                drops frames on older hardware. iOS and web get the real thing.
 *
 * Both draw a 1px catch-light along the top edge. That highlight — not the
 * blur — is what actually reads as "glass"; it is the cue that the surface has
 * a lit edge facing the light source.
 */

const USE_REAL_BLUR = Platform.OS === "ios" || Platform.OS === "web";

type Tone = "default" | "strong" | "sunken";

const TONE_FILL: Record<Tone, string> = {
  default: colors.glass,
  strong: colors.glassStrong,
  sunken: colors.glassSunken,
};

const TONE_BORDER: Record<Tone, string> = {
  default: colors.glassBorder,
  strong: colors.glassBorderStrong,
  sunken: colors.glassBorder,
};

type GlassProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Surface weight. `strong` separates from a busy backdrop, `sunken` recedes. */
  tone?: Tone;
  radius?: number;
  /** Draws the top catch-light. Off for tiny surfaces where it would crowd. */
  highlight?: boolean;
  /** Tints the border and adds a faint inner wash — used for status surfaces. */
  accent?: string;
};

/** The 1px lit edge along the top of a glass surface. */
function TopHighlight({ radius }: { radius: number }) {
  return (
    <LinearGradient
      colors={["transparent", colors.glassHighlight, "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.highlight, { top: 0, borderTopLeftRadius: radius, borderTopRightRadius: radius }]}
      pointerEvents="none"
    />
  );
}

export function GlassCard({
  children,
  style,
  tone = "default",
  radius = radiusTokens.card,
  highlight = true,
  accent,
}: GlassProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: TONE_FILL[tone],
          borderColor: accent ?? TONE_BORDER[tone],
          borderRadius: radius,
        },
        style,
      ]}
    >
      {accent && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: 0.07, borderRadius: radius }]}
          pointerEvents="none"
        />
      )}
      {highlight && <TopHighlight radius={radius} />}
      {children}
    </View>
  );
}

type BlurCardProps = GlassProps & {
  intensity?: number;
};

export function BlurCard({
  children,
  style,
  tone = "default",
  radius = radiusTokens.card,
  highlight = true,
  accent,
  intensity = blurTokens.standard,
}: BlurCardProps) {
  if (!USE_REAL_BLUR) {
    return (
      <GlassCard style={style} tone={tone} radius={radius} highlight={highlight} accent={accent}>
        {children}
      </GlassCard>
    );
  }

  return (
    // borderRadius is not applied to BlurView when set directly, so the radius
    // lives on an overflow-hidden wrapper instead (per expo-blur docs).
    <View style={[styles.blurWrapper, { borderRadius: radius, borderColor: accent ?? TONE_BORDER[tone] }, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      {/* A tint over the blur keeps contrast stable regardless of what is behind. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: TONE_FILL[tone] }]} pointerEvents="none" />
      {accent && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: 0.07 }]} pointerEvents="none" />
      )}
      {highlight && <TopHighlight radius={0} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: "hidden",
  },
  blurWrapper: {
    borderWidth: 1,
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
});
