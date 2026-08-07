import { StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import { deepfakeResponseSteps } from "../data/deepfakeResponseSteps";
import {
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GlassCard,
  PressScale,
  Screen,
  Subtitle,
} from "../components";
import { colors, motion, radius, spacing, touchTarget } from "../theme/theme";

/**
 * First-response steps for someone who has found a deepfake of a person they
 * know.
 *
 * Whoever opens this screen is likely distressed, so the design is calmer than
 * the rest of the app: no glow, no accent fills, one clear numbered sequence.
 * Red is used only on the framing chip, never on the steps themselves —
 * alarming someone who is already alarmed does not help them act.
 */
export default function DeepfakeHelpScreen() {
  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.introRow}>
          <View style={styles.introChip}>
            <MaterialIcons name="shield" size={24} color={colors.danger} />
          </View>
          <Subtitle style={styles.introText}>
            Here's what to do in the first few minutes.
          </Subtitle>
        </View>
        <Caption style={styles.reassurance}>
          Work through these in order. You don't have to do all of them at once.
        </Caption>
      </FadeIn>

      {deepfakeResponseSteps.map((step, index) => (
        <FadeIn key={step.title} delay={motion.stagger * (1 + index)}>
          <GlassCard style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <BodyStrong color={colors.primary}>{index + 1}</BodyStrong>
              </View>
              <BodyStrong style={styles.stepTitle}>{step.title}</BodyStrong>
            </View>

            <Body muted style={styles.stepBody}>
              {step.body}
            </Body>

            {step.actions && (
              <View style={styles.actionRow}>
                {step.actions.map((action) => (
                  <PressScale
                    key={action.label}
                    onPress={() => WebBrowser.openBrowserAsync(action.url)}
                    accessibilityRole="link"
                    accessibilityLabel={action.label}
                    accessibilityHint="Opens in your browser"
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="open-in-new" size={16} color={colors.primary} />
                    <Caption color={colors.primary} style={styles.actionLabel}>
                      {action.label}
                    </Caption>
                  </PressScale>
                ))}
              </View>
            )}
          </GlassCard>
        </FadeIn>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  introChip: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.danger + "55",
  },
  introText: {
    flex: 1,
  },
  reassurance: {
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  stepTitle: {
    flex: 1,
  },
  stepBody: {
    lineHeight: 21,
  },
  actionRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary + "66",
    backgroundColor: colors.glass,
  },
  actionLabel: {
    fontWeight: "600",
  },
});
