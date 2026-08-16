import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { quizQuestions } from "../data/quizQuestions";
import { lessons } from "../data/lessons";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Body,
  Caption,
  FadeIn,
  Heading,
  Meter,
  Overline,
  PressScale,
  PrimaryButton,
  Screen,
  Subtitle,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

export default function QuizScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const { t } = useLanguage();
  const palette = usePalette();

  const questions = useMemo(
    () => quizQuestions.filter((q) => q.lessonId === lessonId),
    [lessonId]
  );
  const lesson = lessons.find((item) => item.id === lessonId);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);

  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const hasAnswered = selectedIndex !== null;

  function selectOption(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === question.correctIndex) {
      setScore((current) => current + 1);
    } else {
      setMissed((current) => [...current, questionIndex]);
    }
  }

  function goNext() {
    if (isLastQuestion) {
      navigation.replace("QuizResult", {
        lessonId,
        score,
        total: questions.length,
        missed,
      });
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedIndex(null);
  }

  if (!question) {
    return (
      <Screen center>
        <Body muted>{t("quiz.noQuestions")}</Body>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.statusRow}>
          <Overline>
            {t("quiz.questionOf", {
              current: String(questionIndex + 1).padStart(2, "0"),
              total: String(questions.length).padStart(2, "0"),
            })}
          </Overline>
          <Caption numberOfLines={1} style={styles.lessonName}>
            {lesson?.title ?? ""}
          </Caption>
        </View>
        <Meter
          value={(questionIndex + (hasAnswered ? 1 : 0)) / questions.length}
          height={4}
          style={styles.progress}
          accessibilityLabel={`Question ${questionIndex + 1} of ${questions.length}`}
        />
      </FadeIn>

      {/* Keyed on the index so each question animates in fresh — the change of
          content is the feedback that the answer registered. */}
      <FadeIn key={questionIndex} delay={motion.stagger}>
        <Heading style={styles.question}>{question.question}</Heading>

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const isCorrectOption = index === question.correctIndex;
            const isSelected = index === selectedIndex;
            const revealCorrect = hasAnswered && isCorrectOption;
            const revealWrong = hasAnswered && isSelected && !isCorrectOption;
            const tone = revealCorrect
              ? palette.statusAuthentic
              : revealWrong
              ? palette.statusUncertain
              : null;

            return (
              <PressScale
                key={option}
                onPress={() => selectOption(index)}
                disabled={hasAnswered}
                accessibilityRole="button"
                accessibilityLabel={option}
                accessibilityState={{ disabled: hasAnswered, selected: isSelected }}
                style={[
                  styles.option,
                  tone
                    ? { borderColor: tone, borderWidth: 2, backgroundColor: tone + "1F" }
                    : { borderColor: palette.lineHairline, borderWidth: 1 },
                  hasAnswered && !tone && styles.optionSpent,
                ]}
              >
                {/* Result is stated by mark and word as well as colour. */}
                {revealCorrect ? (
                  <View style={[styles.mark, { backgroundColor: palette.statusAuthentic }]}>
                    <MaterialIcons name="check" size={13} color={palette.statusAuthenticOn} />
                  </View>
                ) : revealWrong ? (
                  <View style={[styles.markOutline, { borderColor: palette.statusUncertain }]}>
                    <MaterialIcons name="close" size={13} color={palette.statusUncertain} />
                  </View>
                ) : (
                  <View style={[styles.markOutlineThin, { borderColor: palette.lineStrong }]} />
                )}

                <Subtitle style={styles.optionText}>{option}</Subtitle>

                {revealCorrect && (
                  <Overline color={palette.statusAuthentic}>{t("common.correct")}</Overline>
                )}
                {revealWrong && (
                  <Overline color={palette.statusUncertain}>{t("common.missed")}</Overline>
                )}
              </PressScale>
            );
          })}
        </View>
      </FadeIn>

      {hasAnswered && (
        <FadeIn style={styles.next}>
          <PrimaryButton
            label={isLastQuestion ? t("quiz.seeResults") : t("quiz.nextQuestion")}
            onPress={goNext}
            icon="arrow-forward"
            iconTrailing
          />
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  lessonName: {
    maxWidth: 160,
    textAlign: "right",
  },
  progress: {
    marginTop: spacing.sm,
  },
  question: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md + 3,
  },
  optionSpent: {
    opacity: 0.6,
  },
  mark: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  markOutline: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markOutlineThin: {
    width: 22,
    height: 22,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  next: {
    marginTop: spacing.xl,
  },
});
