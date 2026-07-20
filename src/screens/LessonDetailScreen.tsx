import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "LessonDetail">;

export default function LessonDetailScreen({ navigation, route }: Props) {
  const lesson = lessons.find((item) => item.id === route.params.lessonId);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.bodyText}>Lesson not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.bodyText}>{lesson.body}</Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={() => navigation.navigate("Quiz", { lessonId: lesson.id })}
      >
        <Text style={styles.primaryButtonText}>Take the quiz</Text>
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
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  bodyText: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  primaryButton: {
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
  pressed: {
    opacity: 0.85,
  },
});
