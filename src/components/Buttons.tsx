import { useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
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
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontSize, motion, radius, spacing, touchTarget } from "../theme/theme";
import { Subtitle } from "./Typography";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Buttons.
 *
 * Affordance comes from colour, fill, and a physical press response — not from
 * drop shadows faking elevation. The one glow in the system belongs to the
 * primary action, where it reads as emitted light rather than as a cast shadow.
 *
 * Press feedback lands in 120ms. Anything slower and the button feels like it
 * is thinking; anything faster and the response is missed entirely.
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

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Places the icon after the label — use for forward motion ("Continue →"). */
  iconTrailing?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Overrides the fill. Used for status-coloured actions. */
  tone?: string;
  accessibilityHint?: string;
};

/** The one strongest action on a screen. There should never be two. */
export function PrimaryButton({
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
  const inactive = disabled || loading;
  const fill = tone ?? colors.primary;

  return (
    <PressScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[styles.button, styles.primaryGlow, inactive && styles.inactive, style]}
    >
      <LinearGradient
        colors={[fill, tone ? fill : colors.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <View style={styles.row}>
          {icon && !iconTrailing && (
            <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
          )}
          <Subtitle color={colors.onPrimary}>{label}</Subtitle>
          {icon && iconTrailing && (
            <MaterialIcons name={icon} size={20} color={colors.onPrimary} />
          )}
        </View>
      )}
    </PressScale>
  );
}

/** Equal-weight alternative to the primary action. Glass, not filled. */
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
  const inactive = disabled || loading;
  const accent = tone ?? colors.text;

  return (
    <PressScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.button,
        styles.secondary,
        tone ? { borderColor: tone } : null,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={accent} />
      ) : (
        <View style={styles.row}>
          {icon && !iconTrailing && <MaterialIcons name={icon} size={20} color={accent} />}
          <Subtitle color={accent}>{label}</Subtitle>
          {icon && iconTrailing && <MaterialIcons name={icon} size={20} color={accent} />}
        </View>
      )}
    </PressScale>
  );
}

/** Lowest-weight action — dismissals, "skip", "scan another". */
export function GhostButton({
  label,
  onPress,
  icon,
  disabled,
  style,
  tone,
  accessibilityHint,
}: ButtonProps) {
  const accent = tone ?? colors.primary;
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
      <View style={styles.row}>
        {icon && <MaterialIcons name={icon} size={18} color={accent} />}
        <Subtitle color={accent} style={{ fontSize: fontSize.body }}>
          {label}
        </Subtitle>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
  },
  // The single piece of "elevation" in the app: emitted light from the CTA.
  primaryGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  secondary: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  ghost: {
    minHeight: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inactive: {
    opacity: 0.45,
  },
});
