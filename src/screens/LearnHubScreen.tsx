import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { lessons } from "../data/lessons";
import { useQuizResults } from "../hooks/useQuizResults";
import { colors, fontSize, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Learn">;

export default function LearnHubScreen({ navigation }: Props) {
  const { results } = useQuizResults();
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = sortedLessons.filter((lesson) => results[lesson.id]).length;

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>
        {completedCount} of {sortedLessons.length} lessons completed
      </Text>
      <FlatList
        data={sortedLessons}
        keyExtractor={(lesson) => lesson.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isComplete = Boolean(results[item.id]);
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate("LessonDetail", { lessonId: item.id })}
            >
              <MaterialIcons
                name={isComplete ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={isComplete ? colors.success : colors.border}
              />
              <Text style={styles.rowTitle}>{item.title}</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  progressText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowTitle: {
    flex: 1,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
  },
});
