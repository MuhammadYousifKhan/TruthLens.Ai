import { FlatList, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { badges } from "../data/badges";
import { useBadges } from "../hooks/useBadges";
import { colors, fontSize, radius, spacing } from "../theme/theme";

export default function AchievementsScreen() {
  const { earnedIds } = useBadges();

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        keyExtractor={(badge) => badge.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const earned = earnedIds.has(item.id);
          return (
            <View style={[styles.card, !earned && styles.cardLocked]}>
              <MaterialIcons
                name="military-tech"
                size={36}
                color={earned ? colors.primary : colors.border}
              />
              <Text style={[styles.badgeName, !earned && styles.textLocked]}>{item.name}</Text>
              <Text style={[styles.badgeDescription, !earned && styles.textLocked]}>
                {item.description}
              </Text>
            </View>
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
  list: {
    gap: spacing.lg,
  },
  row: {
    gap: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: "center",
  },
  cardLocked: {
    opacity: 0.5,
  },
  badgeName: {
    marginTop: spacing.sm,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  badgeDescription: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  textLocked: {
    color: colors.textMuted,
  },
});
