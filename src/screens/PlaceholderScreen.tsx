import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "../theme/theme";

export default function PlaceholderScreen({ name }: { name: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Screen not built yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: "600",
    color: colors.primary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
});
