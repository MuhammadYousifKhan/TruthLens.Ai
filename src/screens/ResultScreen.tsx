import { Image, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useLanguage } from "../i18n/LanguageContext";
import {
  BlurCard,
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GhostButton,
  GlassCard,
  Heading,
  Meter,
  Pill,
  PressScale,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
} from "../components";
import { absoluteFill, colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

/**
 * Verdict styling.
 *
 * The verdict never rides on colour alone — each band carries its own icon and
 * its own words, so the result survives greyscale and colour-blindness. The
 * hedged middle band is deliberately amber rather than red: "uncertain" is a
 * real answer here, not a failure.
 */
function verdictFor(probability: number, t: (key: string) => string) {
  if (probability >= 55) {
    return {
      label: t("result.verdictHighLabel"),
      short: t("result.verdictHighShort"),
      color: colors.danger,
      icon: "report-problem" as const,
    };
  }
  if (probability >= 35) {
    return {
      label: t("result.verdictMidLabel"),
      short: t("result.verdictMidShort"),
      color: colors.warning,
      icon: "help-outline" as const,
    };
  }
  return {
    label: t("result.verdictLowLabel"),
    short: t("result.verdictLowShort"),
    color: colors.success,
    icon: "verified" as const,
  };
}

export default function ResultScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl, probability, confidence, flags, explanation, tells, source } =
    route.params;
  const { t } = useLanguage();
  const verdict = verdictFor(probability, t);
  const sourceNote = source === "model" ? t("result.sourceModel") : t("result.sourceOffline");

  function scanAnother() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));
  }

  function shareResult() {
    navigation.navigate("Pause", { imageUri, imageUrl });
  }

  return (
    <Screen scroll>
      {/* Hero verdict. One of the four surfaces with real backdrop blur —
          it is the moment the whole flow exists to deliver. */}
      <FadeIn>
        <BlurCard style={styles.verdictCard} tone="strong" accent={verdict.color}>
          <View style={styles.verdictHeader}>
            <View style={styles.thumbFrame}>
              <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={styles.thumbEdge} pointerEvents="none" />
            </View>

            <View style={styles.verdictCopy}>
              <View style={styles.verdictLabelRow}>
                <MaterialIcons name={verdict.icon} size={20} color={verdict.color} />
                <Caption color={verdict.color} style={styles.verdictShort}>
                  {verdict.short}
                </Caption>
              </View>
              <Heading color={verdict.color} style={styles.verdictHeadline}>
                {verdict.label}
              </Heading>
            </View>
          </View>

          <Meter
            value={probability / 100}
            tone={verdict.color}
            animateIn
            style={styles.meter}
            accessibilityLabel={`${probability} percent estimated AI-generated. ${verdict.label}.`}
          />

          <View style={styles.pillRow}>
            <Pill label={t("result.estimatedPill", { pct: probability })} icon="percent" tone={verdict.color} />
            <Pill label={t("result.confidencePill", { pct: confidence })} icon="insights" tone={colors.info} />
            <Pill
              label={source === "model" ? t("result.modelPill") : t("result.offlinePill")}
              icon={source === "model" ? "memory" : "wifi-off"}
              tone={colors.textMuted}
            />
          </View>
        </BlurCard>
      </FadeIn>

      {/* Placed directly under the number on purpose: the caveat has to travel
          with the score, not sit somewhere it can be scrolled past. */}
      <FadeIn delay={motion.stagger}>
        <GlassCard style={styles.disclaimer} tone="sunken" highlight={false}>
          <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
          <Caption style={styles.disclaimerText}>
            {t("result.disclaimer")} {sourceNote}
          </Caption>
        </GlassCard>
      </FadeIn>

      {tells && tells.length > 0 && (
        <FadeIn delay={motion.stagger * 2}>
          <SectionLabel>{t("result.whatToLookAt")}</SectionLabel>
          <GlassCard style={styles.card}>
            {tells.map((tell, index) => (
              <View
                key={tell.label}
                style={[styles.tellRow, index < tells.length - 1 && styles.divider]}
              >
                <View style={styles.tellIndex}>
                  <Caption color={colors.primary}>{index + 1}</Caption>
                </View>
                <View style={styles.tellCopy}>
                  <BodyStrong>{tell.label}</BodyStrong>
                  <Caption>{tell.why}</Caption>
                </View>
              </View>
            ))}
          </GlassCard>
        </FadeIn>
      )}

      <FadeIn delay={motion.stagger * 3}>
        <SectionLabel>{t("result.signals")}</SectionLabel>
        <GlassCard style={styles.card}>
          {flags.map((flag, index) => (
            <View
              key={flag}
              style={[styles.flagRow, index < flags.length - 1 && styles.divider]}
            >
              <View style={[styles.flagDot, { backgroundColor: verdict.color }]} />
              <Body style={styles.flagText}>{flag}</Body>
            </View>
          ))}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={motion.stagger * 4}>
        <SectionLabel>{t("result.whatThisMeans")}</SectionLabel>
        <GlassCard style={styles.explanationCard}>
          <Body>{explanation}</Body>
        </GlassCard>
      </FadeIn>

      {probability >= 55 && (
        <FadeIn delay={motion.stagger * 5}>
          <PressScale
            onPress={() => navigation.navigate("DeepfakeHelp")}
            accessibilityRole="button"
            accessibilityLabel={t("result.deepfakeCta")}
            style={styles.deepfakeWrapper}
          >
            <GlassCard style={styles.deepfakeCard} accent={colors.danger}>
              <MaterialIcons name="shield" size={20} color={colors.danger} />
              <Body style={styles.deepfakeText}>{t("result.deepfakeCta")}</Body>
              <MaterialIcons name="chevron-right" size={20} color={colors.danger} />
            </GlassCard>
          </PressScale>
        </FadeIn>
      )}

      <FadeIn delay={motion.stagger * 6} style={styles.actions}>
        <PrimaryButton
          label={t("result.learnHow")}
          onPress={() => navigation.navigate("Guide", { imageUri, imageUrl })}
          icon="fact-check"
          style={styles.action}
        />
        <SecondaryButton
          label={t("result.share")}
          onPress={shareResult}
          icon="ios-share"
          style={styles.action}
        />
        <GhostButton label={t("result.scanAnother")} onPress={scanAnother} icon="refresh" />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verdictCard: {
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  verdictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  thumbFrame: {
    width: 88,
    height: 88,
    borderRadius: radius.input,
    overflow: "hidden",
    backgroundColor: colors.glassSunken,
  },
  thumbEdge: {
    ...absoluteFill,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  verdictCopy: {
    flex: 1,
    gap: 2,
  },
  verdictLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  verdictShort: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 12,
  },
  meter: {
    marginTop: spacing.lg,
  },
  verdictHeadline: {
    marginTop: spacing.xs,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    flex: 1,
  },
  card: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  tellRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  tellIndex: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tellCopy: {
    flex: 1,
    gap: 2,
  },
  flagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flagText: {
    flex: 1,
  },
  explanationCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  deepfakeWrapper: {
    marginBottom: spacing.xl,
  },
  deepfakeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  deepfakeText: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
