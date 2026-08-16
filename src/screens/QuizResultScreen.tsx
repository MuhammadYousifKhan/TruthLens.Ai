import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { saveQuizResult } from "../firebase/quizResults";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import { quizQuestions } from "../data/quizQuestions";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  Meter,
  Numeral,
  Overline,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "QuizResult">;

const PASS_RATIO = 0.6;

export default function QuizResultScreen({ navigation, route }: Props) {
  const { lessonId, score, total, missed = [] } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const palette = usePalette();

  const [saving, setSaving] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const started = useRef(false);

  const questions = useMemo(
    () => quizQuestions.filter((q) => q.lessonId === lessonId),
    [lessonId]
  );

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
  // A failed quiz is amber, never red. The whole app is about building a
  // habit, and habits survive missed attempts.
  const tone = passed ? palette.statusAuthentic : palette.statusUncertain;
  const toneOn = passed ? palette.statusAuthenticOn : palette.statusUncertainOn;

  if (saving) {
    return (
      <Screen center>
        <ActivityIndicator size="large" color={palette.accentBrand} />
      </Screen>
    );
  }

  return (
    <Screen scroll wash="topRight" washTone={palette.statusUncertainSoft}>
      <FadeIn>
        <BlurCard style={styles.hero} tone="strong">
          <View style={[styles.badge, { backgroundColor: tone }]}>
            <MaterialIcons
              name={passed ? "workspace-premium" : "refresh"}
              size={22}
              color={toneOn}
            />
          </View>

          <View style={styles.scoreRow}>
            <Numeral>{score}</Numeral>
            <Title color={palette.textSecondary} style={styles.scoreTotal}>
              / {total}
            </Title>
          </View>

          <Title color={tone} style={styles.verdict}>
            {passed ? t("quiz.passed") : t("quiz.notQuite")}
          </Title>

          <Meter
            value={total > 0 ? score / total : 0}
            tone={tone}
            animateIn
            accessibilityLabel={`Scored ${score} out of ${total}`}
          />

          {/* The earned XP is stated so a retake never feels like a reset. */}
          <Body muted style={styles.xpNote}>
            {xpEarned > 0 ? t("quiz.keepXp", { xp: xpEarned }) : t("quiz.alreadyEarned")}
          </Body>
        </BlurCard>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <View style={[styles.list, { borderTopColor: palette.lineStrong }]}>
          {questions.map((question, index) => {
            const wasMissed = missed.includes(index);
            return (
              <View
                key={question.question}
                style={[styles.row, { borderBottomColor: palette.lineHairline }]}
              >
                {wasMissed ? (
                  <View style={[styles.markOutline, { borderColor: palette.statusUncertain }]}>
                    <MaterialIcons name="close" size={12} color={palette.statusUncertain} />
                  </View>
                ) : (
                  <View style={[styles.mark, { backgroundColor: palette.statusAuthentic }]}>
                    <MaterialIcons name="check" size={12} color={palette.statusAuthenticOn} />
                  </View>
                )}

                <Body numberOfLines={2} style={styles.rowText}>
                  {question.question}
                </Body>

                {/* The row is marked MISSED rather than the attempt failing. */}
                {wasMissed && (
                  <Overline color={palette.statusUncertain}>{t("common.missed")}</Overline>
                )}
              </View>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2} style={styles.actions}>
        <PrimaryButton
          label={t("quiz.backToLessons")}
          onPress={() =>
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Learn" }] }))
          }
          icon="arrow-forward"
          iconTrailing
          style={styles.action}
        />
        <GhostButton
          label={t("quiz.retake")}
          onPress={() => navigation.replace("Quiz", { lessonId })}
          icon="refresh"
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.xl - 4,
    gap: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  badge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  scoreTotal: {
    fontSize: 24,
  },
  verdict: {
    fontSize: 24,
  },
  xpNote: {
    marginTop: 2,
  },
  list: {
    borderTopWidth: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.md + 1,
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
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
