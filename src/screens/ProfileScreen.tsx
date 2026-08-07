import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

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
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {completedLessons.length}/{lessons.length}
          </Text>
          <Text style={styles.statLabel}>Lessons completed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Verification habits</Text>
      <View style={styles.card}>
        <Text style={styles.habitsText}>
          {verificationCount === 0
            ? "You haven't verified before sharing yet — try the Pause screen next time you scan something."
            : `You've verified before sharing ${verificationCount} time${verificationCount === 1 ? "" : "s"}. Keep it up.`}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quiz scores</Text>
      <View style={styles.card}>
        {completedLessons.length === 0 ? (
          <Text style={styles.emptyText}>No quizzes completed yet.</Text>
        ) : (
          completedLessons.map((lesson) => {
            const result = results[lesson.id];
            return (
              <View key={lesson.id} style={styles.quizRow}>
                <Text style={styles.quizLessonTitle}>{lesson.title}</Text>
                <Text style={styles.quizScore}>
                  {result.score}/{result.total}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgesStrip}>
        {badges.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <View key={badge.id} style={styles.badgeItem}>
              <MaterialIcons
                name="military-tech"
                size={28}
                color={earned ? colors.primary : colors.border}
              />
              <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>
                {badge.name}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.reportCardButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate("ReportCard")}
      >
        <Text style={styles.reportCardButtonText}>Share my MIL habits</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.logOutButton, pressed && styles.pressed]}
        onPress={handleLogOut}
      >
        <Text style={styles.logOutText}>Log out</Text>
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
  },
  header: {
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.text,
  },
  email: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.primary,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  habitsText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 20,
  },
  quizRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  quizLessonTitle: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  quizScore: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.primary,
  },
  badgesStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  badgeItem: {
    alignItems: "center",
    width: 80,
  },
  badgeLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.text,
    textAlign: "center",
  },
  badgeLabelLocked: {
    color: colors.textMuted,
  },
  reportCardButton: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  reportCardButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  logOutButton: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  logOutText: {
    color: colors.danger,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
