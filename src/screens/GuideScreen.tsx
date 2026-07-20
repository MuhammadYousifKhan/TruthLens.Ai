import { ScrollView, StyleSheet, Text, View } from "react-native";
import { guideSteps } from "../data/guideSteps";
import { colors, fontSize, radius, spacing } from "../theme/theme";

export default function GuideScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {guideSteps.map((step, index) => (
        <View key={step.title} style={styles.card}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
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
});
