import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePalette } from "../theme/ThemeContext";
import { letterSpacing, motion, radius, spacing, touchTarget } from "../theme/theme";
import { useTypeStyle } from "./Typography";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Buttons.
 *
 * A button reads as a button because it is a filled rectangle with a
 * flush-left label and a 52px height — not because it is a capsule with a
 * glow. There is no gradient and no emitted light anywhere in this system;
 * weight comes from fill, rule, and size.
 *
 * The primary action stays opaque in both modes. A translucent CTA over a
 * variable backdrop cannot guarantee 4.5:1 on its label without a scrim, and a
 * scrim is just an opaque button wearing a costume — so the translucency lives
 * on the hero card instead.
 */

type PressScaleProps = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the surface sinks on press. Larger surfaces move less. */
  scaleTo?: number;
};

/** Wraps any pressable surface with a spring-in scale response. */
export function PressScale({ children, style, scaleTo = 0.97, ...rest }: PressScaleProps) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    if (reducedMotion) return;
    Animated.timing(scale, {
      toValue: value,
      duration: motion.instant,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        animateTo(scaleTo);
        rest.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        rest.onPressOut?.(event);
      }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            style,
            { transform: [{ scale }] },
            // Reduce-motion users still get a state change, just not a moving one.
            pressed && reducedMotion && { opacity: 0.8 },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

/**
 * The loading indicator: three cells that fill in sequence.
 *
 * A spinner says "unknown wait". A row that advances says "three things are
 * happening", which matches how the rest of the app talks about work.
 */
function TickRow({ color }: { color: string }) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => setStep((current) => (current + 1) % 3), 260);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  return (
    <View style={styles.tickRow}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.tick,
            { borderColor: color },
            (reducedMotion || index <= step) && { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Places the icon flush right — use for forward motion. */
  iconTrailing?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Overrides the fill (primary) or the rule and label (secondary/ghost). */
  tone?: string;
  /** Label colour when `tone` is set on a filled button. */
  onTone?: string;
  /** Taller variant for the one screen where the action is the whole point. */
  large?: boolean;
  accessibilityHint?: string;
};

/** The one strongest action on a screen. There should never be two. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  iconTrailing = true,
  loading,
  disabled,
  style,
  tone,
  onTone,
  large,
  accessibilityHint,
}: ButtonProps) {
  const t = usePalette();
  const labelStyle = useTypeStyle("subtitle", "extrabold");
  const inactive = disabled || loading;

  const fill = tone ?? t.accentBrandFill;
  const labelColor = onTone ?? (tone ? t.statusUncertainOn : t.accentOn);

  return (
    <PressScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.filled,
        {
          minHeight: large ? 56 : touchTarget.primaryHeight,
          backgroundColor: fill,
          borderRadius: radius.input,
        },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <TickRow color={labelColor} />
      ) : (
        <>
          {icon && !iconTrailing && (
            <MaterialIcons name={icon} size={20} color={labelColor} style={styles.leadingIcon} />
          )}
          <Animated.Text
            numberOfLines={1}
            style={[labelStyle, styles.label, { color: labelColor }]}
          >
            {label.toUpperCase()}
          </Animated.Text>
          {icon && iconTrailing && <MaterialIcons name={icon} size={22} color={labelColor} />}
        </>
      )}
    </PressScale>
  );
}

/** Equal-weight alternative to the primary action. A ruled box, not a fill. */
export function SecondaryButton({
  label,
  onPress,
  icon,
  iconTrailing,
  loading,
  disabled,
  style,
  tone,
  accessibilityHint,
}: ButtonProps) {
  const t = usePalette();
  const labelStyle = useTypeStyle("body", "extrabold");
  const inactive = disabled || loading;
  const accent = tone ?? t.textPrimary;
  const border = tone ?? t.lineStrong;

  return (
    <PressScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.outlined,
        { borderColor: border, borderRadius: radius.input },
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <TickRow color={accent} />
      ) : (
        <>
          {icon && !iconTrailing && (
            <MaterialIcons name={icon} size={18} color={accent} style={styles.leadingIcon} />
          )}
          <Animated.Text numberOfLines={1} style={[labelStyle, styles.label, { color: accent }]}>
            {label.toUpperCase()}
          </Animated.Text>
          {icon && iconTrailing && <MaterialIcons name={icon} size={20} color={accent} />}
        </>
      )}
    </PressScale>
  );
}

/** Lowest-weight action — dismissals, "scan another", "retake". */
export function GhostButton({
  label,
  onPress,
  icon,
  disabled,
  style,
  tone,
  accessibilityHint,
}: ButtonProps) {
  const t = usePalette();
  const labelStyle = useTypeStyle("body", "extrabold");
  const accent = tone ?? t.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }, style]}
    >
      {icon && <MaterialIcons name={icon} size={18} color={accent} style={styles.leadingIcon} />}
      <Animated.Text numberOfLines={1} style={[labelStyle, styles.label, { color: accent }]}>
        {label.toUpperCase()}
      </Animated.Text>
    </Pressable>
  );
}

/**
 * A text link that carries a 2px rule under the accent word — the one place
 * an underline appears in the system.
 */
export function UnderlineLink({
  label,
  onPress,
  tone,
  accessibilityHint,
}: {
  label: string;
  onPress?: () => void;
  tone?: string;
  accessibilityHint?: string;
}) {
  const t = usePalette();
  const labelStyle = useTypeStyle("body", "extrabold");
  const accent = tone ?? t.accentBrandText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.link, { borderBottomColor: accent }, pressed && { opacity: 0.6 }]}
    >
      <Animated.Text style={[labelStyle, { color: accent }]}>{label}</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filled: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg + 2,
    overflow: "hidden",
  },
  outlined: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: spacing.lg + 2,
    overflow: "hidden",
  },
  ghost: {
    minHeight: touchTarget.minHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  // Flush left, filling the row so the trailing arrow is pushed to the edge.
  label: {
    flex: 1,
    letterSpacing: letterSpacing.label,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  link: {
    alignSelf: "flex-start",
    borderBottomWidth: 2,
  },
  tickRow: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs + 2,
    alignItems: "center",
  },
  tick: {
    width: 14,
    height: 6,
    borderWidth: 1,
  },
  inactive: {
    opacity: 0.45,
  },
});
