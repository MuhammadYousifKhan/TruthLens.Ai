import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import { Body, FadeIn, Overline, Screen, SecondaryButton, Title } from "../components";
import { spacing } from "../theme/theme";

/** Scaffolding. Nothing routes here in the shipped build. */
export default function PlaceholderScreen({ name }: { name?: string }) {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const palette = usePalette();

  return (
    <Screen center>
      <FadeIn>
        <View style={[styles.card, { borderColor: palette.lineStrong }]}>
          <Overline>{t("placeholder.kicker")}</Overline>
          <Title style={styles.title}>{name ?? t("placeholder.title")}</Title>
          <Body muted>{t("placeholder.body")}</Body>
        </View>

        <SecondaryButton
          label={t("placeholder.goBack")}
          onPress={() => navigation.goBack()}
          style={styles.action}
        />
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderStyle: "dashed",
    padding: spacing.xl,
    gap: spacing.sm + 2,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
  },
  action: {
    marginTop: spacing.md + 2,
  },
});
