import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePalette } from "../theme/ThemeContext";
import { absoluteFill, field, letterSpacing, motion, radius, spacing } from "../theme/theme";
import { Caption, Overline, useTypeStyle } from "./Typography";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Small status objects: pills, meters, the band ruler, section headers.
 *
 * Status never rides on colour alone — every coloured pill carries a label,
 * and most carry an icon too, so the meaning survives colour-blindness and
 * greyscale screenshots.
 */

type PillProps = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Accent colour — tints text, icon, and rule. */
  tone?: string;
  /** Fills the pill with the tone and flips the label to its `on` colour. */
  filled?: boolean;
  /** Label colour when filled. */
  onTone?: string;
  style?: StyleProp<ViewStyle>;
};

/** A square, ruled chip. Uppercase 11/800 — its own register. */
export function Pill({ label, icon, tone, filled, onTone, style }: PillProps) {
  const t = usePalette();
  const labelStyle = useTypeStyle("overline");
  const accent = tone ?? t.textSecondary;
  const color = filled ? onTone ?? t.accentOn : accent;

  return (
    <View
      style={[
        styles.pill,
        {
          borderColor: accent,
          backgroundColor: filled ? accent : "transparent",
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      {icon && <MaterialIcons name={icon} size={13} color={color} style={styles.pillIcon} />}
      <Animated.Text style={[labelStyle, { color, letterSpacing: letterSpacing.label + 0.35 }]}>
        {label.toUpperCase()}
      </Animated.Text>
    </View>
  );
}

type MeterProps = {
  /** 0-1. Values outside the range are clamped. */
  value: number;
  tone?: string;
  /** Animates from empty on mount — use for a result reveal. */
  animateIn?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** Announced to screen readers, e.g. "3 of 5 complete". */
  accessibilityLabel?: string;
};

/**
 * A plain progress bar: a square track with a square fill.
 *
 * Used where progress has no bands to read against — quiz and game progress,
 * XP, the pause cool-down. For a probability, use `Ruler` instead.
 */
export function Meter({
  value,
  tone,
  animateIn = false,
  height = 6,
  style,
  accessibilityLabel,
}: MeterProps) {
  const t = usePalette();
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const progress = useRef(new Animated.Value(animateIn ? 0 : clamped)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: clamped,
      duration: reducedMotion ? 0 : motion.slow,
      easing: Easing.out(Easing.cubic),
      // Width cannot use the native driver; the bar is small so this is cheap.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [clamped, progress, reducedMotion]);

  return (
    <View
      style={[styles.meterTrack, { height, backgroundColor: t.surfaceGrid }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View
        style={{
          height: "100%",
          backgroundColor: tone ?? t.textPrimary,
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }}
      />
    </View>
  );
}

type RulerProps = {
  /** 0-1. Where the marker sits along the scale. */
  value: number;
  tone: string;
  /** Band labels beneath the tick field. */
  bands?: { label: string; width: string; tone?: string }[];
  animateIn?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * The band ruler — a measurement, not a fuel gauge.
 *
 * A tick field with a single 3px marker. The marker moves and the ruler does
 * not, which is what makes all three verdict bands one component rather than
 * three states. Reading a probability off a ruled scale is honest in a way a
 * filled bar is not: a filled bar implies accumulation toward a goal.
 */
export function Ruler({
  value,
  tone,
  bands,
  animateIn = true,
  style,
  accessibilityLabel,
}: RulerProps) {
  const t = usePalette();
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const progress = useRef(new Animated.Value(animateIn ? 0 : clamped)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: clamped,
      duration: reducedMotion ? 0 : motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [clamped, progress, reducedMotion]);

  // Ticks are laid out at a fixed pitch and simply clipped by the container,
  // so the scale reads the same at any width.
  const tickCount = 40;

  return (
    <View
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View style={[styles.rulerTrack, { borderBottomColor: t.lineHairline }]}>
        <View style={styles.rulerTicks} pointerEvents="none">
          {Array.from({ length: tickCount }, (_, index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                left: index * field.tickPitch,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: t.lineHairline,
              }}
            />
          ))}
        </View>
        <Animated.View
          style={[
            styles.rulerMarker,
            {
              backgroundColor: tone,
              left: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>

      {bands && (
        <View style={styles.bandRow}>
          {bands.map((band, index) => (
            <Caption
              key={band.label}
              color={band.tone ?? t.textTertiary}
              style={[
                styles.bandLabel,
                index === bands.length - 1
                  ? { flex: 1, textAlign: "right" }
                  : { width: band.width as ViewStyle["width"] },
              ]}
            >
              {band.label.toUpperCase()}
            </Caption>
          ))}
        </View>
      )}
    </View>
  );
}

/** A kicker above a group of rows, with a rule that fills the remaining width. */
export function SectionLabel({
  children,
  style,
  tone,
}: {
  children: string;
  style?: StyleProp<ViewStyle>;
  tone?: string;
}) {
  const t = usePalette();
  return (
    <View style={[styles.sectionLabel, style]}>
      <Overline color={tone}>{children}</Overline>
      <View style={[styles.sectionRule, { backgroundColor: t.lineHairline }]} />
    </View>
  );
}

/** A 2px rule. The heaviest divider in the system. */
export function Rule({ strong, style }: { strong?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = usePalette();
  return (
    <View
      style={[
        { height: strong ? 2 : 1, backgroundColor: strong ? t.lineStrong : t.lineHairline },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm + 1,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  pillIcon: {
    marginRight: spacing.xs,
  },
  meterTrack: {
    width: "100%",
    overflow: "hidden",
  },
  rulerTrack: {
    position: "relative",
    height: 26,
    borderBottomWidth: 1,
    overflow: "visible",
  },
  rulerTicks: {
    ...absoluteFill,
    overflow: "hidden",
  },
  rulerMarker: {
    position: "absolute",
    top: -4,
    bottom: -4,
    width: 3,
    marginLeft: -1.5,
  },
  bandRow: {
    flexDirection: "row",
    marginTop: spacing.xs + 2,
  },
  bandLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionRule: {
    flex: 1,
    height: 1,
  },
});
