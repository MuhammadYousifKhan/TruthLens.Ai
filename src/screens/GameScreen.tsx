import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { gameItems } from "../data/gameItems";
import { useAuth } from "../context/AuthContext";
import { saveGameResult } from "../firebase/gameResults";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;
type Guess = "real" | "ai";

export default function GameScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;

  const item = gameItems[index];
  const isLast = index === gameItems.length - 1;
  const hasGuessed = guess !== null;
  const wasCorrect = hasGuessed && item && (guess === "ai") === item.isAI;

  useEffect(() => {
    if (hasGuessed) {
      revealAnim.setValue(0);
      Animated.timing(revealAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [hasGuessed]);

  function makeGuess(value: Guess) {
    if (hasGuessed || !item) return;
    setGuess(value);
    const correct = (value === "ai") === item.isAI;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  async function goNext() {
    if (isLast) {
      if (user) {
        const { xpEarned } = await saveGameResult(user.uid, score, gameItems.length);
        if (xpEarned > 0) {
          const newlyEarnedBadges = await checkAndAwardBadges(user.uid);
          await showBadgeUnlockAlert(newlyEarnedBadges);
        }
      }
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setGuess(null);
  }

  function playAgain() {
    setIndex(0);
    setGuess(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  }

  if (gameItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Coming soon</Text>
        <Text style={styles.emptyBody}>
          Game images haven't been added yet — check back once they're bundled in.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Round complete</Text>
        <Text style={styles.resultScore}>
          {score}/{gameItems.length}
        </Text>
        <Text style={styles.emptyBody}>Best streak: {bestStreak}</Text>
        <Pressable style={styles.primaryButton} onPress={playAgain}>
          <Text style={styles.primaryButtonText}>Play again</Text>
        </Pressable>
        <Pressable style={styles.textButton} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.textButtonLabel}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        {index + 1} of {gameItems.length} • Streak {streak}
      </Text>

      <Image source={item.image} style={styles.image} resizeMode="cover" />

      {!hasGuessed ? (
        <View style={styles.guessRow}>
          <Pressable style={styles.guessButton} onPress={() => makeGuess("real")}>
            <Text style={styles.guessButtonText}>Real</Text>
          </Pressable>
          <Pressable style={styles.guessButton} onPress={() => makeGuess("ai")}>
            <Text style={styles.guessButtonText}>AI</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.revealCard,
            wasCorrect ? styles.revealCorrect : styles.revealIncorrect,
            {
              opacity: revealAnim,
              transform: [{ translateY: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            },
          ]}
        >
          <Text style={styles.revealTitle}>{wasCorrect ? "Correct!" : "Not quite"}</Text>
          <Text style={styles.revealTell}>{item.tell}</Text>
        </Animated.View>
      )}

      {hasGuessed && (
        <Pressable style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextButtonText}>{isLast ? "See results" : "Next"}</Text>
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
    marginBottom: spacing.md,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  guessRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  guessButton: {
    flex: 1,
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  guessButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  revealCard: {
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
  },
  revealCorrect: {
    backgroundColor: colors.card,
    borderColor: colors.success,
  },
  revealIncorrect: {
    backgroundColor: colors.card,
    borderColor: colors.danger,
  },
  revealTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  revealTell: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  nextButton: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: fontSize.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
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
});
