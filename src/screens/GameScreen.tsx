import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { gameItems } from "../data/gameItems";
import { useAuth } from "../context/AuthContext";
import { saveGameResult } from "../firebase/gameResults";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import {
  BlurCard,
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GhostButton,
  GlassCard,
  Hero,
  Meter,
  Pill,
  PressScale,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from "../components";
import { absoluteFill, colors, motion, radius, spacing, touchTarget } from "../theme/theme";

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

  const item = gameItems[index];
  const isLast = index === gameItems.length - 1;
  const hasGuessed = guess !== null;
  const wasCorrect = hasGuessed && item && (guess === "ai") === item.isAI;

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
      <Screen center>
        <FadeIn>
          <GlassCard style={styles.emptyCard}>
            <MaterialIcons name="hourglass-empty" size={32} color={colors.textFaint} />
            <Title center>Coming soon</Title>
            <Body muted center>
              Game images haven't been added yet — check back once they're bundled in.
            </Body>
            <PrimaryButton
              label="Back to dashboard"
              onPress={() => navigation.navigate("Dashboard")}
              style={styles.emptyButton}
            />
          </GlassCard>
        </FadeIn>
      </Screen>
    );
  }

  if (finished) {
    const ratio = score / gameItems.length;
    return (
      <Screen scroll center>
        <FadeIn>
          <BlurCard style={styles.resultCard} tone="strong" accent={colors.primary}>
            <View style={styles.trophy}>
              <MaterialIcons name="visibility" size={30} color={colors.primary} />
            </View>
            <Caption center>Round complete</Caption>
            <Hero center color={colors.primary} style={styles.resultScore}>
              {score}/{gameItems.length}
            </Hero>
            <Meter
              value={ratio}
              tone={colors.primary}
              animateIn
              style={styles.resultMeter}
              accessibilityLabel={`Scored ${score} out of ${gameItems.length}`}
            />
            <View style={styles.pillRow}>
              <Pill label={`Best streak ${bestStreak}`} icon="local-fire-department" tone={colors.warning} />
            </View>
          </BlurCard>
        </FadeIn>

        <FadeIn delay={motion.stagger} style={styles.resultActions}>
          <PrimaryButton
            label="Play again"
            onPress={playAgain}
            icon="refresh"
            style={styles.action}
          />
          <GhostButton
            label="Back to dashboard"
            onPress={() => navigation.navigate("Dashboard")}
            icon="home"
          />
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.statusRow}>
          <Caption>
            {index + 1} of {gameItems.length}
          </Caption>
          {/* The streak only appears once it exists — an empty streak counter
              is a reminder of failure, not a motivator. */}
          {streak > 0 && (
            <Pill
              label={`${streak} in a row`}
              icon="local-fire-department"
              tone={colors.warning}
            />
          )}
        </View>
        <Meter
          value={(index + (hasGuessed ? 1 : 0)) / gameItems.length}
          tone={colors.primary}
          height={6}
          style={styles.progressMeter}
          accessibilityLabel={`Image ${index + 1} of ${gameItems.length}`}
        />
      </FadeIn>

      <FadeIn key={index} delay={motion.stagger}>
        <View style={styles.imageFrame}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={styles.imageEdge} pointerEvents="none" />
        </View>

        {!hasGuessed ? (
          <View style={styles.guessRow}>
            {/* Two equal-weight choices, so neither is nudged. Colour comes
                only at the reveal. */}
            <PressScale
              onPress={() => makeGuess("real")}
              accessibilityRole="button"
              accessibilityLabel="Real"
              accessibilityHint="Guess that this photo is authentic"
              style={styles.guessWrapper}
            >
              <GlassCard style={styles.guessButton} tone="strong" radius={radius.input}>
                <MaterialIcons name="photo-camera" size={22} color={colors.text} />
                <Subtitle>Real</Subtitle>
              </GlassCard>
            </PressScale>

            <PressScale
              onPress={() => makeGuess("ai")}
              accessibilityRole="button"
              accessibilityLabel="A I generated"
              accessibilityHint="Guess that this image was generated by AI"
              style={styles.guessWrapper}
            >
              <GlassCard style={styles.guessButton} tone="strong" radius={radius.input}>
                <MaterialIcons name="auto-awesome" size={22} color={colors.text} />
                <Subtitle>AI</Subtitle>
              </GlassCard>
            </PressScale>
          </View>
        ) : (
          // Keyed on the guess so the reveal animates in as its own event.
          <FadeIn key={`reveal-${index}`}>
            <GlassCard
              style={styles.revealCard}
              accent={wasCorrect ? colors.success : colors.danger}
            >
              <View style={styles.revealHeader}>
                <MaterialIcons
                  name={wasCorrect ? "check-circle" : "cancel"}
                  size={22}
                  color={wasCorrect ? colors.success : colors.danger}
                />
                <BodyStrong color={wasCorrect ? colors.success : colors.danger}>
                  {wasCorrect ? "Correct" : "Not quite"}
                </BodyStrong>
                <View style={styles.revealSpacer} />
                <Caption>{item.isAI ? "AI-generated" : "Real photo"}</Caption>
              </View>
              {/* The tell is the actual lesson — it gets body weight, not
                  caption weight, because it is why the game exists. */}
              <Body style={styles.revealTell}>{item.tell}</Body>
            </GlassCard>

            <PrimaryButton
              label={isLast ? "See results" : "Next image"}
              onPress={goNext}
              icon="arrow-forward"
              iconTrailing
              style={styles.next}
            />
          </FadeIn>
        )}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 28,
    marginBottom: spacing.sm,
  },
  progressMeter: {
    marginBottom: spacing.xl,
  },
  imageFrame: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.glassSunken,
    marginBottom: spacing.xl,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageEdge: {
    ...absoluteFill,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  guessRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  guessWrapper: {
    flex: 1,
  },
  guessButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: touchTarget.minHeight + 8,
  },
  revealCard: {
    padding: spacing.lg,
  },
  revealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  revealSpacer: {
    flex: 1,
  },
  revealTell: {
    lineHeight: 21,
  },
  next: {
    marginTop: spacing.lg,
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  resultCard: {
    alignItems: "center",
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  trophy: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primary + "55",
    marginBottom: spacing.lg,
  },
  resultScore: {
    marginBottom: spacing.lg,
  },
  resultMeter: {
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  resultActions: {
    width: "100%",
  },
  action: {
    marginBottom: spacing.xs,
  },
});
