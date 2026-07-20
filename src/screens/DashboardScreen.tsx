import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useUserProfile } from "../hooks/useUserProfile";
import { colors, fontSize, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

type NoParamRoute = "Learn" | "Achievements" | "Profile";

const secondaryCards: {
  key: NoParamRoute;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: "Learn", label: "Learn", icon: "school" },
  { key: "Learn", label: "Quiz", icon: "quiz" },
  { key: "Achievements", label: "Achievements", icon: "emoji-events" },
  { key: "Profile", label: "Profile", icon: "person" },
];

export default function DashboardScreen({ navigation }: Props) {
  const { profile, loading } = useUserProfile();

  const greetingName = loading ? "" : profile?.name?.split(" ")[0] || "there";
  const xp = profile?.xp ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{loading ? "Welcome" : `Hi, ${greetingName}`}</Text>
        <View style={styles.xpPill}>
          <MaterialIcons name="bolt" size={16} color={colors.primary} />
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.scanCard, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate("Scan")}
      >
        <MaterialIcons name="document-scanner" size={40} color={colors.white} />
        <Text style={styles.scanTitle}>Scan Content</Text>
        <Text style={styles.scanSubtitle}>Check if an image is real before you share it</Text>
      </Pressable>

      <View style={styles.grid}>
        {secondaryCards.map((card) => (
          <Pressable
            key={card.label}
            style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(card.key)}
          >
            <MaterialIcons name={card.icon} size={28} color={colors.primary} />
            <Text style={styles.gridLabel}>{card.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.text,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  xpText: {
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.primary,
  },
  scanCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  scanTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.title,
    fontWeight: "700",
    color: colors.white,
  },
  scanSubtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.onPrimaryMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  gridCard: {
    width: "45%",
    minHeight: 100,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  gridLabel: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    fontWeight: "600",
    color: colors.text,
  },
  cardPressed: {
    opacity: 0.85,
  },
});
