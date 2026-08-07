import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Sharing from "expo-sharing";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Pause">;
type CheckId = "source" | "seenElsewhere" | "emotion";

const COOLDOWN_MS = 2500;

const CHECKS: { id: CheckId; label: string }[] = [
  { id: "source", label: "Do you know the source?" },
  { id: "seenElsewhere", label: "Have you seen it elsewhere?" },
  { id: "emotion", label: "Does it make you feel a strong emotion?" },
];

export default function PauseScreen({ navigation, route }: Props) {
  const { imageUri, imageUrl } = route.params ?? {};
  const hasImage = Boolean(imageUri);

  const [checks, setChecks] = useState<Record<CheckId, boolean>>({
    source: false,
    seenElsewhere: false,
    emotion: false,
  });
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (!hasImage) return;
    const timer = setTimeout(() => setCanShare(true), COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [hasImage]);

  function toggleCheck(id: CheckId) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pause. 3 quick checks before you share.</Text>

      {CHECKS.map((check) => (
        <Pressable
          key={check.id}
          style={styles.checkRow}
          onPress={() => toggleCheck(check.id)}
        >
          <View style={[styles.checkbox, checks[check.id] && styles.checkboxChecked]}>
            {checks[check.id] && <MaterialIcons name="check" size={16} color={colors.white} />}
          </View>
          <Text style={styles.checkLabel}>{check.label}</Text>
        </Pressable>
      ))}

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate("Guide", { imageUri, imageUrl })}
      >
        <Text style={styles.secondaryButtonText}>I'll verify first</Text>
      </Pressable>

      {hasImage ? (
        <Pressable
          disabled={!canShare}
          style={({ pressed }) => [
            styles.primaryButton,
            !canShare && styles.primaryButtonDisabled,
            pressed && canShare && styles.pressed,
          ]}
          onPress={shareAnyway}
        >
          <Text style={styles.primaryButtonText}>
            {canShare ? "Share anyway" : "Just a moment..."}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.practiceNote}>
          <Text style={styles.practiceNoteText}>
            Practice mode — scan an image first to actually share it.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={() => navigation.navigate("Scan")}
          >
            <Text style={styles.secondaryButtonText}>Scan an image</Text>
          </Pressable>
        </View>
      )}
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
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: touchTarget.minHeight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkLabel: {
    flex: 1,
    fontSize: fontSize.subtitle,
    color: colors.text,
  },
  secondaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  primaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.border,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  practiceNote: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  practiceNoteText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
