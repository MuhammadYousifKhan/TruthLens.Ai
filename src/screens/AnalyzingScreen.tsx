import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Image, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import { analyzeImage } from "../utils/detector";
import { uploadScanImageAsync } from "../firebase/storage";
import { saveScanAndAwardXp } from "../firebase/scans";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import {
  Body,
  Caption,
  FadeIn,
  Heading,
  Overline,
  Pulse,
  Screen,
  Subtitle,
  useReducedMotion,
} from "../components";
import { absoluteFill, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Analyzing">;

const FRAME_HEIGHT = 302;

/**
 * The waiting screen.
 *
 * Waiting is the worst moment in the flow, so it shows the actual image with a
 * line travelling over it and names each stage as it happens. Progress you can
 * read beats a spinner you can only stare at — and it makes the wait feel like
 * work being done on *your* image specifically.
 */
export default function AnalyzingScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const palette = usePalette();
  const reducedMotion = useReducedMotion();

  const STAGES = [
    { label: t("analyzing.stage1Label"), detail: t("analyzing.stage1Detail") },
    { label: t("analyzing.stage2Label"), detail: t("analyzing.stage2Detail") },
    { label: t("analyzing.stage3Label"), detail: t("analyzing.stage3Detail") },
  ];

  const [stageIndex, setStageIndex] = useState(0);
  const started = useRef(false);
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runAnalysis();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, reducedMotion]);

  async function runAnalysis() {
    try {
      setStageIndex(0);
      let storageUrl: string | undefined;
      try {
        storageUrl = user ? await uploadScanImageAsync(user.uid, imageUri) : undefined;
      } catch (uploadErr) {
        // Non-fatal: everything downstream degrades gracefully to the local URI
        // (expected until Firebase Storage billing is enabled).
        if (__DEV__) console.warn("[scan] storage upload failed, continuing local-only:", uploadErr);
        storageUrl = undefined;
      }

      setStageIndex(1);
      const result = await analyzeImage(imageUri); // never throws — mock or real

      setStageIndex(2);
      if (user) {
        await saveScanAndAwardXp(user.uid, imageUri, storageUrl, result);
        const newlyEarnedBadges = await checkAndAwardBadges(user.uid);
        await showBadgeUnlockAlert(newlyEarnedBadges);
      }

      navigation.replace("Result", { imageUri, imageUrl: storageUrl, ...result });
    } catch (err) {
      Alert.alert("Scan failed", "Check your connection and try again.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View
          style={[
            styles.frame,
            { borderColor: palette.lineHairline, backgroundColor: palette.imagePlaceholder },
          ]}
        >
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {/* Dim the photo so the line and the copy below stay dominant. */}
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: palette.surfaceBase, opacity: 0.45 }]}
            pointerEvents="none"
          />

          {!reducedMotion && (
            <Animated.View
              style={[
                styles.sweep,
                {
                  backgroundColor: palette.accentBrand,
                  transform: [
                    {
                      translateY: sweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, FRAME_HEIGHT - 6],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="none"
            />
          )}
        </View>
      </FadeIn>

      <FadeIn delay={40}>
        <Heading style={styles.heading}>{t("analyzing.heading")}</Heading>
      </FadeIn>

      <FadeIn delay={90}>
        <View style={[styles.stages, { borderTopColor: palette.lineStrong }]}>
          {STAGES.map((stage, index) => {
            const done = index < stageIndex;
            const active = index === stageIndex;
            const status = done
              ? t("common.done")
              : active
              ? t("common.now")
              : t("common.waiting");

            return (
              <View
                key={stage.label}
                style={[
                  styles.stageRow,
                  { borderBottomColor: palette.lineHairline },
                  !done && !active && styles.stageWaiting,
                ]}
                accessibilityRole="text"
                accessibilityLabel={`${stage.label}. ${status}`}
              >
                {done ? (
                  <View style={[styles.marker, { backgroundColor: palette.statusAuthentic }]}>
                    <MaterialIcons name="check" size={14} color={palette.statusAuthenticOn} />
                  </View>
                ) : active ? (
                  <Pulse>
                    <View style={[styles.markerOutline, { borderColor: palette.accentBrand }]} />
                  </Pulse>
                ) : (
                  <View
                    style={[styles.markerOutlineThin, { borderColor: palette.lineStrong }]}
                  />
                )}

                <View style={styles.stageCopy}>
                  <Subtitle>{stage.label}</Subtitle>
                  {active && <Caption>{stage.detail}</Caption>}
                </View>

                <Overline color={active ? palette.accentBrand : palette.textTertiary}>
                  {status}
                </Overline>
              </View>
            );
          })}
        </View>
      </FadeIn>

      <FadeIn delay={140}>
        <Caption style={styles.footnote}>{t("analyzing.subheading")}</Caption>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    height: FRAME_HEIGHT,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.xl,
  },
  sweep: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
  },
  heading: {
    marginBottom: spacing.xl,
  },
  stages: {
    borderTopWidth: 2,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    borderBottomWidth: 1,
    paddingVertical: spacing.lg,
  },
  stageWaiting: {
    opacity: 0.55,
  },
  marker: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  markerOutline: {
    width: 22,
    height: 22,
    borderWidth: 2,
  },
  markerOutlineThin: {
    width: 22,
    height: 22,
    borderWidth: 1,
  },
  stageCopy: {
    flex: 1,
    gap: 2,
  },
  footnote: {
    marginTop: spacing.xl,
    maxWidth: 340,
  },
});
