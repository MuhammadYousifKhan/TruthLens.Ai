import { useContext, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { HeaderHeightContext } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FieldBackground, { type WashPosition } from "./FieldBackground";
import { useResponsive } from "./useResponsive";
import { spacing } from "../theme/theme";

/**
 * The shell every screen sits in.
 *
 * Headers are transparent app-wide, so the ruled field runs edge to edge
 * behind them and content scrolls underneath. That means each screen has to
 * reserve its own top inset — this component does it, reading the real header
 * height when there is a header and the safe-area inset when there isn't.
 *
 * The field always bleeds the full window; only the content column is capped,
 * so a desktop window gets a centred sheet rather than stretched rows.
 *
 * HeaderHeightContext is read directly rather than through useHeaderHeight()
 * because that hook throws outside a navigator, and Splash/Login render there.
 */

type ScreenProps = {
  children: ReactNode;
  /** Wraps content in a ScrollView. Off for screens that must not scroll. */
  scroll?: boolean;
  /** Applies the standard page gutter. Off for edge-to-edge layouts. */
  padded?: boolean;
  /** Centres content on the cross axis of the available space. */
  center?: boolean;
  /** Lifts content above the keyboard. On for any screen with a text input. */
  avoidKeyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom room so the last control clears the home indicator. */
  bottomInset?: boolean;
  /** Draws the 26px ruled grid. Off for the calm screens. */
  grid?: boolean;
  /** Position of the single radial wash, if the screen has one. */
  wash?: WashPosition;
  /** Overrides the wash hue — amber on Pause and QuizResult. */
  washTone?: string;
};

export default function Screen({
  children,
  scroll = false,
  padded = true,
  center = false,
  avoidKeyboard = false,
  contentStyle,
  bottomInset = true,
  grid = true,
  wash = "none",
  washTone,
}: ScreenProps) {
  const headerHeight = useContext(HeaderHeightContext);
  const insets = useSafeAreaInsets();
  const { gutter, maxContentWidth } = useResponsive();

  const paddingTop = (headerHeight ?? insets.top) + spacing.lg;
  const paddingBottom = bottomInset ? insets.bottom + spacing.xl : spacing.lg;

  const inner: StyleProp<ViewStyle> = [
    { paddingTop, paddingBottom },
    padded && { paddingHorizontal: gutter },
    center && styles.center,
    contentStyle,
  ];

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, center && styles.center, inner]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, inner]}>{children}</View>
  );

  const content = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <View style={styles.root}>
      <FieldBackground grid={grid} wash={wash} washTone={washTone} />
      <View style={[styles.column, { maxWidth: maxContentWidth }]}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    justifyContent: "center",
  },
});
