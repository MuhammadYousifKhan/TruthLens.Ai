import { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { usePalette } from "../theme/ThemeContext";
import { field } from "../theme/theme";

/**
 * The ground every screen sits on: a 26px ruled field over the base colour,
 * plus at most one static radial wash.
 *
 * This replaces the drifting aurora. Two reasons it is better here: the sheet
 * metaphor wants ruled paper rather than weather, and because the field is
 * flat, the Android fallback for BlurCard is nearly indistinguishable from the
 * real iOS blur — there is no moving colour behind the glass to miss.
 *
 * Nothing animates, so reduce-motion is a no-op and Android stops paying for
 * six animated ring stacks per screen.
 */

export type WashPosition = "none" | "topRight" | "bottomLeft";

type Props = {
  /** Draws the ruled grid. Off for the calm screens (DeepfakeHelp). */
  grid?: boolean;
  /** Where the single radial tint sits, if any. */
  wash?: WashPosition;
  /** Overrides the wash hue — used for the amber screens (Pause, QuizResult). */
  washTone?: string;
};

// Alphas rise toward the centre; compositing does the falloff. This fakes a
// radial gradient, which React Native has no primitive for.
const RING_ALPHAS = [0.06, 0.08, 0.1, 0.14, 0.2, 0.28, 0.4];

/** Parses "rgba(r, g, b, a)" into its channels so rings can restate the alpha. */
function parseRgba(value: string): { rgb: string; alpha: number } | null {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;
  return {
    rgb: `${parts[0]}, ${parts[1]}, ${parts[2]}`,
    alpha: parts.length > 3 ? Number(parts[3]) : 1,
  };
}

function Wash({ tone, size }: { tone: string; size: number }) {
  const parsed = parseRgba(tone);
  if (!parsed) return null;

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {RING_ALPHAS.map((weight, index) => {
        const inset = (size / 2) * (index / RING_ALPHAS.length);
        const ringSize = size - inset * 2;
        return (
          <View
            key={index}
            style={{
              position: "absolute",
              top: inset,
              left: inset,
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: `rgba(${parsed.rgb}, ${parsed.alpha * weight})`,
            }}
          />
        );
      })}
    </View>
  );
}

export default function FieldBackground({ grid = true, wash = "none", washTone }: Props) {
  const palette = usePalette();
  const { width, height } = useWindowDimensions();

  // One View per rule. At a 26px pitch on a tall phone that is roughly 50
  // hairlines — cheap, since none of them composite anything.
  const rules = useMemo(() => {
    if (!grid) return null;
    const columns = Math.ceil(width / field.gridSize);
    const rows = Math.ceil(height / field.gridSize);
    return { columns, rows };
  }, [grid, width, height]);

  const washSize = Math.max(width, height) * 1.5;
  const tone = washTone ?? palette.surfaceWash;

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: palette.surfaceBase }]}
      pointerEvents="none"
    >
      {rules && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: rules.columns }, (_, index) => (
            <View
              key={`c${index}`}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: index * field.gridSize,
                width: 1,
                backgroundColor: palette.surfaceGrid,
              }}
            />
          ))}
          {Array.from({ length: rules.rows }, (_, index) => (
            <View
              key={`r${index}`}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: index * field.gridSize,
                height: 1,
                backgroundColor: palette.surfaceGrid,
              }}
            />
          ))}
        </View>
      )}

      {wash === "topRight" && (
        <View
          style={{ position: "absolute", top: -washSize * 0.62, right: -washSize * 0.3 }}
          pointerEvents="none"
        >
          <Wash tone={tone} size={washSize} />
        </View>
      )}

      {wash === "bottomLeft" && (
        <View
          style={{ position: "absolute", bottom: -washSize * 0.6, left: -washSize * 0.34 }}
          pointerEvents="none"
        >
          <Wash tone={tone} size={washSize} />
        </View>
      )}
    </View>
  );
}
