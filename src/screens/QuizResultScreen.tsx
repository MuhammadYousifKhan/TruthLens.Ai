import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { saveQuizResult } from "../firebase/quizResults";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "QuizResult">;

const PASS_RATIO = 0.6;

export default function QuizResultScreen({ navigation, route }: Props) {
  const { lessonId, score, total } = route.params;
  const { user } = useAuth();
  const [saving, setSaving] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !user) return;
    started.current = true;

    saveQuizResult(user.uid, lessonId, score, total)
      .then((result) => setXpEarned(result.xpEarned))
      .finally(() => setSaving(false));
  }, [user]);

  const passed = total > 0 && score / total >= PASS_RATIO;

  function backToLessons() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Learn" }] }));
  }

  function retakeQuiz() {
    navigation.replace("Quiz", { lessonId });
  }

  return (
    <View style={styles.container}>
      {saving ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <Text style={[styles.score, { color: passed ? colors.success : colors.danger }]}>
            {score}/{total}
          </Text>
          <Text style={styles.passLabel}>{passed ? "Passed!" : "Not quite — try again"}</Text>
          <Text style={styles.xpText}>
            {xpEarned > 0 ? `+${xpEarned} XP earned` : "No new XP (already completed)"}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={backToLessons}
          >
            <Text style={styles.primaryButtonText}>Back to lessons</Text>
          </Pressable>
          <Pressable style={styles.textButton} onPress={retakeQuiz}>
            <Text style={styles.textButtonLabel}>Retake quiz</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
  },
  passLabel: {
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  xpText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  textButton: {
    minHeight: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  textButtonLabel: {
    color: colors.primary,
    fontSize: fontSize.body,
  },
  pressed: {
    opacity: 0.85,
  },
});
