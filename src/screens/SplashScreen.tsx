import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldBackground, Hero, Overline, Rule, useReducedMotion } from "../components";
import { usePalette } from "../theme/ThemeContext";
import { spacing } from "../theme/theme";

/**
 * First frame of the app, and the first frame of the pitch video.
 *
 * It holds still. The old rotating lit-quadrant ring drew attention to the
 * wait; a mark that scales 0.94 to 1 once over 420ms and then stops reads as
 * the app arriving rather than the app loading.
 *
 * The wordmark parks bottom-left above a rule, so the composition is a title
 * block on a sheet rather than a logo centred in space.
 *
 * This renders outside the navigator, so it composes FieldBackground directly
 * rather than going through Screen.
 */
export default function SplashScreen() {
  const t = usePalette();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.timing(enter, {
      toValue: 1,
      duration: reducedMotion ? 160 : 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    entrance.start();
    return () => entrance.stop();
  }, [enter, reducedMotion]);

  return (
    <View style={styles.root}>
      <FieldBackground grid wash="topRight" />

      <View
        style={[
          styles.block,
          { paddingBottom: insets.bottom + 72, paddingHorizontal: spacing.xl },
        ]}
      >
        <Animated.View
          style={{
            opacity: enter,
            transform: [
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            ],
          }}
        >
          {/* A square aperture: an outlined frame with a solid core. */}
          <View style={[styles.mark, { borderColor: t.accentBrand }]}>
            <View style={[styles.markCore, { backgroundColor: t.accentBrand }]} />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: enter,
            transform: [
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            ],
          }}
        >
          <Rule strong style={styles.rule} />
          <Hero>
            {"TRUTH\nLENS "}
            <Hero color={t.accentBrand}>AI</Hero>
          </Hero>
          <Overline color={t.textSecondary} style={styles.tagline}>
            Think before you share
          </Overline>
        </Animated.View>
      </View>
    </View>
  );
}

const MARK_SIZE = 76;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  block: {
    flex: 1,
    justifyContent: "flex-end",
    gap: spacing.xl,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markCore: {
    width: 22,
    height: 22,
  },
  rule: {
    marginBottom: spacing.xl,
  },
  tagline: {
    marginTop: spacing.lg,
  },
});
