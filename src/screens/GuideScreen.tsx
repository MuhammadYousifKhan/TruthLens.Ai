import { useState } from "react";
import { StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { guideSteps } from "../data/guideSteps";
import { factCheckSources } from "../data/factCheckSources";
import { useAuth } from "../context/AuthContext";
import { awardVerificationActionXp } from "../firebase/actions";
import {
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GlassCard,
  Meter,
  PressScale,
  PrimaryButton,
  Screen,
} from "../components";
import { colors, motion, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Guide">;

const REVERSE_SEARCH_STEP = 1;
const CROSS_CHECK_STEP = 3;

/** A small pill-shaped link out to an external tool. */
function ToolButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <PressScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.tool, disabled && styles.toolDisabled]}
    >
      <MaterialIcons
        name={icon}
        size={16}
        color={disabled ? colors.placeholder : colors.primary}
      />
      <Caption color={disabled ? colors.placeholder : colors.primary} style={styles.toolLabel}>
        {label}
      </Caption>
    </PressScale>
  );
}

export default function GuideScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl } = route.params ?? {};
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const doneCount = guideSteps.filter((_, index) => checked[index]).length;

  function toggle(index: number) {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function handleContinue() {
    const allChecked = guideSteps.every((_, index) => checked[index]);
    if (allChecked && user) {
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
        <View style={styles.progressRow}>
          <Caption>Verification checklist</Caption>
          <Caption color={doneCount === guideSteps.length ? colors.success : colors.textMuted}>
            {doneCount} of {guideSteps.length} done
          </Caption>
        </View>
        <Meter
          value={guideSteps.length > 0 ? doneCount / guideSteps.length : 0}
          tone={doneCount === guideSteps.length ? colors.success : colors.primary}
          height={6}
          style={styles.progressMeter}
          accessibilityLabel={`${doneCount} of ${guideSteps.length} steps completed`}
        />
      </FadeIn>

      {guideSteps.map((step, index) => {
        const isChecked = Boolean(checked[index]);
        return (
          <FadeIn key={step.title} delay={motion.stagger * (1 + index)}>
            <GlassCard
              style={styles.card}
              accent={isChecked ? colors.success : undefined}
            >
              <PressScale
                onPress={() => toggle(index)}
                accessibilityRole="checkbox"
                accessibilityLabel={step.title}
                accessibilityState={{ checked: isChecked }}
                style={styles.stepHeader}
              >
                <View
                  style={[
                    styles.checkbox,
                    isChecked && { backgroundColor: colors.success, borderColor: colors.success },
                  ]}
                >
                  {isChecked && (
                    <MaterialIcons name="check" size={16} color={colors.background} />
                  )}
                </View>
                <BodyStrong style={styles.stepTitle}>{step.title}</BodyStrong>
              </PressScale>

              <Body muted style={styles.stepBody}>
                {step.body}
              </Body>

              {index === REVERSE_SEARCH_STEP && (
                <View style={styles.toolRow}>
                  <ToolButton
                    label="TinEye"
                    icon="search"
                    onPress={() => openReverseSearch("tineye")}
                    disabled={!imageUrl}
                  />
                  <ToolButton
                    label="Google Lens"
                    icon="image-search"
                    onPress={() => openReverseSearch("lens")}
                    disabled={!imageUrl}
                  />
                  {!imageUrl && (
                    <Caption color={colors.placeholder} style={styles.disabledNote}>
                      Reverse image search needs the photo to finish uploading — try a fresh scan.
                    </Caption>
                  )}
                </View>
              )}

              {index === CROSS_CHECK_STEP && (
                <View style={styles.toolRow}>
                  {factCheckSources.map((source) => (
                    <ToolButton
                      key={source.name}
                      label={source.name}
                      icon="open-in-new"
                      onPress={() => openFactCheckSource(source.url)}
                    />
                  ))}
                </View>
              )}
            </GlassCard>
          </FadeIn>
        );
      })}

      <FadeIn delay={motion.stagger * (1 + guideSteps.length)}>
        <PrimaryButton
          label="Continue"
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
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressMeter: {
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
  stepTitle: {
    flex: 1,
  },
  stepBody: {
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  toolRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tool: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary + "66",
    backgroundColor: colors.glass,
  },
  toolDisabled: {
    borderColor: colors.glassBorder,
    opacity: 0.6,
  },
  toolLabel: {
    fontWeight: "600",
  },
  disabledNote: {
    width: "100%",
    marginTop: spacing.xs,
  },
  continue: {
    marginTop: spacing.sm,
  },
});
