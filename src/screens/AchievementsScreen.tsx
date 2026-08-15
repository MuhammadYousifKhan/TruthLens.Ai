import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { badges } from "../data/badges";
import { useBadges } from "../hooks/useBadges";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GlassCard,
  Meter,
  Screen,
  Subtitle,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

export default function AchievementsScreen() {
  const { earnedIds } = useBadges();
  const earnedCount = badges.filter((badge) => earnedIds.has(badge.id)).length;
  const ratio = badges.length > 0 ? earnedCount / badges.length : 0;

  return (
    <Screen scroll>
      <FadeIn>
        <BlurCard style={styles.summary} tone="strong">
          <View style={styles.summaryHeader}>
            <View style={styles.summaryCopy}>
              <Caption>Badges earned</Caption>
              <Title style={styles.summaryTitle}>
                {earnedCount} of {badges.length}
              </Title>
            </View>
            <View style={styles.summaryChip}>
              <MaterialIcons name="emoji-events" size={22} color={colors.warning} />
            </View>
          </View>
          <Meter
            value={ratio}
            tone={colors.warning}
            animateIn
            style={styles.summaryMeter}
            accessibilityLabel={`${earnedCount} of ${badges.length} badges earned`}
          />
        </BlurCard>
      </FadeIn>

      <View style={styles.grid}>
        {badges.map((badge, index) => {
          const earned = earnedIds.has(badge.id);
          return (
            <FadeIn
              key={badge.id}
              delay={motion.stagger * (1 + index)}
              style={styles.gridItem}
            >
              <GlassCard
                style={[styles.card, !earned && styles.cardLocked]}
                accent={earned ? colors.warning : undefined}
                highlight={earned}
              >
                <View
                  style={[
                    styles.badgeChip,
                    { borderColor: earned ? colors.warning + "55" : colors.glassBorder },
                  ]}
                >
                  {/* Locked badges show a padlock, not a dimmed trophy — the
                      state is stated, not merely implied by opacity. */}
                  <MaterialIcons
                    name={earned ? "military-tech" : "lock-outline"}
                    size={30}
                    color={earned ? colors.warning : colors.textFaint}
                  />
                </View>

                <Subtitle center color={earned ? colors.text : colors.textMuted}>
                  {badge.name}
                </Subtitle>
                <Body
                  center
                  color={earned ? colors.textMuted : colors.textFaint}
                  style={styles.description}
                >
                  {badge.description}
                </Body>

                <Caption center color={earned ? colors.warning : colors.textFaint}>
                  {earned ? "Earned" : "Locked"}
                </Caption>
              </GlassCard>
            </FadeIn>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    marginTop: spacing.xs,
  },
  summaryChip: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.warning + "55",
  },
  summaryMeter: {
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
 gridItem: {
  flexGrow: 1,
  flexBasis: "47%",
  minWidth: 0,
},
  card: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardLocked: {
    opacity: 0.7,
  },
  badgeChip: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xs,
  },
});
