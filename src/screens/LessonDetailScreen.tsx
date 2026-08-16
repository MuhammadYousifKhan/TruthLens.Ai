import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Body,
  FadeIn,
  Heading,
  Overline,
  Pill,
  PrimaryButton,
  Rule,
  Screen,
} from "../components";
import { motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "LessonDetail">;

/**
 * The one screen in the app whose measure is set for reading rather than
 * scanning: 17/1.62, a 2px rule under the title, and no competing surfaces.
 */
export default function LessonDetailScreen({ navigation, route }: Props) {
  const lesson = lessons.find((item) => item.id === route.params.lessonId);
  const { t } = useLanguage();
  const palette = usePalette();

  if (!lesson) {
    return (
      <Screen center>
        <Body muted>{t("lesson.notFound")}</Body>
      </Screen>
    );
  }

  const order = lessons.findIndex((item) => item.id === lesson.id) + 1;

  return (
    <Screen scroll grid={false}>
      <FadeIn>
        <Overline>
          {t("nav.lesson")} {String(order).padStart(2, "0")}
        </Overline>
        <Heading style={styles.title}>{lesson.title}</Heading>
        <Rule strong style={styles.rule} />

        <View style={styles.metaRow}>
          <Pill label={t("lesson.minutes", { n: 6 })} />
          <Pill label={t("lesson.xpValue", { n: 80 })} />
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <Body style={[styles.reading, { color: palette.textPrimary }]}>{lesson.body}</Body>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        <PrimaryButton
          label={t("lesson.takeQuiz")}
          onPress={() => navigation.navigate("Quiz", { lessonId: lesson.id })}
          icon="arrow-forward"
          iconTrailing
          accessibilityHint="Starts the quiz for this lesson"
          style={styles.cta}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.md,
  },
  rule: {
    marginTop: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm - 2,
    marginTop: spacing.lg,
  },
  reading: {
    marginTop: spacing.xl,
    fontSize: 17,
    // Looser than the default body leading — this is sustained reading.
    lineHeight: 28,
  },
  cta: {
    marginTop: spacing.xxl,
  },
});
