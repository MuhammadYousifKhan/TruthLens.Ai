import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuroraBackground, Body, Hero, useReducedMotion } from "../components";
import { absoluteFill, colors, radius, spacing } from "../theme/theme";

/**
 * First frame of the app. It holds for ~1.5s while auth resolves, which is
 * long enough that a static logo would feel like a stall — so the lens mark
 * draws itself in and a ring sweeps once around it, turning dead wait time
 * into something that reads as the app focusing.
 *
 * This renders outside the navigator, so it composes AuroraBackground directly
 * rather than going through Screen.
 */
export default function SplashScreen() {
  const reducedMotion = useReducedMotion();
  const enter = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.timing(enter, {
      toValue: 1,
      duration: reducedMotion ? 200 : 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    entrance.start();

    if (reducedMotion) return () => entrance.stop();

    const rotation = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear, // linear is correct for a continuous loop
        useNativeDriver: true,
      })
    );
    rotation.start();

    return () => {
      entrance.stop();
      rotation.stop();
    };
  }, [enter, sweep, reducedMotion]);

  return (
    <View style={styles.root}>
      <AuroraBackground />

      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: enter,
            transform: [
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
            ],
          }}
        >
          <View style={styles.mark}>
            {/* The sweeping arc: a ring with one lit quadrant, rotating. */}
            <Animated.View
              style={[
                styles.sweepRing,
                {
                  transform: [
                    {
                      rotate: sweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
            <MaterialIcons name="center-focus-strong" size={44} color={colors.primary} />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: enter,
            transform: [
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          }}
        >
          <Hero center style={styles.wordmark}>
            TruthLens AI
          </Hero>
          <Body center muted>
            Think before you share
          </Body>
        </Animated.View>
      </View>
    </View>
  );
}

const MARK_SIZE = 116;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.xl,
    // Emitted light, not a cast shadow.
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  sweepRing: {
    ...absoluteFill,
    borderRadius: radius.pill,
    borderWidth: 2,
    // Only the top edge is lit, so rotation reads as a sweep around the lens.
    borderColor: "transparent",
    borderTopColor: colors.primary,
  },
  wordmark: {
    marginBottom: spacing.sm,
  },
});
