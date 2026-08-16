import { StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import { deepfakeResponseSteps } from "../data/deepfakeResponseSteps";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Caption,
  FadeIn,
  Heading,
  Overline,
  Pill,
  PressScale,
  Rule,
  Screen,
  Subtitle,
  Title,
} from "../components";
import { motion, spacing, touchTarget } from "../theme/theme";

/**
 * First-response steps for someone who has found a deepfake of a person they
 * know.
 *
 * The calmest screen in the app, by some distance. No grid, no wash, no accent
 * fill: plain ground, ink type, one outlined chip. Whoever opens this is
 * distressed, and alarming someone who is already alarmed does not help them
 * act. The seriousness comes from the 2px rule under the intro and a reading
 * measure set wider than anywhere else.
 */
export default function DeepfakeHelpScreen() {
  const { t } = useLanguage();
  const palette = usePalette();

  return (
    <Screen scroll grid={false}>
      <FadeIn>
        <Pill label={t("nav.deepfakeHelp")} tone={palette.statusAi} style={styles.chip} />
        <Heading style={styles.title}>{t("deepfakeHelp.intro")}</Heading>
        <Subtitle color={palette.textPrimary} style={styles.reassurance}>
          {t("deepfakeHelp.reassurance")}
        </Subtitle>
        <Rule strong style={styles.rule} />
      </FadeIn>

      <View>
        {deepfakeResponseSteps.map((step, index) => (
          <FadeIn key={step.title} delay={motion.stagger * (1 + index)}>
            <View style={[styles.step, { borderBottomColor: palette.lineHairline }]}>
              <Overline color={palette.textTertiary} style={styles.stepNumber}>
                {String(index + 1).padStart(2, "0")}
              </Overline>

              <View style={styles.stepCopy}>
                <Title style={styles.stepTitle}>{t(`deepfakeHelp.steps.${index}.title`)}</Title>
                <Caption>{t(`deepfakeHelp.steps.${index}.body`)}</Caption>

                {step.actions && (
                  <View style={styles.actionRow}>
                    {step.actions.map((action) => (
                      <PressScale
                        key={action.label}
                        onPress={() => WebBrowser.openBrowserAsync(action.url)}
                        accessibilityRole="link"
                        accessibilityLabel={action.label}
                        accessibilityHint="Opens in your browser"
                        style={[styles.actionButton, { borderColor: palette.lineStrong }]}
                      >
                        <Overline color={palette.textPrimary}>{action.label}</Overline>
                        <MaterialIcons
                          name="open-in-new"
                          size={13}
                          color={palette.textPrimary}
                        />
                      </PressScale>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginTop: spacing.md,
  },
  title: {
    marginTop: spacing.lg,
  },
  reassurance: {
    marginTop: spacing.md,
    // The one place in the app set for reading rather than scanning, at a
    // deliberately generous measure.
    maxWidth: 360,
    lineHeight: 26,
  },
  rule: {
    marginTop: spacing.xl,
  },
  step: {
    flexDirection: "row",
    gap: spacing.md + 2,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
  },
  stepNumber: {
    width: 22,
    marginTop: 5,
  },
  stepCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  stepTitle: {
    fontSize: 18,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
});
