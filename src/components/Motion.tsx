import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, type ViewStyle, type StyleProp } from "react-native";
import { motion } from "../theme/theme";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Entrance animation for content arriving on screen.
 *
 * Content fades up a short distance on an ease-out curve — fast at the start,
 * settling at the end, the way something with a little mass would. `delay`
 * staggers a list so items arrive in reading order rather than all at once,
 * which is what makes a screen feel composed instead of dumped.
 *
 * Under reduce-motion this becomes a plain fade with no travel.
 */

type FadeInProps = {
  children: ReactNode;
  /** ms to wait before starting. Use `index * motion.stagger` for lists. */
  delay?: number;
  /** Travel distance in px. Negative values enter from above. */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeIn({
  children,
  delay = 0,
  offset = 14,
  duration = motion.base,
  style,
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: reducedMotion
            ? []
            : [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [offset, 0],
                  }),
                },
              ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * A slow breathing pulse, for surfaces that indicate work in progress.
 *
 * Opacity only, .55 to 1 over ~1.6s. It used to swing scale, which nudged the
 * layout of whatever sat next to it in a list; fading leaves the row still.
 */
export function Pulse({
  children,
  style,
  active = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const running = active && !reducedMotion;

  useEffect(() => {
    if (!running) {
      // Settled at full opacity — a reduce-motion user should see the lit
      // state, not the dimmed half of the cycle frozen in place.
      progress.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [running, progress]);

  return (
    <Animated.View
      style={[
        style,
        { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
      ]}
    >
      {children}
    </Animated.View>
  );
}
