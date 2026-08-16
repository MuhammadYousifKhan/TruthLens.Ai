import { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  Body,
  Caption,
  Display,
  FadeIn,
  GhostButton,
  PressScale,
  PrimaryButton,
  Screen,
  useTypeStyle,
} from "../components";
import { absoluteFill, letterSpacing, motion, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

export default function ScanScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const palette = usePalette();
  const slotLabel = useTypeStyle("subtitle", "extrabold");
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("scan.permissionTitle"), t("scan.libraryPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  // The camera matters more than the library for the target user: most of what
  // they want to check is on someone else's screen in front of them, not
  // already saved to their own roll.
  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("scan.permissionTitle"), t("scan.cameraPermission"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  function analyze() {
    if (!imageUri) return;
    navigation.navigate("Analyzing", { imageUri });
  }

  return (
    <Screen scroll>
      <FadeIn>
        <View style={styles.titleBlock}>
          <Display>{t("scan.prompt")}</Display>
          <Body muted style={styles.lede}>
            {t("scan.lede")}
          </Body>
        </View>
      </FadeIn>

      {!imageUri ? (
        <FadeIn delay={motion.stagger}>
          <PressScale
            onPress={pickImage}
            scaleTo={0.985}
            accessibilityRole="button"
            accessibilityLabel={t("scan.dropLabel")}
            accessibilityHint={t("scan.dropHint")}
          >
            {/* The dashed edge is the only place a border does semantic work:
                it marks a slot waiting to be filled, not a filled card. */}
            <View
              style={[
                styles.slot,
                { borderColor: palette.lineStrong, backgroundColor: palette.surfaceGlass },
              ]}
            >
              <View style={[styles.slotMark, { borderColor: palette.accentBrand }]}>
                <MaterialIcons name="add" size={30} color={palette.accentBrand} />
              </View>
              <Body style={[slotLabel, styles.slotLabel]}>
                {t("scan.dropLabel").toUpperCase()}
              </Body>
              <Caption>{t("scan.fileHint")}</Caption>
            </View>
          </PressScale>
        </FadeIn>
      ) : (
        <FadeIn delay={motion.stagger}>
          <View style={[styles.preview, { backgroundColor: palette.imagePlaceholder }]}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <View
              style={[styles.previewEdge, { borderColor: palette.lineHairline }]}
              pointerEvents="none"
            />
          </View>
        </FadeIn>
      )}

      <FadeIn delay={motion.stagger * 2} style={styles.actions}>
        {imageUri ? (
          <>
            <PrimaryButton
              label={t("scan.analyze")}
              onPress={analyze}
              icon="arrow-forward"
              iconTrailing
              style={styles.action}
            />
            <GhostButton
              label={t("scan.chooseDifferent")}
              onPress={pickImage}
              icon="swap-horiz"
            />
            <GhostButton label={t("scan.retake")} onPress={takePhoto} icon="photo-camera" />
          </>
        ) : (
          <>
            {/* Camera leads: it is the shorter path to the thing being checked,
                and the library stays one tap away either way. */}
            <PrimaryButton
              label={t("scan.takePhoto")}
              onPress={takePhoto}
              icon="photo-camera"
              iconTrailing={false}
              style={styles.action}
            />
            <GhostButton label={t("scan.upload")} onPress={pickImage} icon="photo-library" />
          </>
        )}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm + 2,
  },
  lede: {
    maxWidth: 300,
  },
  slot: {
    minHeight: 300,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  slotMark: {
    width: 68,
    height: 68,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  slotLabel: {
    letterSpacing: letterSpacing.label,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewEdge: {
    ...absoluteFill,
    borderWidth: 1,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm + 2,
  },
  action: {
    marginBottom: spacing.xs,
  },
});
