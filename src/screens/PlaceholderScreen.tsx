import { StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Body, FadeIn, GlassCard, Screen, Title } from "../components";
import { colors, spacing } from "../theme/theme";

export default function PlaceholderScreen({ name }: { name: string }) {
  return (
    <Screen center>
      <FadeIn>
        <GlassCard style={styles.card}>
          <MaterialIcons name="construction" size={30} color={colors.textFaint} />
          <Title center>{name}</Title>
          <Body muted center>
            Screen not built yet
          </Body>
        </GlassCard>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
});
