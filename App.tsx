import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
} from "@expo-google-fonts/archivo";
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from "@expo-google-fonts/noto-naskh-arabic";
import { AuthProvider } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/i18n/LanguageContext";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";
import SplashScreen from "./src/screens/SplashScreen";

/**
 * Provider order matters here.
 *
 * ThemeProvider and LanguageProvider both wrap the splash, because the splash
 * renders Typography — which resolves its font family from the language and
 * its colour from the palette. Anything that can appear before the app is
 * ready has to sit inside both.
 */

/** Reads the resolved mode, so it must live below ThemeProvider. */
function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

/**
 * Holds the splash until the stored theme preference has been read, so a user
 * who pinned light never sees a frame of dark first.
 */
function Shell({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useTheme();

  if (!fontsReady || !ready) {
    return (
      <>
        <SplashScreen />
        <ThemedStatusBar />
      </>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
      <ThemedStatusBar />
    </AuthProvider>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
  });

  // A font failure must not brick the app — it falls back to the system face
  // rather than holding the splash forever.
  const fontsReady = fontsLoaded || Boolean(fontError);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Shell fontsReady={fontsReady} />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
