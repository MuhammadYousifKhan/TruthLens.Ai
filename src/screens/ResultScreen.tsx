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
  const { imageUri, imageUrl, probability, confidence, flags, explanation, tells, source } = route.params;
  const verdict = verdictFor(probability);
  const sourceNote =
    source === "model"
      ? "Analyzed by an open detection model (probabilistic)."
      : "Offline estimate — verify manually.";

  function scanAnother() {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] })
    );
  }

  function shareResult() {
    navigation.navigate("Pause", { imageUri, imageUrl });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

      <Text style={[styles.verdictLabel, { color: verdict.color }]}>{verdict.label}</Text>
      <Text style={styles.disclaimer}>This is an estimate, not proof. Always verify before sharing.</Text>
      <Text style={styles.metaLine}>
        Estimated {probability}% • {confidence}% confidence
      </Text>
      <Text style={styles.sourceNote}>{sourceNote}</Text>

      {tells && tells.length > 0 && (
        <View style={styles.tellsCard}>
          <Text style={styles.cardHeading}>What to look at</Text>
          {tells.map((tell) => (
            <View key={tell.label} style={styles.tellRow}>
              <Text style={styles.tellLabel}>{tell.label}</Text>
              <Text style={styles.tellWhy}>{tell.why}</Text>
            </View>
          ))}
        </View>
      )}

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

      {probability >= 55 && (
        <Pressable
          style={styles.deepfakeLink}
          onPress={() => navigation.navigate("DeepfakeHelp")}
        >
          <Text style={styles.deepfakeLinkText}>Is this a deepfake of someone you know?</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate("Guide", { imageUri, imageUrl })}
      >
        <Text style={styles.primaryButtonText}>Learn how to verify this</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={shareResult}
      >
        <Text style={styles.secondaryButtonText}>Share</Text>
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
  verdictLabel: {
    fontSize: fontSize.heading,
    fontWeight: "700",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  metaLine: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sourceNote: {
    fontSize: fontSize.body,
    color: colors.placeholder,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  cardHeading: {
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tellsCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tellRow: {
    marginBottom: spacing.sm,
  },
  tellLabel: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.text,
  },
  tellWhy: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginTop: 2,
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
  deepfakeLink: {
    minHeight: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  deepfakeLinkText: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    textDecorationLine: "underline",
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
  secondaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
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
