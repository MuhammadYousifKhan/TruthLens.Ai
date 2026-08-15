import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../firebase/config";
import { useLanguage } from "../i18n/LanguageContext";
import type { RootStackParamList } from "../navigation/types";
import { BlurCard } from "./Glass";
import { Body, Caption } from "./Typography";
import { colors, radius, spacing, touchTarget } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * The avatar button in the Dashboard header.
 *
 * Opens a small popover — not a full navigation — with the three things a
 * user actually reaches for from anywhere in the app: their profile, the
 * language toggle, and signing out. Built on RN's Modal (a real overlay
 * layer) rather than an absolutely-positioned View, so it can't be clipped
 * by the native header's own bounds on iOS/Android.
 */
export function ProfileHeaderMenu() {
  const navigation = useNavigation<Nav>();
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function goToProfile() {
    close();
    navigation.navigate("Profile");
  }

  function toggleLanguage() {
    setLanguage(language === "en" ? "ur" : "en");
  }

  function handleLogOut() {
    close();
    signOut(auth);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("headerMenu.profileSettings")}
        hitSlop={8}
        style={styles.avatarButton}
      >
        <MaterialIcons name="account-circle" size={22} color={colors.primary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="none">
          <View style={[styles.anchor, { paddingTop: insets.top + 56, paddingRight: spacing.lg }]}>
            {/* Swallows the close-on-backdrop press so tapping inside the card
                doesn't dismiss it. */}
            <Pressable onPress={(e) => e.stopPropagation()}>
              <BlurCard style={styles.menu} tone="strong" radius={radius.card}>
                <MenuItem
                  icon="person-outline"
                  label={t("headerMenu.profileSettings")}
                  onPress={goToProfile}
                />
                <View style={styles.divider} />
                <MenuItem
                  icon="translate"
                  label={t("headerMenu.language")}
                  trailing={language === "en" ? "EN" : "UR"}
                  onPress={toggleLanguage}
                />
                <View style={styles.divider} />
                <MenuItem
                  icon="logout"
                  label={t("headerMenu.logout")}
                  tone={colors.danger}
                  onPress={handleLogOut}
                />
              </BlurCard>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  trailing,
  tone,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  trailing?: ReactNode;
  tone?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <MaterialIcons name={icon} size={18} color={tone ?? colors.text} />
      <Body style={[styles.menuItemLabel, tone ? { color: tone } : null]}>{label}</Body>
      {typeof trailing === "string" ? (
        <Caption color={colors.textMuted}>{trailing}</Caption>
      ) : (
        trailing
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 6, 15, 0.35)",
  },
  anchor: {
    alignItems: "flex-end",
  },
  menu: {
    width: 220,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
  },
  menuItemPressed: {
    backgroundColor: colors.glassStrong,
  },
  menuItemLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginHorizontal: spacing.md,
  },
});
