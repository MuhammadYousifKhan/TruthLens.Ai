import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { generateMockResult } from "../utils/mockAnalyzer";
import { saveScanAndAwardXp } from "../firebase/scans";
import { colors, fontSize, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Analyzing">;

const STAGES = [
  "Uploading image...",
  "Analyzing pixels and patterns...",
  "Checking for generation artifacts...",
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      await delay(800);

      setStageIndex(1);
      await delay(2000);

      setStageIndex(2);
      await delay(1200);

      const result = generateMockResult();
      if (user) {
        await saveScanAndAwardXp(user.uid, imageUri, result);
      }

      navigation.replace("Result", { imageUri, ...result });
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
