import { Alert } from "react-native";
import { badges } from "../data/badges";

// Resolves once the user dismisses the dialog, so callers can await it
// before navigating on.
export function showBadgeUnlockAlert(newlyEarnedIds: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (newlyEarnedIds.length === 0) {
      resolve();
      return;
    }

    const names = newlyEarnedIds
      .map((id) => badges.find((badge) => badge.id === id)?.name ?? id)
      .join(", ");

    Alert.alert("Badge unlocked!", `You've earned: ${names}`, [
      { text: "Nice!", onPress: () => resolve() },
    ]);
  });
}
