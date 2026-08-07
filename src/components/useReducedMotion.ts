import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * True when the user has asked the OS to reduce motion.
 *
 * Every animation in the app checks this. Ambient loops stop entirely;
 * entrance animations collapse to a plain fade so nothing ever *appears*
 * broken, it just stops moving.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduced(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
