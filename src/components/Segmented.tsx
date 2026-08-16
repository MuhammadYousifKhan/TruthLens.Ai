import { StyleSheet, View, type ViewStyle, type StyleProp } from "react-native";
import { useLanguage, type Language } from "../i18n/LanguageContext";
import { useTheme, usePalette, type ThemePreference } from "../theme/ThemeContext";
import { PressScale } from "./Buttons";
import { useTypeStyle } from "./Typography";
import { radius, spacing, touchTarget } from "../theme/theme";
import { Animated } from "react-native";

/**
 * Segmented controls.
 *
 * A ruled strip of square cells with one inverted cell for the active choice.
 * No sliding thumb: the selected cell simply flips to the ink colour, which is
 * the same move the checkboxes and status chips make elsewhere.
 */

type Option<T extends string> = { value: T; label: string; a11y?: string };

function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
  compact,
}: {
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const t = usePalette();
  const labelStyle = useTypeStyle("caption", "extrabold");

  return (
    <View
      style={[styles.track, { borderColor: t.lineHairline, borderRadius: radius.pill }, style]}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <PressScale
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.a11y ?? option.label}
            accessibilityState={{ selected: active }}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              active && { backgroundColor: t.textPrimary },
            ]}
          >
            <Animated.Text
              style={[labelStyle, { color: active ? t.surfaceBase : t.textSecondary }]}
            >
              {option.label}
            </Animated.Text>
          </PressScale>
        );
      })}
    </View>
  );
}

/**
 * Device-default-or-manual language switch (spec 4.7).
 *
 * Always one tap, never buried in a menu — the inclusion story has to be
 * demonstrable on camera.
 */
export function LanguageToggle({ style }: { style?: StyleProp<ViewStyle> }) {
  const { language, setLanguage } = useLanguage();

  const options: Option<Language>[] = [
    { value: "en", label: "EN", a11y: "English" },
    { value: "ur", label: "اُردو", a11y: "Urdu" },
  ];

  return <Segmented options={options} value={language} onChange={setLanguage} style={style} />;
}

/** System / light / dark. Mirrors what every OS offers. */
export function AppearanceToggle({ style }: { style?: StyleProp<ViewStyle> }) {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();

  const options: Option<ThemePreference>[] = [
    { value: "system", label: t("appearance.system"), a11y: t("appearance.systemA11y") },
    { value: "light", label: t("appearance.light") },
    { value: "dark", label: t("appearance.dark") },
  ];

  return (
    <Segmented options={options} value={preference} onChange={setPreference} style={style} compact />
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderWidth: 1,
    overflow: "hidden",
  },
  segment: {
    minWidth: 44,
    minHeight: touchTarget.minHeight - 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  segmentCompact: {
    minWidth: 40,
    paddingHorizontal: spacing.sm + 2,
  },
});
