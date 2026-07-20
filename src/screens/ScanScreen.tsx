import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors, fontSize, radius, spacing, touchTarget } from "../theme/theme";

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
    <View style={styles.container}>
      {!imageUri ? (
        <Pressable style={styles.uploadCard} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={40} color={colors.primary} />
          <Text style={styles.uploadText}>Tap to upload an image or screenshot</Text>
        </Pressable>
      ) : (
        <View style={styles.previewSection}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={analyze}
          >
            <Text style={styles.primaryButtonText}>Analyze Image</Text>
          </Pressable>
          <Pressable style={styles.textButton} onPress={pickImage}>
            <Text style={styles.textButtonLabel}>Choose a different image</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
  },
  uploadCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  uploadText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  previewSection: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
  },
  primaryButton: {
    width: "100%",
    minHeight: touchTarget.minHeight,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.subtitle,
    fontWeight: "600",
  },
  textButton: {
    minHeight: touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  textButtonLabel: {
    color: colors.primary,
    fontSize: fontSize.body,
  },
  pressed: {
    opacity: 0.85,
  },
});
