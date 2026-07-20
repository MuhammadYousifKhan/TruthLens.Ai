import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "../theme/theme";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TruthLens AI</Text>
      <Text style={styles.tagline}>Think Before You Share</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: fontSize.heading,
    fontWeight: "700",
    color: colors.white,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.onPrimaryMuted,
  },
});
