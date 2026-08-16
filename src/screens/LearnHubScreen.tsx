import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import { useQuizResults } from "../hooks/useQuizResults";
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
  PressScale,
  Screen,
  Title,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Learn">;

export default function LearnHubScreen({ navigation }: Props) {
  const { results } = useQuizResults();
  const { t } = useLanguage();
  const palette = usePalette();

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const completed = sorted.filter((lesson) => results[lesson.id]).length;
  const ratio = sorted.length > 0 ? completed / sorted.length : 0;
  const nextIndex = sorted.findIndex((lesson) => !results[lesson.id]);

  return (
    <Screen scroll>
      {/* Progress leads the screen: seeing "2 of 6" is what makes the next
          lesson feel worth opening. */}
      <FadeIn>
        <BlurCard style={styles.hero} tone="strong">
          <Overline>{t("learn.progress")}</Overline>
          <View style={styles.countRow}>
            <Numeral>{completed}</Numeral>
            <Title color={palette.textSecondary} style={styles.countTotal}>
              {t("learn.lessonsCount", { total: sorted.length })}
            </Title>
          </View>
          <Meter
            value={ratio}
            animateIn
            accessibilityLabel={`${completed} of ${sorted.length} lessons completed`}
          />
        </BlurCard>
      </FadeIn>

      <View style={[styles.list, { borderTopColor: palette.lineStrong }]}>
        {sorted.map((lesson, index) => {
          const isComplete = Boolean(results[lesson.id]);
          const isNext = index === nextIndex;
          const result = results[lesson.id];

          return (
            <FadeIn key={lesson.id} delay={motion.stagger * (1 + index)}>
              <PressScale
                onPress={() => navigation.navigate("LessonDetail", { lessonId: lesson.id })}
                accessibilityRole="button"
                accessibilityLabel={lesson.title}
                accessibilityHint={isComplete ? "Completed. Opens the lesson" : "Opens the lesson"}
                style={[
                  styles.row,
                  { borderBottomColor: palette.lineHairline },
                  isNext && { backgroundColor: palette.statusAiSoft },
                  !isComplete && !isNext && styles.rowPending,
                ]}
              >
                {/* Completion carries a mark and a word, so it never depends
                    on the green alone. */}
                {isComplete ? (
                  <View style={[styles.mark, { backgroundColor: palette.statusAuthentic }]}>
                    <MaterialIcons name="check" size={13} color={palette.statusAuthenticOn} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.markOutline,
                      {
                        borderColor: isNext ? palette.accentBrand : palette.lineStrong,
                        borderWidth: isNext ? 2 : 1,
                      },
                    ]}
                  />
                )}

                <View style={styles.rowCopy}>
                  <Body style={styles.rowTitle}>{lesson.title}</Body>
                  <Caption color={isNext ? palette.accentBrandText : undefined}>
                    {isComplete
                      ? `${t("quiz.passed")} · ${result.score}/${result.total}`
                      : isNext
                      ? t("learn.upNext")
                      : `${t("nav.lesson")} ${index + 1}`}
                  </Caption>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={isNext ? palette.accentBrand : palette.textSecondary}
                />
              </PressScale>
            </FadeIn>
          );
        })}
      </View>

      {sorted.length === 0 && (
        <FadeIn delay={motion.stagger}>
          <Body muted>No lessons available yet.</Body>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.xl - 4,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  countTotal: {
    fontSize: 20,
  },
  list: {
    borderTopWidth: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  rowPending: {
    opacity: 0.62,
  },
  mark: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  markOutline: {
    width: 20,
    height: 20,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontWeight: "700",
  },
});
