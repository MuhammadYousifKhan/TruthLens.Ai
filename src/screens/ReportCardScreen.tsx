import { useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { useUserProfile } from "../hooks/useUserProfile";
import { useQuizResults } from "../hooks/useQuizResults";
import { useBadges } from "../hooks/useBadges";
import { useVerificationActions } from "../hooks/useVerificationActions";
import { lessons } from "../data/lessons";
import { badges } from "../data/badges";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Body,
  Caption,
  FadeIn,
  Overline,
  Pill,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { motion, spacing } from "../theme/theme";

/**
 * The shareable habits card.
 *
 * Everything inside `cardRef` is fully opaque in both modes — #201E1D on dark,
 * #FFFFFF on light. react-native-view-shot captures the view in isolation, so
 * translucent glass would come out black and a BlurView would come out blank.
 * The card also carries its own brand row and rule, because it lands in
 * someone else's feed with no app around it.
 */
export default function ReportCardScreen() {
  const cardRef = useRef<View>(null);
  const { t } = useLanguage();
  const palette = usePalette();
  const { profile, loading } = useUserProfile();
  const { results } = useQuizResults();
  const { earnedIds } = useBadges();
  const { count: verificationCount } = useVerificationActions();

  const completedLessons = lessons.filter((lesson) => results[lesson.id]);
  const earnedBadges = badges.filter((badge) => earnedIds.has(badge.id));

  async function shareCard() {
    if (!cardRef.current) return;
    const uri = await captureRef(cardRef, { format: "png", quality: 1 });
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    await Sharing.shareAsync(uri, { mimeType: "image/png" });
  }

  if (loading || !profile) {
    return (
      <Screen center>
        <ActivityIndicator size="large" color={palette.accentBrand} />
      </Screen>
    );
  }

  const stats = [
    { value: String(completedLessons.length), label: t("profile.lessonsLabel") },
    { value: String(verificationCount), label: t("reportCard.verifiedFirst") },
    { value: profile.xp.toLocaleString(), label: t("reportCard.xp") },
  ];

  return (
    <Screen scroll>
      <FadeIn>
        <Overline style={styles.kicker}>{t("reportCard.preview")}</Overline>

        <View
          ref={cardRef}
          collapsable={false}
          style={[
            styles.card,
            { backgroundColor: palette.surfacePanel, borderColor: palette.lineHairline },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.brand}>
              <View style={[styles.mark, { borderColor: palette.accentBrand }]} />
              <Overline color={palette.textPrimary}>TruthLens AI</Overline>
            </View>
            <Overline>AUG 2026</Overline>
          </View>

          <View style={[styles.accentRule, { backgroundColor: palette.accentBrand }]} />

          <Title style={styles.name}>{t("reportCard.habitsTitle", { name: profile.name })}</Title>

          {/* 1px gaps rather than gutters — the tiles read as one ruled block. */}
          <View style={[styles.statsRow, { backgroundColor: palette.lineHairline }]}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[styles.stat, { backgroundColor: palette.surfacePanel }]}
              >
                <Title style={styles.statValue}>{stat.value}</Title>
                <Overline>{stat.label}</Overline>
              </View>
            ))}
          </View>

          <View style={styles.badgeRow}>
            {earnedBadges.length === 0 ? (
              <Caption>{t("reportCard.noBadges")}</Caption>
            ) : (
              earnedBadges.map((badge) => <Pill key={badge.id} label={badge.name} />)
            )}
          </View>

          <View style={[styles.footRule, { backgroundColor: palette.lineHairline }]} />
          <Body muted>{t("reportCard.tagline")}</Body>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger} style={styles.actions}>
        <PrimaryButton
          label={t("reportCard.shareHabits")}
          onPress={shareCard}
          icon="arrow-forward"
          iconTrailing
          accessibilityHint="Saves this card as an image and opens the share sheet"
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    marginBottom: spacing.md,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    padding: spacing.xl - 2,
    gap: spacing.lg + 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  mark: {
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  accentRule: {
    height: 2,
  },
  name: {
    fontSize: 30,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: "row",
    gap: 1,
  },
  stat: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 26,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
  },
  footRule: {
    height: 1,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
