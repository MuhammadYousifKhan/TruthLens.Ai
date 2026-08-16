import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { gameItems } from "../data/gameItems";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import { saveGameResult } from "../firebase/gameResults";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  Meter,
  Numeral,
  Overline,
  Pill,
  PressScale,
  PrimaryButton,
  Rule,
  Screen,
  Subtitle,
  Title,
  useTypeStyle,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;
type Guess = "real" | "ai";

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GameScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const palette = usePalette();
  const choiceLabel = useTypeStyle("subtitle", "extrabold");

  const [items, setItems] = useState(() => shuffled(gameItems));
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const isLast = index === items.length - 1;
  const hasGuessed = guess !== null;
  const wasCorrect = hasGuessed && item && (guess === "ai") === item.isAI;
  const revealTone = wasCorrect ? palette.statusAuthentic : palette.statusAi;

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
        const { xpEarned } = await saveGameResult(user.uid, score, items.length);
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
    setItems(shuffled(gameItems));
    setIndex(0);
    setGuess(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  }

  if (gameItems.length === 0) {
    return (
      <Screen scroll center>
        <FadeIn>
          <Title>{t("game.comingSoonTitle")}</Title>
          <Body muted style={styles.emptyBody}>
            {t("game.comingSoonBody")}
          </Body>
          <PrimaryButton
            label={t("game.backToDashboard")}
            onPress={() => navigation.navigate("Dashboard")}
            icon="arrow-forward"
            iconTrailing
          />
        </FadeIn>
      </Screen>
    );
  }

  if (finished) {
    return (
      <Screen scroll>
        <FadeIn>
          <BlurCard style={styles.resultCard} tone="strong">
            <Overline>{t("game.roundComplete")}</Overline>
            <View style={styles.scoreRow}>
              <Numeral color={palette.accentBrand}>{score}</Numeral>
              <Title style={styles.scoreTotal} color={palette.textSecondary}>
                / {items.length}
              </Title>
            </View>
            <Meter
              value={score / items.length}
              tone={palette.accentBrand}
              animateIn
              accessibilityLabel={t("game.ofCount", { current: score, total: items.length })}
            />
            <Pill
              label={t("game.bestStreak", { n: bestStreak })}
              tone={palette.statusUncertain}
              style={styles.streakPill}
            />
          </BlurCard>
        </FadeIn>

        <FadeIn delay={motion.stagger} style={styles.resultActions}>
          <PrimaryButton
            label={t("game.playAgain")}
            onPress={playAgain}
            icon="refresh"
            style={styles.action}
          />
          <GhostButton
            label={t("game.backToDashboard")}
            onPress={() => navigation.navigate("Dashboard")}
          />
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.statusRow}>
          <Overline>
            {t("game.round")} {String(index + 1).padStart(2, "0")} / {items.length}
          </Overline>
          {/* The streak only appears once it exists — an empty streak counter
              is a reminder of failure, not a motivator. */}
          {streak > 0 && (
            <Pill label={t("game.streakInARow", { n: streak })} tone={palette.statusAuthentic} />
          )}
        </View>
        <Meter
          value={(index + (hasGuessed ? 1 : 0)) / items.length}
          height={4}
          style={styles.progress}
          accessibilityLabel={t("game.ofCount", { current: index + 1, total: items.length })}
        />
      </FadeIn>

      <FadeIn key={index} delay={motion.stagger}>
        <View
          style={[
            styles.frame,
            { borderColor: palette.lineHairline, backgroundColor: palette.imagePlaceholder },
          ]}
        >
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        </View>
      </FadeIn>

      {hasGuessed && (
        // Keyed on the guess so the reveal animates in as its own event.
        <FadeIn key={`reveal-${index}`}>
          <View
            style={[
              styles.reveal,
              { borderColor: revealTone, backgroundColor: revealTone + "1F" },
            ]}
          >
            <View style={styles.revealHead}>
              <View style={[styles.revealMark, { backgroundColor: revealTone }]}>
                <MaterialIcons
                  name={wasCorrect ? "check" : "close"}
                  size={16}
                  color={wasCorrect ? palette.statusAuthenticOn : palette.statusAiOn}
                />
              </View>
              <Title color={revealTone} style={styles.revealTitle}>
                {(wasCorrect ? t("game.correct") : t("game.notQuite")).toUpperCase()} —{" "}
                {(item.isAI ? t("game.aiGenerated") : t("game.realPhoto")).toUpperCase()}
              </Title>
            </View>

            <Rule style={styles.revealRule} />

            <Overline>{t("game.theTell")}</Overline>
            {/* The tell is the actual lesson, so it is the largest body text
                in the app — 17/600, not a caption. */}
            <Subtitle style={styles.tell}>
              {language === "ur" ? item.tellUr : item.tell}
            </Subtitle>
          </View>
        </FadeIn>
      )}

      <View style={[styles.choices, hasGuessed && styles.choicesSpent]}>
        {(["real", "ai"] as Guess[]).map((option) => (
          <PressScale
            key={option}
            onPress={() => makeGuess(option)}
            disabled={hasGuessed}
            accessibilityRole="button"
            accessibilityLabel={t(`game.${option}`)}
            accessibilityState={{ disabled: hasGuessed }}
            style={styles.choiceWrapper}
          >
            {/* Two equal-weight ruled boxes, so neither is nudged. Colour
                arrives only at the reveal. */}
            <View style={[styles.choice, { borderColor: palette.lineStrong }]}>
              <Body style={choiceLabel}>{t(`game.${option}`).toUpperCase()}</Body>
            </View>
          </PressScale>
        ))}
      </View>

      {hasGuessed && (
        <FadeIn>
          <PrimaryButton
            label={isLast ? t("game.seeResults") : t("game.nextImage")}
            onPress={goNext}
            icon="arrow-forward"
            iconTrailing
            style={styles.next}
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
    minHeight: 28,
    gap: spacing.md,
  },
  progress: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  frame: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 280,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  reveal: {
    borderWidth: 2,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  revealHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  revealMark: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  revealTitle: {
    flex: 1,
  },
  revealRule: {
    marginVertical: spacing.xs,
  },
  tell: {
    marginTop: 2,
  },
  choices: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  choicesSpent: {
    opacity: 0.4,
  },
  choiceWrapper: {
    flex: 1,
  },
  choice: {
    minHeight: 56,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  next: {
    marginTop: spacing.lg,
  },
  emptyBody: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  resultCard: {
    padding: spacing.xl - 2,
    gap: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  scoreTotal: {
    fontSize: 24,
  },
  streakPill: {
    marginTop: spacing.xs,
  },
  resultActions: {
    gap: spacing.sm,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
