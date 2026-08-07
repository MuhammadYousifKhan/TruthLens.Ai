import { StyleSheet, Text, type TextProps, type TextStyle, type StyleProp } from "react-native";
import { colors, fontSize, letterSpacing, lineHeight } from "../theme/theme";

/**
 * The type scale, as components.
 *
 * Screens use these instead of raw <Text>, which keeps size, weight, tracking,
 * and line height locked together. Tracking tightens as size grows — large text
 * needs less air between letters to look evenly set.
 *
 * Headline levels lean expressive (tight, heavy); body and label levels lean
 * functional (looser, lighter, optimised for reading rather than impact).
 */

type Props = TextProps & {
  style?: StyleProp<TextStyle>;
  /** Overrides the level's default colour — use for status text. */
  color?: string;
  muted?: boolean;
  center?: boolean;
};

function make(base: TextStyle, defaultColor: string) {
  return function Typo({ style, color, muted, center, ...rest }: Props) {
    return (
      <Text
        {...rest}
        style={[
          base,
          { color: color ?? (muted ? colors.textMuted : defaultColor) },
          center && styles.center,
          style,
        ]}
      />
    );
  };
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
});

/** Splash and one-per-screen moments only. */
export const Hero = make(
  {
    fontSize: fontSize.hero,
    lineHeight: lineHeight.hero,
    letterSpacing: letterSpacing.hero,
    fontWeight: "800",
  },
  colors.text
);

/** Screen-level statements — a verdict, a score, a result. */
export const Display = make(
  {
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.display,
    fontWeight: "800",
  },
  colors.text
);

export const Heading = make(
  {
    fontSize: fontSize.heading,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.heading,
    fontWeight: "700",
  },
  colors.text
);

export const Title = make(
  {
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    letterSpacing: letterSpacing.title,
    fontWeight: "700",
  },
  colors.text
);

export const Subtitle = make(
  {
    fontSize: fontSize.subtitle,
    lineHeight: lineHeight.subtitle,
    fontWeight: "600",
  },
  colors.text
);

export const Body = make(
  {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: "400",
  },
  colors.text
);

export const BodyStrong = make(
  {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: "600",
  },
  colors.text
);

/** Non-critical one-liners. Never the only place information appears. */
export const Caption = make(
  {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    letterSpacing: 0.2,
    fontWeight: "400",
  },
  colors.textMuted
);

/** Section kickers. Wide tracking earns small text its own visual register. */
export const Overline = make(
  {
    fontSize: fontSize.micro,
    lineHeight: 14,
    letterSpacing: letterSpacing.overline,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  colors.textFaint
);
