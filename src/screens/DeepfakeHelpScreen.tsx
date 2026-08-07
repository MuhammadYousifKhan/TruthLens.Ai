import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { deepfakeResponseSteps } from "../data/deepfakeResponseSteps";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

export default function DeepfakeHelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        If you've found a deepfake of someone you know, here's what to do in the first few
        minutes.
      </Text>

      {deepfakeResponseSteps.map((step, index) => (
        <View key={step.title} style={styles.card}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>

          {step.actions && (
            <View style={styles.actionRow}>
              {step.actions.map((action) => (
                <Pressable
                  key={action.label}
                  style={styles.actionButton}
                  onPress={() => WebBrowser.openBrowserAsync(action.url)}
                >
                  <Text style={styles.actionButtonText}>{action.label}</Text>
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
  intro: {
    fontSize: fontSize.subtitle,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  stepNumber: {
    color: colors.white,
    fontSize: fontSize.body,
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
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
  actionButtonText: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontWeight: "600",
  },
});
