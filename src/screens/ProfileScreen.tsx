import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { auth } from "../firebase/config";
import { useUserProfile } from "../hooks/useUserProfile";
import { useQuizResults } from "../hooks/useQuizResults";
import { useBadges } from "../hooks/useBadges";
import { useVerificationActions } from "../hooks/useVerificationActions";
import { lessons } from "../data/lessons";
import { badges } from "../data/badges";
import {
  BlurCard,
  Body,
  BodyStrong,
  Caption,
  Display,
  FadeIn,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, loading } = useUserProfile();
  const { results } = useQuizResults();
  const { earnedIds } = useBadges();
  const { count: verificationCount } = useVerificationActions();

  const completedLessons = lessons.filter((lesson) => results[lesson.id]);

  function handleLogOut() {
    signOut(auth);
  }

  if (loading || !profile) {
    return (
      <Screen center>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const initial = profile.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Heading color={colors.primary}>{initial}</Heading>
          </View>
          <View style={styles.headerCopy}>
            <Title>{profile.name}</Title>
            <Caption>{profile.email}</Caption>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <View style={styles.statsRow}>
          <BlurCard style={styles.statCard} tone="strong">
            <Display color={colors.primary}>{profile.xp}</Display>
            <Caption center>Total XP</Caption>
          </BlurCard>
          <BlurCard style={styles.statCard} tone="strong">
            <Display color={colors.secondary}>
              {completedLessons.length}/{lessons.length}
            </Display>
            <Caption center>Lessons done</Caption>
          </BlurCard>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        <SectionLabel>Verification habits</SectionLabel>
        {/* The one stat the app actually cares about, so it gets its own
            surface and a sentence rather than a bare number. */}
        <GlassCard
          style={styles.habitsCard}
          accent={verificationCount > 0 ? colors.success : undefined}
        >
          <MaterialIcons
            name={verificationCount > 0 ? "verified-user" : "lightbulb-outline"}
            size={22}
            color={verificationCount > 0 ? colors.success : colors.warning}
          />
          <Body style={styles.habitsText}>
            {verificationCount === 0
              ? "You haven't verified before sharing yet — try the Pause screen next time you scan something."
              : `You've verified before sharing ${verificationCount} time${
                  verificationCount === 1 ? "" : "s"
                }. Keep it up.`}
          </Body>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={motion.stagger * 3}>
        <SectionLabel>Quiz scores</SectionLabel>
        <GlassCard style={styles.card}>
          {completedLessons.length === 0 ? (
            <Body muted style={styles.emptyText}>
              No quizzes completed yet.
            </Body>
          ) : (
            completedLessons.map((lesson, index) => {
              const result = results[lesson.id];
              return (
                <View
                  key={lesson.id}
                  style={[
                    styles.quizRow,
                    index < completedLessons.length - 1 && styles.divider,
                  ]}
                >
                  <Body style={styles.quizTitle}>{lesson.title}</Body>
                  <BodyStrong color={colors.primary}>
                    {result.score}/{result.total}
                  </BodyStrong>
                </View>
              );
            })
          )}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={motion.stagger * 4}>
        <SectionLabel>Badges</SectionLabel>
        <View style={styles.badgesStrip}>
          {badges.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <View
                key={badge.id}
                style={[styles.badgeItem, !earned && styles.badgeLocked]}
                accessibilityLabel={`${badge.name}. ${earned ? "Earned" : "Locked"}`}
              >
                <MaterialIcons
                  name={earned ? "military-tech" : "lock-outline"}
                  size={26}
                  color={earned ? colors.warning : colors.textFaint}
                />
                <Caption center color={earned ? colors.text : colors.textFaint}>
                  {badge.name}
                </Caption>
              </View>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 5} style={styles.actions}>
        <PrimaryButton
          label="Share my MIL habits"
          onPress={() => navigation.navigate("ReportCard")}
          icon="ios-share"
          style={styles.action}
        />
        {/* Destructive, so it is outlined in the danger tone rather than
            filled — it must be findable but never the easiest thing to hit. */}
        <SecondaryButton
          label="Log out"
          onPress={handleLogOut}
          icon="logout"
          tone={colors.danger}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primary + "55",
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  habitsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  habitsText: {
    flex: 1,
    lineHeight: 21,
  },
  card: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  emptyText: {
    paddingVertical: spacing.lg,
  },
  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  quizTitle: {
    flex: 1,
  },
  badgesStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  badgeItem: {
    width: 88,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  badgeLocked: {
    opacity: 0.55,
  },
  actions: {
    marginTop: spacing.sm,
  },
  action: {
    marginBottom: spacing.md,
  },
});
