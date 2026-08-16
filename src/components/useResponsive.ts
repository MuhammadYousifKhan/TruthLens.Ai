import { useWindowDimensions } from "react-native";
import { spacing } from "../theme/theme";

/**
 * Viewport shape, for the handful of places that need to lay out differently
 * on a wide window than on a phone.
 *
 * The app is a phone app first, and the sheet metaphor already wants a fixed
 * measure, so "desktop" does not mean "spread out". It means a slightly wider
 * column, a bigger gutter, and two-up grids that collapse to one-up on a very
 * narrow phone. The ruled field always bleeds the full window behind it.
 */

export const breakpoint = {
  /** Above this, give the column more measure and a wider gutter. */
  wide: 720,
  /** Below this, tighten the gutter — small Androids and split-screen. */
  compact: 360,
};

export type Responsive = {
  width: number;
  height: number;
  /** Window is at least tablet-width. */
  isWide: boolean;
  /** Very narrow phone or a split-screen pane. */
  isCompact: boolean;
  /** Horizontal page gutter for this viewport. */
  gutter: number;
  /** Max width of the readable content column. */
  maxContentWidth: number;
  /** Columns for the card grids (Achievements). */
  gridColumns: number;
};

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  const isWide = width >= breakpoint.wide;
  const isCompact = width < breakpoint.compact;

  return {
    width,
    height,
    isWide,
    isCompact,
    gutter: isCompact ? spacing.lg : isWide ? spacing.xxl : spacing.xl,
    // 560 keeps the 40px display type from running to an uncomfortable measure
    // on a desktop window while still feeling less cramped than a 390 phone.
    maxContentWidth: isWide ? 560 : 480,
    gridColumns: isCompact ? 1 : 2,
  };
}
