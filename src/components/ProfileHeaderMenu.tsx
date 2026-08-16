import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../firebase/config";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import type { RootStackParamList } from "../navigation/types";
import { GlassCard } from "./Glass";
import { AppearanceToggle, LanguageToggle } from "./Segmented";
import { Body, Overline } from "./Typography";
import { radius, spacing, touchTarget } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * The initials button in the Dashboard header.
 *
 * Opens a small popover — not a full navigation — with the four things a user
 * reaches for from anywhere: their profile, the language switch, the
 * appearance switch, and signing out. Built on RN's Modal (a real overlay
 * layer) rather than an absolutely-positioned View, so it can't be clipped by
 * the native header's own bounds.
 */
export function ProfileHeaderMenu({ initials }: { initials?: string }) {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("headerMenu.profileSettings")}
        hitSlop={8}
        style={[styles.avatarButton, { borderColor: palette.lineHairline }]}
      >
        {initials ? (
          <Overline color={palette.textPrimary}>{initials}</Overline>
        ) : (
          <MaterialIcons name="person-outline" size={20} color={palette.textPrimary} />
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: palette.scrim }]}
          onPress={close}
          accessibilityRole="none"
        >
          <View style={[styles.anchor, { paddingTop: insets.top + 56, paddingRight: spacing.lg }]}>
            {/* Swallows the close-on-backdrop press so tapping inside the card
                doesn't dismiss it. */}
            <Pressable onPress={(event) => event.stopPropagation()}>
              <GlassCard style={styles.menu} tone="default" radius={radius.card}>
                <MenuItem
                  icon="person-outline"
                  label={t("headerMenu.profileSettings")}
                  onPress={() => {
                    close();
                    navigation.navigate("Profile");
                  }}
                />
                <View style={[styles.divider, { backgroundColor: palette.lineHairline }]} />

                <View style={styles.controlRow}>
                  <Overline>{t("headerMenu.language")}</Overline>
                  <LanguageToggle />
                </View>
                <View style={[styles.divider, { backgroundColor: palette.lineHairline }]} />

                <View style={styles.controlRow}>
                  <Overline>{t("headerMenu.appearance")}</Overline>
                  <AppearanceToggle />
                </View>
                <View style={[styles.divider, { backgroundColor: palette.lineHairline }]} />

                <MenuItem
                  icon="logout"
                  label={t("headerMenu.logout")}
                  tone={palette.accentBrandText}
                  onPress={() => {
                    close();
                    signOut(auth);
                  }}
                />
              </GlassCard>
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
  const palette = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: palette.surfaceGlass },
      ]}
    >
      <MaterialIcons name={icon} size={18} color={tone ?? palette.textPrimary} />
      <Body style={styles.menuItemLabel} color={tone}>
        {label}
      </Body>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  backdrop: {
    flex: 1,
  },
  anchor: {
    alignItems: "flex-end",
  },
  menu: {
    width: 268,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
  },
  menuItemLabel: {
    flex: 1,
  },
  controlRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
});
