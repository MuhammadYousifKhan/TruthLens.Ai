import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { badges } from "../data/badges";
import { useBadges } from "../hooks/useBadges";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  Meter,
  Numeral,
  Overline,
  Screen,
  Title,
  useResponsive,
} from "../components";
import { spacing } from "../theme/theme";

/**
 * The badge grid.
 *
 * A 1px-gap grid so the tiles read as one ruled block rather than as floating
 * cards. Earned badges sit on filled amber; locked ones on a dashed square
 * with a padlock — the state is stated, never implied by opacity alone.
 */
export default function AchievementsScreen() {
  const { earnedIds } = useBadges();
  const { t } = useLanguage();
  const palette = usePalette();
  const { gridColumns } = useResponsive();

  const earnedCount = badges.filter((badge) => earnedIds.has(badge.id)).length;
  const ratio = badges.length > 0 ? earnedCount / badges.length : 0;

  return (
    <Screen scroll>
      <FadeIn>
        <BlurCard style={styles.hero} tone="strong">
          <Overline>{t("achievements.earnedFor")}</Overline>
          <View style={styles.countRow}>
            <Numeral>{earnedCount}</Numeral>
            <Title color={palette.textSecondary} style={styles.countTotal}>
              {t("achievements.badgesCount", { total: badges.length })}
            </Title>
          </View>
          <Meter
            value={ratio}
            tone={palette.statusUncertain}
            animateIn
            accessibilityLabel={`${earnedCount} of ${badges.length} badges earned`}
          />
        </BlurCard>
      </FadeIn>

      <FadeIn delay={60}>
        <View style={[styles.grid, { backgroundColor: palette.lineHairline, borderColor: palette.lineHairline }]}>
          {badges.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <View
                key={badge.id}
                accessibilityLabel={`${badge.name}. ${
                  earned ? t("common.earned") : t("common.locked")
                }`}
                style={[
                  styles.tile,
                  {
                    backgroundColor: palette.surfaceBase,
                    width: gridColumns === 1 ? "100%" : "49.8%",
                  },
                ]}
              >
                <View
                  style={[
                    styles.mark,
                    earned
                      ? { backgroundColor: palette.statusUncertain }
                      : { borderWidth: 1, borderStyle: "dashed", borderColor: palette.lineStrong },
                  ]}
                >
                  <MaterialIcons
                    name={earned ? "military-tech" : "lock-outline"}
                    size={17}
                    color={earned ? palette.statusUncertainOn : palette.textSecondary}
                  />
                </View>

                <Body style={styles.tileTitle}>{badge.name}</Body>
                <Caption>
                  {earned ? t("common.earned") : `${t("common.locked")} · ${badge.description}`}
                </Caption>
              </View>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <Caption style={styles.footnote}>{t("achievements.footnote")}</Caption>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.xl - 4,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  countTotal: {
    fontSize: 20,
  },
  // The 1px gap is the grid's own background showing through between tiles.
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    borderWidth: 1,
  },
  tile: {
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 128,
  },
  mark: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    fontWeight: "700",
  },
  footnote: {
    marginTop: spacing.lg,
  },
});
