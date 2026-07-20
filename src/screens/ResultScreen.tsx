import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function verdictFor(probability: number) {
  if (probability >= 55) {
    return { label: "Likely AI-generated", color: colors.danger };
  }
  if (probability >= 35) {
    return { label: "Uncertain — verify before sharing", color: colors.warning };
  }
  return { label: "Likely authentic", color: colors.success };
}

export default function ResultScreen({ navigation, route }: Props) {
  const { imageUri, probability, confidence, flags, explanation } = route.params;
  const verdict = verdictFor(probability);

  function scanAnother() {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] })
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

      <Text style={[styles.probability, { color: verdict.color }]}>{probability}%</Text>
      <Text style={[styles.verdictLabel, { color: verdict.color }]}>{verdict.label}</Text>
      <Text style={styles.confidence}>{confidence}% confidence</Text>

      <View style={styles.flagsCard}>
        {flags.map((flag) => (
          <View key={flag} style={styles.flagRow}>
            <View style={[styles.flagDot, { backgroundColor: verdict.color }]} />
            <Text style={styles.flagText}>{flag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.explanationCard}>
        <Text style={styles.explanationText}>{explanation}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate("Guide")}
      >
        <Text style={styles.primaryButtonText}>Learn how to verify this</Text>
      </Pressable>

      <Pressable style={styles.textButton} onPress={scanAnother}>
        <Text style={styles.textButtonLabel}>Scan another image</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  probability: {
    fontSize: 40,
    fontWeight: "700",
  },
  verdictLabel: {
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    marginTop: spacing.xs,
    textAlign: "center",
  },
  confidence: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  flagsCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  flagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  flagText: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  explanationCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  explanationText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  textButton: {
    minHeight: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  textButtonLabel: {
    color: colors.primary,
    fontSize: fontSize.body,
  },
  pressed: {
    opacity: 0.85,
  },
});
