import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { analyzeImage } from "../utils/detector";
import { uploadScanImageAsync } from "../firebase/storage";
import { saveScanAndAwardXp } from "../firebase/scans";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import {
  Body,
  Caption,
  FadeIn,
  GlassCard,
  Screen,
  Title,
  useReducedMotion,
} from "../components";
import { absoluteFill, colors, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Analyzing">;

const STAGES = [
  { label: "Uploading image", detail: "Securing your copy" },
  { label: "Analyzing with an AI detector", detail: "Looking for generation artefacts" },
  { label: "Saving your result", detail: "Adding it to your history" },
];

/**
 * The waiting screen.
 *
 * Waiting is the worst moment in the flow, so it shows the actual image with a
 * scan line travelling over it and names each stage as it happens. Progress
 * you can read beats a spinner you can only stare at — and it makes the wait
 * feel like work being done on *your* image specifically.
 */
export default function AnalyzingScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;
  const { user } = useAuth();
  const [stageIndex, setStageIndex] = useState(0);
  const started = useRef(false);
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  // The preview is square and sits inside the standard 24px gutter.
  const frameSize = Math.min(width - spacing.xl * 2, 320);
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
      const result = await analyzeImage(imageUri); // never throws — always resolves, mock or real

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
    <Screen center>
      <FadeIn style={styles.centered}>
        <View style={[styles.frame, { width: frameSize, height: frameSize }]}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {/* Dim the photo so the scan line and the copy below stay dominant. */}
          <View style={[StyleSheet.absoluteFill, styles.scrim]} pointerEvents="none" />

          {!reducedMotion && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: sweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, frameSize - 3],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["transparent", colors.primary, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLineFill}
              />
            </Animated.View>
          )}

          <View style={styles.frameEdge} pointerEvents="none" />
        </View>

        <Title center style={styles.heading}>
          Checking this image
        </Title>
        <Caption center style={styles.subheading}>
          Usually takes a few seconds
        </Caption>

        <GlassCard style={styles.stages}>
          {STAGES.map((stage, index) => {
            const done = index < stageIndex;
            const active = index === stageIndex;
            return (
              <View
                key={stage.label}
                style={[styles.stageRow, index < STAGES.length - 1 && styles.stageDivider]}
                accessibilityRole="text"
                accessibilityLabel={`${stage.label}. ${
                  done ? "Complete" : active ? "In progress" : "Waiting"
                }`}
              >
                <View style={styles.stageIcon}>
                  {done ? (
                    <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  ) : active ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialIcons
                      name="radio-button-unchecked"
                      size={20}
                      color={colors.textFaint}
                    />
                  )}
                </View>
                <View style={styles.stageCopy}>
                  <Body color={done || active ? colors.text : colors.textFaint}>
                    {stage.label}
                  </Body>
                  {active && <Caption>{stage.detail}</Caption>}
                </View>
              </View>
            );
          })}
        </GlassCard>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
  },
  frame: {
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.glassSunken,
    marginBottom: spacing.xl,
  },
  scrim: {
    backgroundColor: "rgba(4, 6, 15, 0.45)",
  },
  frameEdge: {
    ...absoluteFill,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  scanLineFill: {
    flex: 1,
  },
  heading: {
    marginBottom: spacing.xs,
  },
  subheading: {
    marginBottom: spacing.xl,
  },
  stages: {
    width: "100%",
    paddingHorizontal: spacing.lg,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  stageDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  stageIcon: {
    width: 20,
    alignItems: "center",
  },
  stageCopy: {
    flex: 1,
    gap: 2,
  },
});
