import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, motion, radius, spacing } from "../theme/theme";
import { Caption, Overline } from "./Typography";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Small status objects: pills, meters, section headers.
 *
 * Status never rides on colour alone — every coloured pill carries a label,
 * and most carry an icon too, so the meaning survives colour-blindness and
 * greyscale screenshots.
 */

type PillProps = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Accent colour — tints text, icon, border, and a faint fill. */
  tone?: string;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ label, icon, tone = colors.primary, style }: PillProps) {
  return (
    <View style={[styles.pill, { borderColor: tone + "55" }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tone, opacity: 0.12 }]} />
      {icon && <MaterialIcons name={icon} size={14} color={tone} />}
      <Caption color={tone} style={styles.pillLabel}>
        {label}
      </Caption>
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
  /** Announced to screen readers, e.g. "72 percent likely AI-generated". */
  accessibilityLabel?: string;
};

/**
 * A horizontal fill meter. Used for scan probability, quiz progress, and XP.
 *
 * The track is a sunken glass channel and the fill is a gradient-free solid,
 * so the meter reads as a level rather than as a decorative bar.
 */
export function Meter({
  value,
  tone = colors.primary,
  animateIn = false,
  height = 8,
  style,
  accessibilityLabel,
}: MeterProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const progress = useRef(new Animated.Value(animateIn ? 0 : clamped)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: clamped,
      // A meter filling is information, so it may not be instant — but it must
      // not outlast the user's patience either.
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
      style={[styles.meterTrack, { height, borderRadius: height / 2 }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: tone,
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </View>
  );
}

/** A kicker above a group of cards. Gives small text its own register. */
export function SectionLabel({ children, style }: { children: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.sectionLabel, style]}>
      <Overline>{children}</Overline>
      <View style={styles.sectionRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  pillLabel: {
    fontWeight: "600",
  },
  meterTrack: {
    width: "100%",
    backgroundColor: colors.glassSunken,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glassBorder,
  },
});
