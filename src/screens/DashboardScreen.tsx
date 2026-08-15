import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  BlurCard,
  Body,
  BodyStrong,
  Caption,
  FadeIn,
  GlassCard,
  PressScale,
  Screen,
  SectionLabel,
  Subtitle,
  Title,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

type DashboardCard = {
  key: string;
  label: string;
  hint: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Each destination owns a hue, so the grid is scannable by colour as well
   *  as by label once the user knows the app. */
  tone: string;
  onPress: (navigation: Props["navigation"]) => void;
};

const secondaryCards: DashboardCard[] = [
  {
    key: "Learn",
    label: "Learn",
    hint: "Short lessons",
    icon: "school",
    tone: colors.secondary,
    onPress: (nav) => nav.navigate("Learn"),
  },
  {
    key: "Quiz",
    label: "Quiz",
    hint: "Test yourself",
    icon: "quiz",
    tone: colors.secondary,
    onPress: (nav) => nav.navigate("Learn"),
  },
  {
    key: "Game",
    label: "Spot the fake",
    hint: "Train your eye",
    icon: "visibility",
    tone: colors.primary,
    onPress: (nav) => nav.navigate("Game"),
  },
  {
    key: "Achievements",
    label: "Achievements",
    hint: "Your badges",
    icon: "emoji-events",
    tone: colors.warning,
    onPress: (nav) => nav.navigate("Achievements"),
  },
  {
    key: "Profile",
    label: "Profile",
    hint: "Scans & stats",
    icon: "person",
    tone: colors.info,
    onPress: (nav) => nav.navigate("Profile"),
  },
  {
    key: "DeepfakeHelp",
    label: "If it's a deepfake",
    hint: "Get support",
    icon: "shield",
    tone: colors.danger,
    onPress: (nav) => nav.navigate("DeepfakeHelp"),
  },
];

export default function DashboardScreen({ navigation }: Props) {
  const { profile, loading } = useUserProfile();

  const greetingName = loading ? "" : profile?.name?.split(" ")[0] || "there";
  const xp = profile?.xp ?? 0;

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.header}>
          <View style={styles.greetingBlock}>
            <Caption>{loading ? "Loading" : "Welcome back"}</Caption>
            <Title style={styles.greeting}>{loading ? " " : `Hi, ${greetingName}`}</Title>
          </View>

          <BlurCard style={styles.xpPill} radius={radius.pill} highlight={false} tone="strong">
            <MaterialIcons name="bolt" size={16} color={colors.primary} />
            <BodyStrong color={colors.primary}>{xp} XP</BodyStrong>
          </BlurCard>
        </View>
      </FadeIn>

      {/* The single strongest action on the screen — filled, glowing, and the
          only element allowed to use the accent as a full background. */}
      <FadeIn delay={motion.stagger}>
        <PressScale
          onPress={() => navigation.navigate("Scan")}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel="Scan content"
          accessibilityHint="Check whether an image is AI-generated before you share it"
          style={styles.scanCard}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.scanIcon}>
            <MaterialIcons name="document-scanner" size={28} color={colors.onPrimary} />
          </View>
          <View style={styles.scanCopy}>
            <Title color={colors.onPrimary}>Scan content</Title>
            <Body color={colors.onPrimary} style={styles.scanSubtitle}>
              Check if an image is real before you share it
            </Body>
          </View>
          <MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />
        </PressScale>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        <PressScale
          onPress={() => navigation.navigate("Pause")}
          accessibilityRole="button"
          accessibilityLabel="Think before you share"
          style={styles.pauseWrapper}
        >
          <GlassCard style={styles.pauseCard} accent={colors.warning}>
            <View style={[styles.iconChip, { borderColor: colors.warning + "55" }]}>
              <MaterialIcons name="pause-circle-outline" size={22} color={colors.warning} />
            </View>
            <View style={styles.pauseCopy}>
              <Subtitle>Think before you share</Subtitle>
              <Caption>Run the five-second check</Caption>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.textFaint} />
          </GlassCard>
        </PressScale>
      </FadeIn>

      <FadeIn delay={motion.stagger * 3}>
        <SectionLabel>Build the habit</SectionLabel>
      </FadeIn>

      <View style={styles.grid}>
        {secondaryCards.map((card, index) => (
          <FadeIn
            key={card.key}
            delay={motion.stagger * (4 + index)}
            style={styles.gridItem}
          >
            <PressScale
              onPress={() => card.onPress(navigation)}
              accessibilityRole="button"
              accessibilityLabel={card.label}
              accessibilityHint={card.hint}
              style={styles.gridPress}
            >
              <GlassCard style={styles.gridCard}>
                <View style={[styles.iconChip, { borderColor: card.tone + "55" }]}>
                  <View
                    style={[StyleSheet.absoluteFill, { backgroundColor: card.tone, opacity: 0.12 }]}
                  />
                  <MaterialIcons name={card.icon} size={22} color={card.tone} />
                </View>
                <Subtitle style={styles.gridLabel}>{card.label}</Subtitle>
                <Caption>{card.hint}</Caption>
              </GlassCard>
            </PressScale>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  greetingBlock: {
  flex: 1,
  minWidth: 0,
  gap: spacing.xs,
},
  greeting: {
    // Reserves the line so the layout does not jump when the name loads.
    minHeight: 26,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.hero,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 19, 26, 0.14)",
  },
 scanCopy: {
  flex: 1,
  minWidth: 0,
},
  scanSubtitle: {
    marginTop: spacing.xs,
    opacity: 0.75,
  },
  pauseWrapper: {
    marginBottom: spacing.xl,
  },
  pauseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
pauseCopy: {
  flex: 1,
  minWidth: 0,
  gap: 2,
},
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
gridItem: {
  flexGrow: 1,
  flexBasis: "47%",
  minWidth: 0,
},
  gridPress: {
    flex: 1,
  },
  gridCard: {
    flex: 1,
    minHeight: 132,
    padding: spacing.lg,
    justifyContent: "flex-end",
    gap: 2,
  },
  gridLabel: {
    marginTop: spacing.md,
  },
});
