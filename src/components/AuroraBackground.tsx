import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, motion } from "../theme/theme";
import { useReducedMotion } from "./useReducedMotion";

/**
 * The ground the whole app sits on: a vertical navy gradient with three
 * slowly drifting colour blobs behind it.
 *
 * Frosted glass has nothing to frost unless the backdrop has colour and
 * movement, so this is load-bearing rather than decorative. The drift is
 * deliberately far below the threshold of notice — a full cycle takes ~14s and
 * moves a blob by a fraction of the screen. You should feel that the screen is
 * alive without ever catching it moving.
 *
 * Blobs are built from concentric low-alpha rings instead of a real blur. Six
 * rings at 3-6% alpha accumulate to roughly 22% at the centre with a soft
 * falloff, which costs nothing to render and avoids putting a GPU blur pass
 * behind every screen.
 */

// Alphas are low and rise toward the centre; compositing does the falloff.
const RING_ALPHAS = [0.03, 0.03, 0.035, 0.04, 0.05, 0.06];

type BlobProps = {
  /** RGB triplet as "r, g, b" — alpha is applied per ring. */
  rgb: string;
  size: number;
};

function Blob({ rgb, size }: BlobProps) {
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {RING_ALPHAS.map((alpha, index) => {
        // Each ring insets by an equal step, so they nest concentrically.
        const inset = (size / 2) * (index / RING_ALPHAS.length);
        const ringSize = size - inset * 2;
        return (
          <View
            key={alpha + "-" + index}
            style={{
              position: "absolute",
              top: inset,
              left: inset,
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: `rgba(${rgb}, ${alpha})`,
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * Drives one blob along a slow looping path. `phase` offsets each blob in the
 * cycle so they never move in lockstep — synchronised motion reads as
 * mechanical, staggered motion reads as weather.
 */
function useDrift(phase: number, enabled: boolean) {
  const progress = useRef(new Animated.Value(phase)).current;

  useEffect(() => {
    if (!enabled) {
      progress.setValue(phase);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: motion.ambient * (1 - phase),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: motion.ambient,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: phase,
          duration: motion.ambient * phase,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [enabled, phase, progress]);

  return progress;
}

export default function AuroraBackground() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;

  const driftA = useDrift(0.0, animate);
  const driftB = useDrift(0.35, animate);
  const driftC = useDrift(0.7, animate);

  const blobSize = Math.max(width, height) * 0.95;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.backgroundDeep, colors.background, colors.backgroundLift]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Cyan — upper right, the "verified" hue, drifts down and left. */}
      <Animated.View
        style={{
          position: "absolute",
          top: -blobSize * 0.35,
          right: -blobSize * 0.3,
          transform: [
            {
              translateY: driftA.interpolate({
                inputRange: [0, 1],
                outputRange: [0, blobSize * 0.12],
              }),
            },
            {
              translateX: driftA.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -blobSize * 0.08],
              }),
            },
          ],
        }}
      >
        <Blob rgb="74, 222, 222" size={blobSize} />
      </Animated.View>

      {/* Violet — mid left, the "learn" hue, drifts up and right. */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.22,
          left: -blobSize * 0.45,
          transform: [
            {
              translateY: driftB.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -blobSize * 0.1],
              }),
            },
            {
              translateX: driftB.interpolate({
                inputRange: [0, 1],
                outputRange: [0, blobSize * 0.09],
              }),
            },
          ],
        }}
      >
        <Blob rgb="139, 123, 255" size={blobSize} />
      </Animated.View>

      {/* Deep indigo — bottom, anchors the composition so it doesn't float. */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: -blobSize * 0.5,
          left: width * 0.5 - blobSize * 0.5,
          transform: [
            {
              translateY: driftC.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -blobSize * 0.07],
              }),
            },
          ],
        }}
      >
        <Blob rgb="72, 94, 210" size={blobSize} />
      </Animated.View>
    </View>
  );
}
