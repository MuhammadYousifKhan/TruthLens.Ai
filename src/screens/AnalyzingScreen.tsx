import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { analyzeImage } from "../utils/detector";
import { uploadScanImageAsync } from "../firebase/storage";
import { saveScanAndAwardXp } from "../firebase/scans";
import { checkAndAwardBadges } from "../firebase/badges";
import { showBadgeUnlockAlert } from "../utils/badgeAlert";
import { colors, fontSize, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Analyzing">;

const STAGES = [
  "Uploading image...",
  "Analyzing with an AI detector...",
  "Saving your result...",
];

export default function AnalyzingScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;
  const { user } = useAuth();
  const [stageIndex, setStageIndex] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runAnalysis();
  }, []);

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
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.statusText}>{STAGES[stageIndex]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  statusText: {
    marginTop: spacing.lg,
    fontSize: fontSize.subtitle,
    color: colors.text,
    textAlign: "center",
  },
});
