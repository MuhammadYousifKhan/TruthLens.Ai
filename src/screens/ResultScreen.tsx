import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import type { Palette } from "../theme/theme";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  Numeral,
  Overline,
  Pill,
  PressScale,
  PrimaryButton,
  Ruler,
  Screen,
  SecondaryButton,
  SectionLabel,
  Title,
  useTypeStyle,
} from "../components";
import { fontSize, letterSpacing, motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

/**
 * Verdict bands.
 *
 * The marker moves and the ruler does not, so all three bands are one
 * component rather than three states. The verdict never rides on colour alone
 * — each band carries its own words, and the number is stated next to them.
 *
 * The hedged middle band is amber rather than red on purpose: "uncertain" is a
 * real answer here, not a failure.
 */
function verdictFor(probability: number, t: (key: string) => string, palette: Palette) {
  if (probability >= 55) {
    return {
      label: t("result.verdictHighLabel"),
      short: t("result.verdictHighShort"),
      color: palette.statusAi,
    };
  }
  if (probability >= 35) {
    return {
      label: t("result.verdictMidLabel"),
      short: t("result.verdictMidShort"),
      color: palette.statusUncertain,
    };
  }
  return {
    label: t("result.verdictLowLabel"),
    short: t("result.verdictLowShort"),
    color: palette.statusAuthentic,
  };
}

export default function ResultScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl, probability, confidence, flags, explanation, tells, source } =
    route.params;
  const { t } = useLanguage();
  const palette = usePalette();
  const verdictType = useTypeStyle("title");
  const [detailOpen, setDetailOpen] = useState(false);

  const verdict = verdictFor(probability, t, palette);
  const sourceNote = source === "model" ? t("result.sourceModel") : t("result.sourceOffline");

  function scanAnother() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));
  }

  return (
    <Screen scroll wash="topRight">
      {/* The one translucent surface on the screen. Everything below is
          opaque and ruled, which is what keeps the hero the hero. */}
      <FadeIn>
        <BlurCard style={styles.hero} tone="strong">
          <View style={styles.heroHead}>
            <View
              style={[
                styles.thumb,
                { borderColor: palette.lineHairline, backgroundColor: palette.imagePlaceholder },
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
            <View style={styles.heroMeta}>
              <Overline>{t("result.estimateKicker")}</Overline>
              <Caption color={palette.textPrimary}>{verdict.short}</Caption>
            </View>
          </View>

          {/* Report-scale figure, the verdict set beside it rather than under
              it — the number and the words arrive together. */}
          <View style={styles.figureRow}>
            <Numeral color={verdict.color}>{probability}</Numeral>
            <Title color={verdict.color} style={styles.percent}>
              %
            </Title>
            <Title style={[verdictType, styles.verdictLabel]}>
              {verdict.label.toUpperCase()}
            </Title>
          </View>

          {/* The caveat travels with the score — it must not be somewhere the
              user can scroll past. */}
          <View
            style={[
              styles.disclaimer,
              { backgroundColor: palette.surfaceSunken, borderLeftColor: verdict.color },
            ]}
          >
            <Caption color={palette.textPrimary}>
              {t("result.disclaimer")} {sourceNote}
            </Caption>
          </View>

          <Ruler
            value={probability / 100}
            tone={verdict.color}
            style={styles.ruler}
            accessibilityLabel={`${probability} percent estimated AI-generated. ${verdict.label}.`}
            bands={[
              { label: t("result.bandAuthentic"), width: "35%" },
              { label: t("result.bandUncertain"), width: "20%", tone: palette.statusUncertain },
              { label: t("result.bandAi"), width: "45%", tone: palette.statusAi },
            ]}
          />

          <View style={styles.pillRow}>
            <Pill label={t("result.confidencePill", { pct: confidence })} />
            <Pill label={source === "model" ? t("result.modelPill") : t("result.offlinePill")} />
          </View>
        </BlurCard>
      </FadeIn>

      {tells && tells.length > 0 && (
        <FadeIn delay={motion.stagger}>
          <SectionLabel>{t("result.whatToLookAt")}</SectionLabel>
          <View style={[styles.list, { borderTopColor: palette.lineHairline }]}>
            {tells.map((tell, index) => (
              <View
                key={tell.label}
                style={[styles.listRow, { borderBottomColor: palette.lineHairline }]}
              >
                <Overline color={palette.accentBrand} style={styles.listNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Overline>
                <View style={styles.listCopy}>
                  <Body>{tell.label}</Body>
                  <Caption>{tell.why}</Caption>
                </View>
              </View>
            ))}
          </View>
        </FadeIn>
      )}

      {/* Signals and "what this means" fold into one disclosure — six sections
          compressed to three. */}
      <FadeIn delay={motion.stagger * 2}>
        <PressScale
          onPress={() => setDetailOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={t("result.whatThisMeans")}
          accessibilityState={{ expanded: detailOpen }}
          style={[styles.disclosure, { borderColor: palette.lineHairline }]}
        >
          <Overline style={styles.disclosureLabel}>{t("result.whatThisMeans")}</Overline>
          <MaterialIcons
            name={detailOpen ? "expand-less" : "expand-more"}
            size={20}
            color={palette.textSecondary}
          />
        </PressScale>

        {detailOpen && (
          <View style={styles.detail}>
            <Body style={styles.explanation}>{explanation}</Body>
            {flags.map((flag) => (
              <View key={flag} style={styles.flagRow}>
                <View style={[styles.flagMark, { backgroundColor: verdict.color }]} />
                <Body style={styles.flagText}>{flag}</Body>
              </View>
            ))}
          </View>
        )}
      </FadeIn>

      {probability >= 55 && (
        <FadeIn delay={motion.stagger * 3}>
          <PressScale
            onPress={() => navigation.navigate("DeepfakeHelp")}
            accessibilityRole="button"
            accessibilityLabel={t("result.deepfakeCta")}
            style={[styles.deepfake, { borderColor: palette.statusAi }]}
          >
            <Body style={styles.deepfakeText} color={palette.accentBrandText}>
              {t("result.deepfakeCta")}
            </Body>
            <MaterialIcons name="arrow-forward" size={20} color={palette.accentBrandText} />
          </PressScale>
        </FadeIn>
      )}

      <FadeIn delay={motion.stagger * 4} style={styles.actions}>
        <PrimaryButton
          label={t("result.learnHow")}
          onPress={() => navigation.navigate("Guide", { imageUri, imageUrl })}
          icon="arrow-forward"
          iconTrailing
          style={styles.action}
        />
        <View style={styles.actionRow}>
          <SecondaryButton
            label={t("result.share")}
            onPress={() => navigation.navigate("Pause", { imageUri, imageUrl })}
            style={styles.actionHalf}
          />
          <GhostButton
            label={t("result.scanAnother")}
            onPress={scanAnother}
            style={styles.actionHalf}
          />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg + 2,
    paddingBottom: spacing.xl - 4,
    gap: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  heroHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  figureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  percent: {
    fontSize: 26,
    marginTop: 6,
  },
  verdictLabel: {
    flex: 1,
    marginTop: 4,
  },
  disclaimer: {
    borderLeftWidth: 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  ruler: {
    marginTop: spacing.xs,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
  },
  list: {
    borderTopWidth: 1,
    marginBottom: spacing.xl,
  },
  listRow: {
    flexDirection: "row",
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  listNumber: {
    width: 18,
    marginTop: 3,
  },
  listCopy: {
    flex: 1,
    gap: 2,
  },
  disclosure: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },
  disclosureLabel: {
    flex: 1,
  },
  detail: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  explanation: {
    marginBottom: spacing.xs,
  },
  flagRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  flagMark: {
    width: 8,
    height: 8,
    marginTop: 7,
  },
  flagText: {
    flex: 1,
  },
  deepfake: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.xl,
  },
  deepfakeText: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
  },
  action: {
    marginBottom: spacing.sm + 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  actionHalf: {
    flex: 1,
  },
});
