import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { saveQuizResult } from "../firebase/quizResults";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  Hero,
  Meter,
  Pill,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

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
      .then(async (result) => {
        setXpEarned(result.xpEarned);
        const newlyEarnedBadges = await checkAndAwardBadges(user.uid);
        await showBadgeUnlockAlert(newlyEarnedBadges);
      })
      .finally(() => setSaving(false));
  }, [user]);

  const passed = total > 0 && score / total >= PASS_RATIO;
  const tone = passed ? colors.success : colors.warning;

  function backToLessons() {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Learn" }] }));
  }

  function retakeQuiz() {
    navigation.replace("Quiz", { lessonId });
  }

  if (saving) {
    return (
      <Screen center>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Caption center>Saving your result</Caption>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll center>
      <FadeIn>
        {/* The score card is a hero surface — this is the payoff moment for
            the whole lesson, so it gets real blur and the largest type. */}
        <BlurCard style={styles.card} tone="strong" accent={tone}>
          <View style={[styles.badge, { borderColor: tone + "55" }]}>
            <MaterialIcons
              name={passed ? "workspace-premium" : "refresh"}
              size={30}
              color={tone}
            />
          </View>

          <Hero center color={tone} style={styles.score}>
            {score}/{total}
          </Hero>

          {/* A failed quiz is framed as "not quite yet", not as a red error.
              The whole app is about building a habit, and habits survive
              missed attempts. */}
          <Title center style={styles.verdict}>
            {passed ? "Passed" : "Not quite — try again"}
          </Title>

          <Meter
            value={total > 0 ? score / total : 0}
            tone={tone}
            animateIn
            style={styles.meter}
            accessibilityLabel={`Scored ${score} out of ${total}`}
          />

          <View style={styles.pillRow}>
            <Pill
              label={xpEarned > 0 ? `+${xpEarned} XP` : "No new XP"}
              icon="bolt"
              tone={xpEarned > 0 ? colors.primary : colors.textMuted}
            />
          </View>

          {xpEarned === 0 && (
            <Caption center style={styles.xpNote}>
              You've already earned XP for this lesson.
            </Caption>
          )}
        </BlurCard>
      </FadeIn>

      <FadeIn delay={motion.stagger} style={styles.actions}>
        <PrimaryButton
          label="Back to lessons"
          onPress={backToLessons}
          icon="menu-book"
          style={styles.action}
        />
        <GhostButton label="Retake quiz" onPress={retakeQuiz} icon="refresh" />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    gap: spacing.lg,
  },
  card: {
    alignItems: "center",
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  score: {
    marginBottom: spacing.xs,
  },
  verdict: {
    marginBottom: spacing.lg,
  },
  meter: {
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  xpNote: {
    marginTop: spacing.md,
  },
  actions: {
    width: "100%",
  },
  action: {
    marginBottom: spacing.xs,
  },
});
