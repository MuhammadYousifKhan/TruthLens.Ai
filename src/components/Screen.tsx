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
import AuroraBackground from "./AuroraBackground";
import { spacing } from "../theme/theme";

/**
 * The shell every screen sits in.
 *
 * Headers are transparent app-wide, so the aurora runs edge to edge behind
 * them and content scrolls underneath. That means each screen has to reserve
 * its own top inset — this component does it, reading the real header height
 * when there is a header and the safe-area inset when there isn't.
 *
 * HeaderHeightContext is read directly rather than through useHeaderHeight()
 * because that hook throws outside a navigator, and Splash/Login render there.
 */

type ScreenProps = {
  children: ReactNode;
  /** Wraps content in a ScrollView. Off for screens that must not scroll. */
  scroll?: boolean;
  /** Applies the standard 24px gutter. Off for edge-to-edge layouts. */
  padded?: boolean;
  /** Centres content on the cross axis of the available space. */
  center?: boolean;
  /** Lifts content above the keyboard. On for any screen with a text input. */
  avoidKeyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom room so the last control clears the home indicator. */
  bottomInset?: boolean;
};

export default function Screen({
  children,
  scroll = false,
  padded = true,
  center = false,
  avoidKeyboard = false,
  contentStyle,
  bottomInset = true,
}: ScreenProps) {
  const headerHeight = useContext(HeaderHeightContext);
  const insets = useSafeAreaInsets();

  const paddingTop = (headerHeight ?? insets.top) + spacing.lg;
  const paddingBottom = bottomInset ? insets.bottom + spacing.xl : spacing.lg;

  const inner: StyleProp<ViewStyle> = [
    { paddingTop, paddingBottom },
    padded && styles.gutter,
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
      <AuroraBackground />
      {/* Aurora stays full-bleed behind this; only the actual content column
          gets capped. Below the cap (any phone, most windows) this is a no-op
          — width: 100% just fills the space as before. Above it (a wide
          browser window, a tablet) content stops stretching edge to edge and
          centres as a phone-width column instead. */}
      <View style={styles.webColumn}>{content}</View>
    </View>
  );
}

const MAX_CONTENT_WIDTH = 480;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webColumn: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gutter: {
    paddingHorizontal: spacing.xl,
  },
  center: {
    justifyContent: "center",
  },
});
