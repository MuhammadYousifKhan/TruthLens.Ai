import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fontSize, motion, radius, spacing, touchTarget } from "../theme/theme";
import { Caption } from "./Typography";

/**
 * A text field on glass.
 *
 * The field is a sunken channel — darker than the surface it sits in — so it
 * reads as somewhere to put something rather than as another card. Focus
 * raises a cyan border and fades in a matching glow; that colour shift, not a
 * shadow, is the focus indicator, and it is visible enough to satisfy WCAG's
 * focus-visible requirement for keyboard users.
 *
 * Font size is pinned at 16 because iOS zooms the viewport on any smaller
 * focused input.
 */

type GlassInputProps = TextInputProps & {
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Renders a red border and reserves space for the message below. */
  error?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function GlassInput({
  icon,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  function animateGlow(to: number) {
    Animated.timing(glow, {
      toValue: to,
      duration: motion.fast,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }

  const borderColor = error
    ? colors.danger
    : glow.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.glassBorder, colors.primary],
      });

  return (
    <View style={containerStyle}>
      <Animated.View style={[styles.field, { borderColor }]}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={focused ? colors.primary : colors.textFaint}
          />
        )}
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          // Cursor and selection pick up the accent on both platforms.
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            animateGlow(1);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            animateGlow(0);
            onBlur?.(event);
          }}
        />
      </Animated.View>
      {error && (
        <View style={styles.errorRow}>
          {/* Paired with an icon so the message does not rely on colour alone. */}
          <MaterialIcons name="error-outline" size={14} color={colors.danger} />
          <Caption color={colors.danger}>{error}</Caption>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    backgroundColor: colors.glassSunken,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    // 16px minimum — anything smaller triggers iOS focus zoom.
    fontSize: fontSize.subtitle,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
});
