import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import { useQuizResults } from "../hooks/useQuizResults";
import {
  BlurCard,
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GlassCard,
  Meter,
  PressScale,
  Screen,
  SectionLabel,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Learn">;

export default function LearnHubScreen({ navigation }: Props) {
  const { results } = useQuizResults();
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = sortedLessons.filter((lesson) => results[lesson.id]).length;
  const ratio = sortedLessons.length > 0 ? completedCount / sortedLessons.length : 0;

  return (
    <Screen scroll>
      {/* Progress leads the screen: seeing "3 of 6" is what makes the next
          lesson feel worth opening. */}
      <FadeIn>
        <BlurCard style={styles.progressCard} tone="strong">
          <View style={styles.progressHeader}>
            <View style={styles.progressCopy}>
              <Caption>Your progress</Caption>
              <Title style={styles.progressTitle}>
                {completedCount} of {sortedLessons.length} lessons
              </Title>
            </View>
            <View style={styles.progressChip}>
              <MaterialIcons name="school" size={22} color={colors.secondary} />
            </View>
          </View>
          <Meter
            value={ratio}
            tone={colors.secondary}
            animateIn
            style={styles.progressMeter}
            accessibilityLabel={`${completedCount} of ${sortedLessons.length} lessons completed`}
          />
        </BlurCard>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <SectionLabel>Lessons</SectionLabel>
      </FadeIn>

      {sortedLessons.map((lesson, index) => {
        const isComplete = Boolean(results[lesson.id]);
        return (
          <FadeIn key={lesson.id} delay={motion.stagger * (2 + index)}>
            <PressScale
              onPress={() => navigation.navigate("LessonDetail", { lessonId: lesson.id })}
              accessibilityRole="button"
              accessibilityLabel={lesson.title}
              accessibilityHint={isComplete ? "Completed. Opens the lesson" : "Opens the lesson"}
              style={styles.rowWrapper}
            >
              <GlassCard
                style={styles.row}
                accent={isComplete ? colors.success : undefined}
              >
                {/* Completion carries an icon and a text badge, so it never
                    depends on the green alone. */}
                <MaterialIcons
                  name={isComplete ? "check-circle" : "radio-button-unchecked"}
                  size={24}
                  color={isComplete ? colors.success : colors.textFaint}
                />
                <View style={styles.rowCopy}>
                  <BodyStrong>{lesson.title}</BodyStrong>
                  <Caption color={isComplete ? colors.success : colors.textFaint}>
                    {isComplete ? "Completed" : `Lesson ${index + 1}`}
                  </Caption>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.textFaint} />
              </GlassCard>
            </PressScale>
          </FadeIn>
        );
      })}

      {sortedLessons.length === 0 && (
        <FadeIn delay={motion.stagger * 2}>
          <GlassCard style={styles.empty}>
            <Body muted center>
              No lessons available yet.
            </Body>
          </GlassCard>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  progressCopy: {
    flex: 1,
    gap: 2,
  },
  progressTitle: {
    marginTop: spacing.xs,
  },
  progressChip: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.secondary + "55",
  },
  progressMeter: {
    marginTop: spacing.lg,
  },
  rowWrapper: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  empty: {
    padding: spacing.xl,
  },
});
