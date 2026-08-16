import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useUserProfile } from "../hooks/useUserProfile";
import { useQuizResults } from "../hooks/useQuizResults";
import { useBadges } from "../hooks/useBadges";
import { lessons } from "../data/lessons";
import { badges } from "../data/badges";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Body,
  Caption,
  Display,
  FadeIn,
  Overline,
  PressScale,
  ProfileHeaderMenu,
  Rule,
  Screen,
  SectionLabel,
  Title,
  useTypeStyle,
} from "../components";
import { letterSpacing, motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

/**
 * One loud thing, one warm thing, one quiet list.
 *
 * The scan action is a full-bleed accent field with display type — there is
 * never a question about what this screen is for. Everything else is a ruled
 * index, which is cheaper to scan than a tile grid and reads far better at
 * video resolution than five competing coloured cards did.
 */
export default function DashboardScreen({ navigation }: Props) {
  const t2 = usePalette();
  const { t } = useLanguage();
  const { profile, loading } = useUserProfile();
  const { results } = useQuizResults();
  const { earnedIds } = useBadges();
  const scanLabel = useTypeStyle("body", "extrabold");

  const firstName = loading ? "" : profile?.name?.split(" ")[0] || "there";
  const initials =
    profile?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || undefined;

  const xp = profile?.xp ?? 0;
  const lessonsDone = lessons.filter((lesson) => results[lesson.id]).length;
  const badgesDone = badges.filter((badge) => earnedIds.has(badge.id)).length;

  const index = [
    {
      key: "Learn",
      label: t("dashboard.cardLearnLabel"),
      meta: `${lessonsDone} / ${lessons.length}`,
      onPress: () => navigation.navigate("Learn"),
    },
    {
      key: "Game",
      label: t("dashboard.cardGameLabel"),
      meta: t("dashboard.cardGameHint"),
      onPress: () => navigation.navigate("Game"),
    },
    {
      key: "Achievements",
      label: t("dashboard.cardAchievementsLabel"),
      meta: `${badgesDone} / ${badges.length}`,
      onPress: () => navigation.navigate("Achievements"),
    },
    {
      key: "DeepfakeHelp",
      label: t("dashboard.cardDeepfakeLabel"),
      meta: t("dashboard.cardDeepfakeHint"),
      onPress: () => navigation.navigate("DeepfakeHelp"),
    },
  ];

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Overline>{loading ? t("dashboard.loading") : t("dashboard.welcomeBack")}</Overline>
            <Title style={styles.name}>{loading ? " " : firstName}</Title>
          </View>
          <ProfileHeaderMenu initials={initials} />
        </View>
      </FadeIn>

      {/* XP sits between two rules — a masthead figure, not a badge. */}
      <FadeIn delay={motion.stagger}>
        <View style={[styles.xpBand, { borderColor: t2.lineStrong }]}>
          <Title>{xp.toLocaleString()}</Title>
          <Overline style={styles.xpLabel}>{t("dashboard.xpLabel", { xp })}</Overline>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        <PressScale
          onPress={() => navigation.navigate("Scan")}
          scaleTo={0.985}
          accessibilityRole="button"
          accessibilityLabel={t("dashboard.scanTitle")}
          accessibilityHint={t("dashboard.scanSubtitle")}
          style={[styles.scanField, { backgroundColor: t2.accentBrandFill }]}
        >
          <Overline color={t2.accentOn}>{t("dashboard.scanKicker")}</Overline>
          <Display color={t2.accentOn} style={styles.scanTitle}>
            {t("dashboard.scanTitle")}
          </Display>
          <View style={[styles.scanRule, { backgroundColor: t2.accentOn }]} />
          <View style={styles.scanFoot}>
            <Body style={[scanLabel, styles.scanFootLabel, { color: t2.accentOn }]}>
              {t("dashboard.scanSubtitle").toUpperCase()}
            </Body>
            <MaterialIcons name="arrow-forward" size={22} color={t2.accentOn} />
          </View>
        </PressScale>
      </FadeIn>

      <FadeIn delay={motion.stagger * 3}>
        <PressScale
          onPress={() => navigation.navigate("Pause")}
          accessibilityRole="button"
          accessibilityLabel={t("dashboard.pauseTitle")}
          accessibilityHint={t("dashboard.pauseHint")}
          style={[
            styles.pauseRow,
            { borderColor: t2.statusUncertain, backgroundColor: t2.statusUncertainSoft },
          ]}
        >
          <View style={styles.pauseCopy}>
            <Body style={[scanLabel, { color: t2.statusUncertain }]}>
              {t("dashboard.pauseTitle")}
            </Body>
            <Caption>{t("dashboard.pauseHint")}</Caption>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color={t2.statusUncertain} />
        </PressScale>
      </FadeIn>

      <FadeIn delay={motion.stagger * 4}>
        <SectionLabel style={styles.section}>{t("dashboard.sectionBuildHabit")}</SectionLabel>
      </FadeIn>

      <View style={[styles.index, { borderTopColor: t2.lineHairline }]}>
        {index.map((item, position) => (
          <FadeIn key={item.key} delay={motion.stagger * (5 + position)}>
            <PressScale
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={[styles.indexRow, { borderBottomColor: t2.lineHairline }]}
            >
              <Overline color={t2.textTertiary} style={styles.indexNumber}>
                {String(position + 1).padStart(2, "0")}
              </Overline>
              <Title style={styles.indexLabel}>{item.label}</Title>
              <Caption numberOfLines={1} style={styles.indexMeta}>
                {item.meta}
              </Caption>
              <MaterialIcons name="chevron-right" size={20} color={t2.textSecondary} />
            </PressScale>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    // Reserves the line so the layout does not jump when the name loads.
    minHeight: 26,
  },
  xpBand: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  xpLabel: {
    flex: 1,
  },
  scanField: {
    padding: spacing.xl - 2,
    paddingBottom: spacing.xl - 4,
    gap: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  scanTitle: {
    marginTop: -2,
  },
  scanRule: {
    height: 2,
    opacity: 0.4,
  },
  scanFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  scanFootLabel: {
    flex: 1,
    letterSpacing: letterSpacing.label,
  },
  pauseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  pauseCopy: {
    flex: 1,
    gap: 2,
  },
  section: {
    marginBottom: spacing.xs,
  },
  index: {
    borderTopWidth: 1,
  },
  indexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    borderBottomWidth: 1,
    paddingVertical: spacing.md + 3,
  },
  indexNumber: {
    width: 20,
  },
  indexLabel: {
    flex: 1,
  },
  indexMeta: {
    maxWidth: 96,
    textAlign: "right",
  },
});
