import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { quizQuestions } from "../data/quizQuestions";
import {
  Body,
  Caption,
  FadeIn,
  GlassCard,
  Meter,
  PressScale,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { colors, motion, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

export default function QuizScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const questions = useMemo(
    () => quizQuestions.filter((q) => q.lessonId === lessonId),
    [lessonId]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const hasAnswered = selectedIndex !== null;

  function selectOption(optionIndex: number) {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === question.correctIndex) {
      setScore((current) => current + 1);
    }
  }

  function goNext() {
    if (isLastQuestion) {
      navigation.replace("QuizResult", { lessonId, score, total: questions.length });
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedIndex(null);
  }

  if (!question) {
    return (
      <Screen center>
        <GlassCard style={styles.missing}>
          <MaterialIcons name="quiz" size={28} color={colors.textFaint} />
          <Body muted center>
            No quiz questions found for this lesson.
          </Body>
        </GlassCard>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.progressRow}>
          <Caption>
            Question {questionIndex + 1} of {questions.length}
          </Caption>
          <Caption color={colors.primary}>
            {score} correct
          </Caption>
        </View>
        <Meter
          value={(questionIndex + (hasAnswered ? 1 : 0)) / questions.length}
          tone={colors.secondary}
          height={6}
          style={styles.progressMeter}
          accessibilityLabel={`Question ${questionIndex + 1} of ${questions.length}`}
        />
      </FadeIn>

      {/* Keyed on the index so each question animates in fresh — the change of
          content is the feedback that the answer registered. */}
      <FadeIn key={questionIndex} delay={motion.stagger}>
        <Title style={styles.question}>{question.question}</Title>

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const isCorrectOption = index === question.correctIndex;
            const isSelected = index === selectedIndex;
            const revealCorrect = hasAnswered && isCorrectOption;
            const revealWrong = hasAnswered && isSelected && !isCorrectOption;

            const tone = revealCorrect
              ? colors.success
              : revealWrong
              ? colors.danger
              : undefined;

            return (
              <PressScale
                key={option}
                onPress={() => selectOption(index)}
                disabled={hasAnswered}
                accessibilityRole="button"
                accessibilityLabel={option}
                accessibilityState={{ disabled: hasAnswered, selected: isSelected }}
                style={styles.optionWrapper}
              >
                <GlassCard
                  style={styles.option}
                  radius={radius.input}
                  accent={tone}
                  highlight={!hasAnswered}
                >
                  <Body style={styles.optionText} color={tone ?? colors.text}>
                    {option}
                  </Body>
                  {/* Result is stated by icon as well as colour. */}
                  {revealCorrect && (
                    <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  )}
                  {revealWrong && (
                    <MaterialIcons name="cancel" size={20} color={colors.danger} />
                  )}
                </GlassCard>
              </PressScale>
            );
          })}
        </View>
      </FadeIn>

      {hasAnswered && (
        <FadeIn style={styles.next}>
          <PrimaryButton
            label={isLastQuestion ? "See results" : "Next question"}
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressMeter: {
    marginBottom: spacing.xl,
  },
  question: {
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  optionWrapper: {
    width: "100%",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  next: {
    marginTop: spacing.xl,
  },
  missing: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
});
