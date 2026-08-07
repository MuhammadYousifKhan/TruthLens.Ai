import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import * as Sharing from "expo-sharing";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { awardVerificationActionXp } from "../firebase/actions";
import {
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GlassCard,
  Heading,
  Meter,
  PressScale,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "../components";
import { colors, motion, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Pause">;
type CheckId = "source" | "seenElsewhere" | "emotion";

const COOLDOWN_MS = 2500;
const TICK_MS = 100;

const CHECKS: { id: CheckId; label: string; hint: string }[] = [
  { id: "source", label: "Do you know the source?", hint: "Who posted it first?" },
  { id: "seenElsewhere", label: "Have you seen it elsewhere?", hint: "One outlet is not enough" },
  {
    id: "emotion",
    label: "Does it make you feel a strong emotion?",
    hint: "Outrage travels faster than truth",
  },
];

/**
 * The friction screen.
 *
 * The whole point is to slow the share down, so the design leans into the
 * wait instead of hiding it: a meter fills for 2.5s before the share button
 * unlocks, and "I'll verify first" is styled as the primary action while it
 * does. The delay is visible and finite, which makes it feel deliberate rather
 * than broken.
 */
export default function PauseScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl } = route.params ?? {};
  const { user } = useAuth();
  const hasImage = Boolean(imageUri);

  const [checks, setChecks] = useState<Record<CheckId, boolean>>({
    source: false,
    seenElsewhere: false,
    emotion: false,
  });
  const [elapsed, setElapsed] = useState(0);
  const canShare = elapsed >= COOLDOWN_MS;

  useEffect(() => {
    if (!hasImage) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const next = Date.now() - start;
      setElapsed(next);
      if (next >= COOLDOWN_MS) clearInterval(interval);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [hasImage]);

  function toggleCheck(id: CheckId) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function verifyFirst() {
    if (user) {
      awardVerificationActionXp(user.uid, "chose_verify_first").catch(() => {});
    }
    navigation.navigate("Guide", { imageUri, imageUrl });
  }

  async function shareAnyway() {
    if (!imageUri) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert("Sharing not available", "Your device doesn't support the share sheet.");
      return;
    }
    await Sharing.shareAsync(imageUri, { mimeType: "image/*" });
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.kickerChip}>
          <MaterialIcons name="pause-circle-outline" size={26} color={colors.warning} />
        </View>
        <Heading style={styles.title}>Pause.</Heading>
        <Body muted style={styles.lede}>
          Three quick checks before this leaves your hands.
        </Body>
      </FadeIn>

      {CHECKS.map((check, index) => {
        const isChecked = checks[check.id];
        return (
          <FadeIn key={check.id} delay={motion.stagger * (1 + index)}>
            <PressScale
              onPress={() => toggleCheck(check.id)}
              accessibilityRole="checkbox"
              accessibilityLabel={check.label}
              accessibilityHint={check.hint}
              accessibilityState={{ checked: isChecked }}
              style={styles.checkWrapper}
            >
              <GlassCard
                style={styles.checkRow}
                accent={isChecked ? colors.warning : undefined}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && { backgroundColor: colors.warning, borderColor: colors.warning },
                  ]}
                >
                  {isChecked && <MaterialIcons name="check" size={16} color={colors.background} />}
                </View>
                <View style={styles.checkCopy}>
                  <BodyStrong>{check.label}</BodyStrong>
                  <Caption>{check.hint}</Caption>
                </View>
              </GlassCard>
            </PressScale>
          </FadeIn>
        );
      })}

      <FadeIn delay={motion.stagger * 4} style={styles.actions}>
        {/* Verifying is the primary action here, not sharing. The visual
            hierarchy has to agree with what the screen is asking for. */}
        <PrimaryButton
          label="I'll verify first"
          onPress={verifyFirst}
          icon="fact-check"
          style={styles.action}
          accessibilityHint="Opens the fact-checking checklist"
        />

        {hasImage ? (
          <View>
            {!canShare && (
              <View style={styles.cooldown}>
                <Meter
                  value={elapsed / COOLDOWN_MS}
                  tone={colors.textMuted}
                  height={4}
                  accessibilityLabel="Share unlocks in a moment"
                />
                <Caption center style={styles.cooldownNote}>
                  Take a breath — sharing unlocks in a moment
                </Caption>
              </View>
            )}
            <SecondaryButton
              label={canShare ? "Share anyway" : "Waiting…"}
              onPress={shareAnyway}
              disabled={!canShare}
              icon="ios-share"
              tone={colors.textMuted}
            />
          </View>
        ) : (
          <GlassCard style={styles.practiceNote} tone="sunken" highlight={false}>
            <MaterialIcons name="science" size={18} color={colors.textMuted} />
            <Caption style={styles.practiceText}>
              Practice mode — scan an image first to actually share it.
            </Caption>
            <SecondaryButton
              label="Scan an image"
              onPress={() => navigation.navigate("Scan")}
              icon="document-scanner"
              style={styles.practiceButton}
            />
          </GlassCard>
        )}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kickerChip: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.warning + "55",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  lede: {
    marginBottom: spacing.xl,
  },
  checkWrapper: {
    marginBottom: spacing.md,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: touchTarget.minHeight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.glassBorderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCopy: {
    flex: 1,
    gap: 2,
  },
  actions: {
    marginTop: spacing.lg,
  },
  action: {
    marginBottom: spacing.md,
  },
  cooldown: {
    marginBottom: spacing.md,
  },
  cooldownNote: {
    marginTop: spacing.sm,
  },
  practiceNote: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  practiceText: {
    textAlign: "center",
  },
  practiceButton: {
    marginTop: spacing.sm,
  },
});
