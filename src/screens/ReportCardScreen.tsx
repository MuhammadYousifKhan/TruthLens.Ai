import { useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { useUserProfile } from "../hooks/useUserProfile";
import { useQuizResults } from "../hooks/useQuizResults";
import { useBadges } from "../hooks/useBadges";
import { useVerificationActions } from "../hooks/useVerificationActions";
import { lessons } from "../data/lessons";
import { badges } from "../data/badges";
import {
  Body,
  Caption,
  Display,
  FadeIn,
  Overline,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

/**
 * The shareable habits card.
 *
 * Everything inside `cardRef` is opaque on purpose. react-native-view-shot
 * captures the view in isolation, so translucent glass would come out black
 * and a BlurView would come out blank — the card paints its own gradient
 * ground and carries its own branding so it still reads as TruthLens when it
 * lands in someone else's feed with no app around it.
 */
export default function ReportCardScreen() {
  const cardRef = useRef<View>(null);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const stats = [
    { value: String(profile.xp), label: "XP" },
    { value: `${completedLessons.length}/${lessons.length}`, label: "Lessons" },
    { value: String(verificationCount), label: "Verified first" },
  ];

  return (
    <Screen scroll>
      <FadeIn>
        <View ref={cardRef} collapsable={false} style={styles.card}>
          {/* Opaque ground — this is what makes the capture usable. */}
          <LinearGradient
            colors={[colors.backgroundLift, colors.background, "#0A1A2E"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardEdge} pointerEvents="none" />

          <View style={styles.brandRow}>
            <MaterialIcons name="center-focus-strong" size={18} color={colors.primary} />
            <Overline color={colors.primary}>TruthLens AI</Overline>
          </View>

          <Title style={styles.name}>{profile.name}'s MIL habits</Title>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Display color={colors.primary} style={styles.statValue}>
                  {stat.value}
                </Display>
                <Caption center>{stat.label}</Caption>
              </View>
            ))}
          </View>

          <View style={styles.badgesRow}>
            {earnedBadges.length === 0 ? (
              <Caption>No badges yet — this is the start.</Caption>
            ) : (
              earnedBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <MaterialIcons name="military-tech" size={16} color={colors.warning} />
                  <Caption color={colors.text}>{badge.name}</Caption>
                </View>
              ))
            )}
          </View>

          <View style={styles.taglineRow}>
            <View style={styles.taglineRule} />
            <Body muted style={styles.tagline}>
              Think before you share. Verify before you trust.
            </Body>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <PrimaryButton
          label="Share my habits"
          onPress={shareCard}
          icon="ios-share"
          accessibilityHint="Saves this card as an image and opens the share sheet"
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: radius.sheet,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: "hidden",
    // Opaque fallback in case the gradient fails to paint during capture.
    backgroundColor: colors.background,
  },
  cardEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  name: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.warning + "44",
    backgroundColor: "rgba(255, 179, 71, 0.10)",
  },
  taglineRow: {
    gap: spacing.md,
  },
  taglineRule: {
    height: 1,
    backgroundColor: colors.glassBorder,
  },
  tagline: {
    fontStyle: "italic",
  },
});
