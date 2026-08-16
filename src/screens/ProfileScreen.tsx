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
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  AppearanceToggle,
  BlurCard,
  Body,
  Caption,
  FadeIn,
  LanguageToggle,
  Overline,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const palette = usePalette();
  const { profile, loading } = useUserProfile();
  const { results } = useQuizResults();
  const { earnedIds } = useBadges();
  const { count: verificationCount } = useVerificationActions();

  const completedLessons = lessons.filter((lesson) => results[lesson.id]);
  const earnedCount = badges.filter((badge) => earnedIds.has(badge.id)).length;

  if (loading || !profile) {
    return (
      <Screen center>
        <ActivityIndicator size="large" color={palette.accentBrand} />
      </Screen>
    );
  }

  const initials =
    profile.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.header}>
          <View style={[styles.avatar, { borderColor: palette.lineStrong }]}>
            <Title>{initials}</Title>
          </View>
          <View style={styles.headerCopy}>
            <Title>{profile.name}</Title>
            <Caption>{profile.email}</Caption>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <View style={styles.stats}>
          <BlurCard style={styles.stat} tone="strong">
            <Title style={styles.statValue}>{profile.xp.toLocaleString()}</Title>
            <Overline>{t("profile.totalXp")}</Overline>
          </BlurCard>
          <BlurCard style={styles.stat} tone="strong">
            <Title style={styles.statValue}>
              {completedLessons.length}/{lessons.length}
            </Title>
            <Overline>{t("profile.lessonsLabel")}</Overline>
          </BlurCard>
        </View>
      </FadeIn>

      {/* The one stat the app actually cares about, so it gets a sentence
          rather than a bare number. */}
      <FadeIn delay={motion.stagger * 2}>
        <View style={[styles.habits, { borderColor: palette.lineHairline }]}>
          <Overline>{t("profile.verificationHabits")}</Overline>
          <Subtitle style={styles.habitsText}>
            {verificationCount === 0
              ? t("profile.habitsEmpty")
              : t("profile.habitsCount", { n: verificationCount })}
          </Subtitle>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 3}>
        <View style={styles.settings}>
          <View style={[styles.settingRow, { borderTopColor: palette.lineHairline }]}>
            <Overline style={styles.settingLabel}>{t("headerMenu.language")}</Overline>
            <LanguageToggle />
          </View>
          <View style={[styles.settingRow, { borderTopColor: palette.lineHairline }]}>
            <Overline style={styles.settingLabel}>{t("headerMenu.appearance")}</Overline>
            <AppearanceToggle />
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 4}>
        <View style={[styles.badgeBlock, { borderTopColor: palette.lineHairline }]}>
          <Overline style={styles.badgeHeading}>
            {t("profile.badgesLabel", { done: earnedCount, total: badges.length })}
          </Overline>
          <View style={styles.badgeStrip}>
            {badges.map((badge) => {
              const earned = earnedIds.has(badge.id);
              return (
                <View
                  key={badge.id}
                  accessibilityLabel={`${badge.name}. ${
                    earned ? t("common.earned") : t("common.locked")
                  }`}
                  style={[
                    styles.badge,
                    earned
                      ? { backgroundColor: palette.statusUncertain, borderColor: palette.statusUncertain }
                      : { borderColor: palette.lineHairline, borderStyle: "dashed" },
                  ]}
                >
                  <MaterialIcons
                    name={earned ? "military-tech" : "lock-outline"}
                    size={18}
                    color={earned ? palette.statusUncertainOn : palette.textTertiary}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </FadeIn>

      {completedLessons.length > 0 && (
        <FadeIn delay={motion.stagger * 5}>
          <View style={[styles.quizBlock, { borderTopColor: palette.lineHairline }]}>
            <Overline style={styles.badgeHeading}>{t("profile.quizScores")}</Overline>
            {completedLessons.map((lesson) => (
              <View
                key={lesson.id}
                style={[styles.quizRow, { borderBottomColor: palette.lineHairline }]}
              >
                <Body style={styles.quizTitle}>{lesson.title}</Body>
                <Caption color={palette.textPrimary}>
                  {results[lesson.id].score}/{results[lesson.id].total}
                </Caption>
              </View>
            ))}
          </View>
        </FadeIn>
      )}

      <FadeIn delay={motion.stagger * 6} style={styles.actions}>
        <PrimaryButton
          label={t("profile.shareHabits")}
          onPress={() => navigation.navigate("ReportCard")}
          icon="arrow-forward"
          iconTrailing
          style={styles.action}
        />
        {/* Destructive, so it is outlined in the accent rather than filled —
            it must be findable but never the easiest thing to hit. */}
        <SecondaryButton
          label={t("profile.logOut")}
          onPress={() => signOut(auth)}
          tone={palette.accentBrandText}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    padding: spacing.md + 2,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 32,
  },
  habits: {
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  habitsText: {
    marginTop: 2,
  },
  settings: {
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  settingLabel: {
    flex: 1,
  },
  badgeBlock: {
    borderTopWidth: 1,
    paddingTop: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  badgeHeading: {
    marginBottom: spacing.md,
  },
  badgeStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badge: {
    width: 42,
    height: 42,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quizBlock: {
    borderTopWidth: 1,
    paddingTop: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  quizTitle: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm + 2,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
