import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { useUserProfile } from "../hooks/useUserProfile";
import { useQuizResults } from "../hooks/useQuizResults";
import { useBadges } from "../hooks/useBadges";
import { useVerificationActions } from "../hooks/useVerificationActions";
import { lessons } from "../data/lessons";
import { badges } from "../data/badges";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

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
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View ref={cardRef} collapsable={false} style={styles.card}>
        <Text style={styles.brand}>TruthLens AI</Text>
        <Text style={styles.name}>{profile.name}'s MIL habits</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {completedLessons.length}/{lessons.length}
            </Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{verificationCount}</Text>
            <Text style={styles.statLabel}>Verified before sharing</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {earnedBadges.length === 0 ? (
            <Text style={styles.noBadges}>No badges yet</Text>
          ) : (
            earnedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <MaterialIcons name="military-tech" size={22} color={colors.primary} />
                <Text style={styles.badgeLabel}>{badge.name}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.tagline}>Think before you share. Verify before you trust.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
        onPress={shareCard}
      >
        <Text style={styles.shareButtonText}>Share my habits</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.onPrimaryMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    marginTop: spacing.xs,
    fontSize: fontSize.heading,
    fontWeight: "700",
    color: colors.white,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.card,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.white,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.onPrimaryMuted,
    textAlign: "center",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeItem: {
    alignItems: "center",
    width: 72,
  },
  badgeLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.white,
    textAlign: "center",
  },
  noBadges: {
    fontSize: fontSize.body,
    color: colors.onPrimaryMuted,
  },
  tagline: {
    fontSize: fontSize.body,
    color: colors.onPrimaryMuted,
    fontStyle: "italic",
  },
  shareButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
