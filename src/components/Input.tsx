import { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePalette } from "../theme/ThemeContext";
import { fontSize, radius, spacing, touchTarget } from "../theme/theme";
import { Caption, Overline, useTypeStyle } from "./Typography";

/**
 * A text field.
 *
 * Opaque white in light, a sunken channel in dark — either way it reads as
 * somewhere to put something rather than as another card. Focus swaps the
 * hairline to the accent; that colour shift, not a glow, is the focus
 * indicator, and it is visible enough to satisfy WCAG's focus-visible
 * requirement for keyboard users.
 *
 * Font size is pinned at 16 because iOS zooms the viewport on any smaller
 * focused input.
 */

type GlassInputProps = TextInputProps & {
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Small uppercase label above the field. */
  label?: string;
  /** Renders an accent left rule and the message below. */
  error?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function GlassInput({
  icon,
  label,
  error,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: GlassInputProps) {
  const t = usePalette();
  const inputStyle = useTypeStyle("subtitle", "regular");
  const [focused, setFocused] = useState(false);
  const shift = useRef(new Animated.Value(0)).current;

  const borderColor = error
    ? t.statusAi
    : focused
    ? t.accentBrand
    : t.lineHairline;

  return (
    <View style={containerStyle}>
      {label && <Overline style={styles.label}>{label}</Overline>}

      <View
        style={[
          styles.field,
          {
            backgroundColor: t.surfaceSunken,
            borderColor,
            borderRadius: radius.input,
          },
          // The error rule is a thick left edge rather than a full red box —
          // it marks the field without shouting over the value inside it.
          error ? { borderLeftWidth: 2, borderLeftColor: t.statusAi } : null,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={focused ? t.accentBrand : t.textTertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          {...rest}
          style={[
            styles.input,
            inputStyle,
            // 16px minimum — anything smaller triggers iOS focus zoom.
            { fontSize: fontSize.subtitle, color: t.textPrimary },
            style,
          ]}
          placeholderTextColor={t.textPlaceholder}
          selectionColor={t.accentBrand}
          cursorColor={t.accentBrand}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>

      {error && (
        <View style={styles.errorRow}>
          {/* Paired with an icon so the message does not rely on colour alone. */}
          <MaterialIcons name="error-outline" size={14} color={t.statusAi} />
          <Caption color={t.statusAi} style={styles.errorText}>
            {error}
          </Caption>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs + 2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: touchTarget.minHeight,
    borderWidth: 1,
    paddingHorizontal: spacing.md + 2,
  },
  icon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: {
    flex: 1,
  },
});
