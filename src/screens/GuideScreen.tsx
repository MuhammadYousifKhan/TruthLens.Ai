import { useState } from "react";
import { StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { guideSteps } from "../data/guideSteps";
import { factCheckSources } from "../data/factCheckSources";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import { awardVerificationActionXp } from "../firebase/actions";
import {
  Body,
  Caption,
  FadeIn,
  Heading,
  Meter,
  Overline,
  PressScale,
  PrimaryButton,
  Screen,
} from "../components";
import { motion, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Guide">;

const REVERSE_SEARCH_STEP = 1;
const CROSS_CHECK_STEP = 3;

/** A small ruled link out to an external tool. */
function ToolButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = usePalette();
  return (
    <PressScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.tool, { borderColor: palette.lineStrong }, disabled && styles.toolDisabled]}
    >
      <Overline color={palette.textPrimary}>{label}</Overline>
      <MaterialIcons name="open-in-new" size={12} color={palette.textPrimary} />
    </PressScale>
  );
}

export default function GuideScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl } = route.params ?? {};
  const { user } = useAuth();
  const { t } = useLanguage();
  const palette = usePalette();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const doneCount = guideSteps.filter((_, index) => checked[index]).length;
  const allDone = doneCount === guideSteps.length;

  function toggle(index: number) {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function handleContinue() {
    if (allDone && user) {
      awardVerificationActionXp(user.uid, "checklist_completed").catch(() => {});
    }
    navigation.navigate("Pause", { imageUri, imageUrl });
  }

  function openReverseSearch(provider: "tineye" | "lens") {
    if (!imageUrl) return;
    const url =
      provider === "tineye"
        ? `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`
        : `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
    WebBrowser.openBrowserAsync(url);
    setChecked((prev) => ({ ...prev, [REVERSE_SEARCH_STEP]: true }));
  }

  function openFactCheckSource(url: string) {
    WebBrowser.openBrowserAsync(url);
    setChecked((prev) => ({ ...prev, [CROSS_CHECK_STEP]: true }));
  }

  return (
    <Screen scroll>
      {/* A running count turns the checklist from a wall of text into
          something with an end in sight. */}
      <FadeIn>
        <View style={styles.headRow}>
          <Heading style={styles.title}>{t("guide.fiveChecks")}</Heading>
          <Caption color={allDone ? palette.statusAuthentic : palette.textSecondary}>
            {t("guide.doneCount", { done: doneCount, total: guideSteps.length })}
          </Caption>
        </View>
        <Meter
          value={guideSteps.length > 0 ? doneCount / guideSteps.length : 0}
          tone={allDone ? palette.statusAuthentic : palette.textPrimary}
          height={4}
          style={styles.progress}
          accessibilityLabel={t("guide.doneCount", { done: doneCount, total: guideSteps.length })}
        />
      </FadeIn>

      <View style={styles.steps}>
        {guideSteps.map((step, index) => {
          const isChecked = Boolean(checked[index]);
          const title = t(`guide.steps.${index}.title`);
          const body = t(`guide.steps.${index}.body`);
          const reverseDisabled = index === REVERSE_SEARCH_STEP && !imageUrl;

          return (
            <FadeIn key={step.title} delay={motion.stagger * (1 + index)}>
              <View
                style={[
                  styles.step,
                  {
                    borderColor: isChecked ? palette.statusAuthentic : palette.lineHairline,
                    backgroundColor: isChecked ? palette.statusAuthenticSoft : "transparent",
                  },
                ]}
              >
                <PressScale
                  onPress={() => toggle(index)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={title}
                  accessibilityState={{ checked: isChecked }}
                  style={styles.stepHead}
                >
                  <View
                    style={[
                      styles.box,
                      isChecked
                        ? {
                            backgroundColor: palette.statusAuthentic,
                            borderColor: palette.statusAuthentic,
                          }
                        : { borderColor: palette.lineStrong },
                    ]}
                  >
                    {isChecked && (
                      <MaterialIcons
                        name="check"
                        size={14}
                        color={palette.statusAuthenticOn}
                      />
                    )}
                  </View>
                  <View style={styles.stepCopy}>
                    <Body>{title}</Body>
                    <Caption>{body}</Caption>
                  </View>
                </PressScale>

                {index === REVERSE_SEARCH_STEP && (
                  <View style={styles.toolBlock}>
                    <View style={[styles.toolRow, reverseDisabled && styles.toolRowDisabled]}>
                      <ToolButton
                        label={t("guide.toolTineye")}
                        onPress={() => openReverseSearch("tineye")}
                        disabled={reverseDisabled}
                      />
                      <ToolButton
                        label={t("guide.toolLens")}
                        onPress={() => openReverseSearch("lens")}
                        disabled={reverseDisabled}
                      />
                    </View>
                    {/* A disabled control must never look like a bug, so the
                        reason is stated directly under it. */}
                    {reverseDisabled && (
                      <Caption style={styles.disabledNote}>{t("guide.toolDisabledNote")}</Caption>
                    )}
                  </View>
                )}

                {index === CROSS_CHECK_STEP && (
                  <View style={styles.toolBlock}>
                    <View style={styles.toolRow}>
                      {factCheckSources.map((source) => (
                        <ToolButton
                          key={source.name}
                          label={source.name}
                          onPress={() => openFactCheckSource(source.url)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </FadeIn>
          );
        })}
      </View>

      <FadeIn delay={motion.stagger * (1 + guideSteps.length)}>
        <PrimaryButton
          label={t("guide.continue")}
          onPress={handleContinue}
          icon="arrow-forward"
          iconTrailing
          style={styles.continue}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    fontSize: 30,
  },
  progress: {
    marginTop: spacing.md,
  },
  steps: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  step: {
    borderWidth: 1,
    padding: spacing.md + 1,
  },
  stepHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    minHeight: touchTarget.minHeight - 12,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  toolBlock: {
    paddingLeft: 34,
    marginTop: spacing.sm + 2,
    gap: spacing.xs + 2,
  },
  toolRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
  },
  toolRowDisabled: {
    opacity: 0.45,
  },
  tool: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  toolDisabled: {
    opacity: 0.6,
  },
  disabledNote: {
    marginTop: spacing.xs,
  },
  continue: {
    marginTop: spacing.xl,
  },
});
