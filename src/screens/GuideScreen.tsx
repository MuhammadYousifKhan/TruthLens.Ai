import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { guideSteps } from "../data/guideSteps";
import { factCheckSources } from "../data/factCheckSources";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Guide">;

const REVERSE_SEARCH_STEP = 1;
const CROSS_CHECK_STEP = 3;

export default function GuideScreen({ route }: Props) {
  const { imageUrl } = route.params ?? {};
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  function toggle(index: number) {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {guideSteps.map((step, index) => (
        <View key={step.title} style={styles.card}>
          <Pressable style={styles.stepHeader} onPress={() => toggle(index)}>
            <View style={[styles.checkbox, checked[index] && styles.checkboxChecked]}>
              {checked[index] && <MaterialIcons name="check" size={16} color={colors.white} />}
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </Pressable>
          <Text style={styles.stepBody}>{step.body}</Text>

          {index === REVERSE_SEARCH_STEP && (
            <View style={styles.actionRow}>
              <Pressable
                disabled={!imageUrl}
                style={[styles.actionButton, !imageUrl && styles.actionButtonDisabled]}
                onPress={() => openReverseSearch("tineye")}
              >
                <Text style={[styles.actionButtonText, !imageUrl && styles.actionButtonTextDisabled]}>
                  Search on TinEye
                </Text>
              </Pressable>
              <Pressable
                disabled={!imageUrl}
                style={[styles.actionButton, !imageUrl && styles.actionButtonDisabled]}
                onPress={() => openReverseSearch("lens")}
              >
                <Text style={[styles.actionButtonText, !imageUrl && styles.actionButtonTextDisabled]}>
                  Search on Google Lens
                </Text>
              </Pressable>
              {!imageUrl && (
                <Text style={styles.disabledNote}>
                  Reverse image search needs the photo to finish uploading — try a fresh scan.
                </Text>
              )}
            </View>
          )}

          {index === CROSS_CHECK_STEP && (
            <View style={styles.actionRow}>
              {factCheckSources.map((source) => (
                <Pressable
                  key={source.name}
                  style={styles.actionButton}
                  onPress={() => openFactCheckSource(source.url)}
                >
                  <Text style={styles.actionButtonText}>{source.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
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
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  stepTitle: {
    flex: 1,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
  },
  stepBody: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    borderColor: colors.border,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontWeight: "600",
  },
  actionButtonTextDisabled: {
    color: colors.placeholder,
  },
  disabledNote: {
    fontSize: fontSize.body,
    color: colors.placeholder,
    width: "100%",
    marginTop: spacing.xs,
  },
});
