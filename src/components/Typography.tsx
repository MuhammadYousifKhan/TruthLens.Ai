import { Text, type TextProps, type TextStyle, type StyleProp } from "react-native";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  fontFamily,
  fontSize,
  letterSpacing,
  lineHeight,
  lineHeightUrdu,
} from "../theme/theme";

/**
 * The type scale, as components.
 *
 * Archivo — a grotesque with tight apertures and a large x-height, which is
 * what lets a 40px heading sit at the top of a 390px screen and still read on
 * video. Headline levels are set at 800 and tracked tight; body levels stay
 * functional.
 *
 * Urdu swaps the family to Noto Naskh Arabic and takes a materially looser
 * line-height at every size. Naskh rather than Nastaliq: Nastaliq needs
 * roughly 2x the leading and would break every fixed-height row in the app.
 * Overlines also lose their uppercasing and tracking in Urdu, where neither
 * means anything.
 */

type Level =
  | "hero"
  | "display"
  | "heading"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "overline"
  | "numeral";

type Weight = "regular" | "semibold" | "extrabold";

type Props = TextProps & {
  style?: StyleProp<TextStyle>;
  /** Overrides the level's default colour — use for status text. */
  color?: string;
  muted?: boolean;
  center?: boolean;
};

type LevelSpec = {
  size: number;
  height: keyof typeof lineHeight;
  tracking: number;
  weight: Weight;
  uppercase?: boolean;
  /** Figures line up in columns — used for the report-scale numeral. */
  tabular?: boolean;
};

const SPECS: Record<Level, LevelSpec> = {
  hero: { size: fontSize.hero, height: "hero", tracking: letterSpacing.hero, weight: "extrabold" },
  display: {
    size: fontSize.display,
    height: "display",
    tracking: letterSpacing.display,
    weight: "extrabold",
  },
  heading: {
    size: fontSize.heading,
    height: "heading",
    tracking: letterSpacing.heading,
    weight: "extrabold",
  },
  title: { size: fontSize.title, height: "title", tracking: letterSpacing.title, weight: "extrabold" },
  subtitle: {
    size: fontSize.subtitle,
    height: "subtitle",
    tracking: letterSpacing.subtitle,
    weight: "semibold",
  },
  body: { size: fontSize.body, height: "body", tracking: letterSpacing.body, weight: "regular" },
  caption: {
    size: fontSize.caption,
    height: "caption",
    tracking: letterSpacing.caption,
    weight: "regular",
  },
  overline: {
    size: fontSize.micro,
    height: "overline",
    tracking: letterSpacing.overline,
    weight: "extrabold",
    uppercase: true,
  },
  numeral: {
    size: fontSize.numeral,
    height: "numeral",
    tracking: letterSpacing.numeral,
    weight: "extrabold",
    tabular: true,
  },
};

const URDU_FAMILY: Record<Weight, string> = {
  regular: fontFamily.urduRegular,
  semibold: fontFamily.urduSemibold,
  extrabold: fontFamily.urduBold,
};

const LATIN_FAMILY: Record<Weight, string> = {
  regular: fontFamily.regular,
  semibold: fontFamily.semibold,
  extrabold: fontFamily.extrabold,
};

/** Resolves a level plus the active language into a concrete text style. */
export function useTypeStyle(level: Level, weight?: Weight): TextStyle {
  const { language } = useLanguage();
  const spec = SPECS[level];
  const resolvedWeight = weight ?? spec.weight;
  const urdu = language === "ur";

  return {
    fontFamily: urdu ? URDU_FAMILY[resolvedWeight] : LATIN_FAMILY[resolvedWeight],
    fontSize: spec.size,
    lineHeight: urdu ? lineHeightUrdu[spec.height] : lineHeight[spec.height],
    // Naskh must not be letter-spaced — it breaks the joins between glyphs.
    letterSpacing: urdu ? 0 : spec.tracking,
    ...(spec.uppercase && !urdu ? { textTransform: "uppercase" as const } : null),
    ...(spec.tabular ? { fontVariant: ["tabular-nums" as const] } : null),
  };
}

function make(level: Level, tone: "primary" | "secondary" | "tertiary", weight?: Weight) {
  return function Typo({ style, color, muted, center, ...rest }: Props) {
    const palette = usePalette();
    const base = useTypeStyle(level, weight);

    const defaultColor =
      tone === "secondary"
        ? palette.textSecondary
        : tone === "tertiary"
        ? palette.textTertiary
        : palette.textPrimary;

    return (
      <Text
        {...rest}
        style={[
          base,
          { color: color ?? (muted ? palette.textSecondary : defaultColor) },
          center && { textAlign: "center" },
          style,
        ]}
      />
    );
  };
}

/** Splash and one-per-screen moments only. */
export const Hero = make("hero", "primary");
/** Screen-level statements — a verdict headline, a section opener. */
export const Display = make("display", "primary");
export const Heading = make("heading", "primary");
export const Title = make("title", "primary");
export const Subtitle = make("subtitle", "primary");
export const Body = make("body", "primary");
export const BodyStrong = make("body", "primary", "semibold");
/** Non-critical one-liners. Never the only place information appears. */
export const Caption = make("caption", "secondary");
/** Section kickers. Wide tracking earns small text its own register. */
export const Overline = make("overline", "tertiary");
/** Report-scale figure — the result percentage, a quiz score. */
export const Numeral = make("numeral", "primary");
