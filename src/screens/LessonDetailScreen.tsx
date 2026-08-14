import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import {
  Body,
  Caption,
  FadeIn,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "LessonDetail">;

export default function LessonDetailScreen({ navigation, route }: Props) {
  const lesson = lessons.find((item) => item.id === route.params.lessonId);

  if (!lesson) {
    return (
      <Screen center>
        <GlassCard style={styles.missing}>
          <MaterialIcons name="search-off" size={28} color={colors.textFaint} />
          <Body muted center>
            Lesson not found.
          </Body>
        </GlassCard>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.kicker}>
          <View style={styles.kickerChip}>
            <MaterialIcons name="school" size={18} color={colors.secondary} />
          </View>
          <Caption color={colors.secondary}>Lesson</Caption>
        </View>
        <Heading style={styles.title}>{lesson.title}</Heading>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        {/* Long-form reading gets its own surface with generous padding — the
            body copy is the product here, not a caption on something else. */}
        <GlassCard style={styles.readingCard}>
          <Body style={styles.bodyText}>{lesson.body}</Body>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        <PrimaryButton
          label="Take the quiz"
          onPress={() => navigation.navigate("Quiz", { lessonId: lesson.id })}
          icon="arrow-forward"
          iconTrailing
          accessibilityHint="Starts the quiz for this lesson"
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kickerChip: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.secondary + "55",
  },
  title: {
    marginBottom: spacing.xl,
  },
  readingCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  bodyText: {
    // Looser than the default body leading: this is the one place in the app
    // with sustained reading rather than scanning.
    lineHeight: 25,
  },
  missing: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
});
