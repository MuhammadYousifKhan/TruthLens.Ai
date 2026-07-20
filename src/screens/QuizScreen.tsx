import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { quizQuestions } from "../data/quizQuestions";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

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
      <View style={styles.container}>
        <Text style={styles.questionText}>No quiz questions found for this lesson.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        Question {questionIndex + 1} of {questions.length}
      </Text>
      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.optionsList}>
        {question.options.map((option, index) => {
          const isCorrectOption = index === question.correctIndex;
          const isSelected = index === selectedIndex;

          const isHighlighted =
            hasAnswered && (isCorrectOption || (isSelected && !isCorrectOption));

          let optionStyle = styles.option;
          if (hasAnswered && isCorrectOption) {
            optionStyle = styles.optionCorrect;
          } else if (hasAnswered && isSelected && !isCorrectOption) {
            optionStyle = styles.optionIncorrect;
          }

          return (
            <Pressable
              key={option}
              style={optionStyle}
              onPress={() => selectOption(index)}
              disabled={hasAnswered}
            >
              <Text style={isHighlighted ? styles.optionTextHighlighted : styles.optionText}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasAnswered && (
        <Pressable style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? "See results" : "Next question"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  progressText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: fontSize.title,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xl,
  },
  optionsList: {
    gap: spacing.md,
  },
  option: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionCorrect: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.success,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionIncorrect: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.danger,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  optionTextHighlighted: {
    fontSize: fontSize.body,
    color: colors.white,
    fontWeight: "600",
  },
  nextButton: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
});
