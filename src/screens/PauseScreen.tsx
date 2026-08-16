import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import * as Sharing from "expo-sharing";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import { awardVerificationActionXp } from "../firebase/actions";
import {
  Body,
  Caption,
  Display,
  FadeIn,
  Meter,
  Overline,
  PressScale,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "../components";
import { motion, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Pause">;
type CheckId = "source" | "seenElsewhere" | "emotion";

const COOLDOWN_MS = 2500;
const TICK_MS = 100;

/**
 * The friction screen.
 *
 * Amber owns it end to end. The whole point is to slow the share down, so the
 * design leans into the wait instead of hiding it: a bar fills for 2.5s before
 * the share button unlocks, and "I'll verify first" is the filled amber field
 * while it does. The delay is visible and finite, which makes it read as
 * deliberate rather than broken.
 *
 * Because the primary button stayed opaque, the hierarchy is unambiguous in
 * both modes — there is never a moment where sharing looks like the easy path.
 */
export default function PauseScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl } = route.params ?? {};
  const { user } = useAuth();
  const { t } = useLanguage();
  const palette = usePalette();
  const hasImage = Boolean(imageUri);

  const CHECKS: { id: CheckId; label: string; hint: string }[] = [
    { id: "source", label: t("pause.check1Label"), hint: t("pause.check1Hint") },
    { id: "seenElsewhere", label: t("pause.check2Label"), hint: t("pause.check2Hint") },
    { id: "emotion", label: t("pause.check3Label"), hint: t("pause.check3Hint") },
  ];

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

  const remaining = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));

  return (
    <Screen scroll wash="bottomLeft" washTone={palette.statusUncertainSoft}>
      <FadeIn>
        <View style={styles.kickerRow}>
          <View style={[styles.kickerMark, { backgroundColor: palette.statusUncertain }]}>
            <MaterialIcons name="priority-high" size={20} color={palette.statusUncertainOn} />
          </View>
          <Overline color={palette.statusUncertain}>{t("nav.pause")}</Overline>
        </View>

        <Display style={styles.title}>{t("pause.title")}</Display>
        <Body muted style={styles.lede}>
          {t("pause.lede")}
        </Body>
      </FadeIn>

      <View style={styles.checks}>
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
                style={[
                  styles.checkRow,
                  {
                    borderColor: isChecked ? palette.statusUncertain : palette.lineHairline,
                    backgroundColor: isChecked ? palette.statusUncertainSoft : "transparent",
                  },
                ]}
              >
                <View
                  style={[
                    styles.box,
                    isChecked
                      ? { backgroundColor: palette.statusUncertain, borderColor: palette.statusUncertain }
                      : { borderColor: palette.lineStrong },
                  ]}
                >
                  {isChecked && (
                    <MaterialIcons name="check" size={14} color={palette.statusUncertainOn} />
                  )}
                </View>
                <View style={styles.checkCopy}>
                  <Body>{check.label}</Body>
                  <Caption>{check.hint}</Caption>
                </View>
              </PressScale>
            </FadeIn>
          );
        })}
      </View>

      <FadeIn delay={motion.stagger * 4} style={styles.actions}>
        {/* Verifying is the primary action here, not sharing. The visual
            hierarchy has to agree with what the screen is asking for. */}
        <PrimaryButton
          label={t("pause.verifyFirst")}
          onPress={verifyFirst}
          icon="arrow-forward"
          iconTrailing
          tone={palette.statusUncertain}
          onTone={palette.statusUncertainOn}
          large
        />

        {hasImage ? (
          <View style={styles.shareBlock}>
            {!canShare && (
              <View style={styles.cooldown}>
                <Meter
                  value={elapsed / COOLDOWN_MS}
                  tone={palette.textSecondary}
                  height={6}
                  accessibilityLabel={t("pause.cooldownNote")}
                />
                <View style={styles.cooldownRow}>
                  <Overline>{t("pause.unlocksIn", { n: remaining })}</Overline>
                  <Overline>{t("pause.cooldownNote")}</Overline>
                </View>
              </View>
            )}
            <SecondaryButton
              label={canShare ? t("pause.shareAnyway") : t("pause.waiting")}
              onPress={shareAnyway}
              disabled={!canShare}
              tone={palette.textSecondary}
            />
          </View>
        ) : (
          <View style={[styles.practice, { borderColor: palette.lineHairline }]}>
            <Caption style={styles.practiceText}>{t("pause.practiceNote")}</Caption>
            <SecondaryButton
              label={t("pause.scanAnImage")}
              onPress={() => navigation.navigate("Scan")}
            />
          </View>
        )}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  kickerMark: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: spacing.lg,
  },
  lede: {
    marginTop: spacing.md,
    maxWidth: 320,
  },
  checks: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    padding: spacing.md + 2,
    minHeight: touchTarget.minHeight,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkCopy: {
    flex: 1,
    gap: 2,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  shareBlock: {
    gap: spacing.md,
  },
  cooldown: {
    gap: spacing.sm,
  },
  cooldownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  practice: {
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  practiceText: {
    textAlign: "left",
  },
});
