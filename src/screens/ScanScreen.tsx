import { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import {
  Body,
  Caption,
  FadeIn,
  GhostButton,
  GlassCard,
  PressScale,
  PrimaryButton,
  Screen,
  Title,
} from "../components";
import { absoluteFill, colors, motion, radius, spacing } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

export default function ScanScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload an image.");
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

  function analyze() {
    if (!imageUri) return;
    navigation.navigate("Analyzing", { imageUri });
  }

  return (
    <Screen scroll center>
      {!imageUri ? (
        <FadeIn>
          <Title center style={styles.prompt}>
            What are you checking?
          </Title>
          <Body muted center style={styles.lede}>
            Upload a photo or a screenshot from your feed.
          </Body>

          <PressScale
            onPress={pickImage}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Upload an image"
            accessibilityHint="Opens your photo library to pick an image to scan"
          >
            {/* Dashed edge is the one place a border does semantic work: it
                marks a slot waiting to be filled rather than a filled card. */}
            <GlassCard style={styles.dropzone} highlight={false}>
              <View style={styles.dropIcon}>
                <MaterialIcons name="add-photo-alternate" size={32} color={colors.primary} />
              </View>
              <Body center style={styles.dropLabel}>
                Tap to upload an image
              </Body>
              <Caption center>JPG or PNG, from your library</Caption>
            </GlassCard>
          </PressScale>
        </FadeIn>
      ) : (
        <FadeIn>
          <View style={styles.previewFrame}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            {/* Hairline over the photo edge so it belongs to the glass system
                rather than sitting on the screen as a bare rectangle. */}
            <View style={styles.previewEdge} pointerEvents="none" />
          </View>

          <FadeIn delay={motion.stagger}>
            <PrimaryButton
              label="Analyze image"
              onPress={analyze}
              icon="auto-awesome"
              style={styles.analyze}
              accessibilityHint="Runs the AI detector on this image"
            />
            <GhostButton label="Choose a different image" onPress={pickImage} icon="swap-horiz" />
          </FadeIn>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: {
    marginBottom: spacing.sm,
  },
  lede: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  dropzone: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderStyle: "dashed",
    borderColor: colors.glassBorderStrong,
    gap: spacing.xs,
  },
  dropIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.lg,
  },
  dropLabel: {
    fontWeight: "600",
  },
  previewFrame: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.hero,
    overflow: "hidden",
    marginBottom: spacing.xl,
    backgroundColor: colors.glassSunken,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewEdge: {
    ...absoluteFill,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.glassBorderStrong,
  },
  analyze: {
    marginBottom: spacing.sm,
  },
});
