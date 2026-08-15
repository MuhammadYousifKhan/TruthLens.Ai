import { StyleSheet, View } from "react-native";
import { useLanguage, type Language } from "../i18n/LanguageContext";
import { PressScale } from "./Buttons";
import { Caption } from "./Typography";
import { colors, radius, spacing, touchTarget } from "../theme/theme";

const OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ur", label: "UR" },
];

/**
 * Device-default-or-manual-override language switch (spec §4.7).
 *
 * A segmented pill rather than a settings-screen toggle, so switching
 * languages is a one-tap, always-visible action — the point is to make the
 * inclusion story demonstrable on camera, not buried in a menu.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const active = option.code === language;
        return (
          <PressScale
            key={option.code}
            onPress={() => setLanguage(option.code)}
            accessibilityRole="tab"
            accessibilityLabel={option.code === "en" ? "English" : "اردو"}
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Caption color={active ? colors.background : colors.textMuted} style={styles.label}>
              {option.label}
            </Caption>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  segment: {
    minWidth: touchTarget.minHeight,
    minHeight: touchTarget.minHeight - 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontWeight: "700",
  },
});
