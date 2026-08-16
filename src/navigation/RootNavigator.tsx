import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ScanScreen from "../screens/ScanScreen";
import AnalyzingScreen from "../screens/AnalyzingScreen";
import ResultScreen from "../screens/ResultScreen";
import GuideScreen from "../screens/GuideScreen";
import PauseScreen from "../screens/PauseScreen";
import DeepfakeHelpScreen from "../screens/DeepfakeHelpScreen";
import GameScreen from "../screens/GameScreen";
import LearnHubScreen from "../screens/LearnHubScreen";
import LessonDetailScreen from "../screens/LessonDetailScreen";
import QuizScreen from "../screens/QuizScreen";
import QuizResultScreen from "../screens/QuizResultScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportCardScreen from "../screens/ReportCardScreen";
import { fontFamily, fontSize, letterSpacing } from "../theme/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const SPLASH_MIN_MS = 1500;

export default function RootNavigator() {
  const { user, initializing } = useAuth();
  const { t, language } = useLanguage();
  const { palette, mode } = useTheme();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // Navigation's own theme, so the frames it draws between screens during a
  // transition match the ruled field instead of flashing the wrong ground.
  const navigationTheme = useMemo<Theme>(() => {
    const base = mode === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.accentBrand,
        background: palette.surfaceBase,
        card: "transparent",
        text: palette.textPrimary,
        border: palette.lineHairline,
        notification: palette.statusAi,
      },
    };
  }, [mode, palette]);

  // Header titles are set as overlines: small, heavy, wide-tracked. Urdu drops
  // the uppercasing and the tracking, which neither language-shares.
  const urdu = language === "ur";
  const headerTitleStyle = {
    color: palette.textPrimary,
    fontFamily: urdu ? fontFamily.urduBold : fontFamily.extrabold,
    fontSize: fontSize.micro,
    letterSpacing: urdu ? 0 : letterSpacing.overline,
  };

  if (initializing || !minTimeElapsed) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          // Transparent headers let the field run to the top edge and let
          // content scroll underneath. Each screen reserves its own top inset
          // via the Screen component.
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTintColor: palette.textSecondary,
          headerTitleStyle,
          ...(Platform.OS === "ios"
            ? {
                headerBlurEffect:
                  mode === "dark"
                    ? ("systemUltraThinMaterialDark" as const)
                    : ("systemUltraThinMaterialLight" as const),
              }
            : null),
          contentStyle: { backgroundColor: palette.surfaceBase },
          animation: "slide_from_right",
          animationDuration: 320,
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false, animation: "fade" }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: t("nav.scan").toUpperCase() }}
            />
            <Stack.Screen
              name="Analyzing"
              component={AnalyzingScreen}
              // A fade sells "the same image, now being worked on" better than
              // a push, which would imply somewhere new.
              options={{ title: "", headerBackVisible: false, animation: "fade" }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ title: t("nav.result").toUpperCase(), animation: "fade_from_bottom" }}
            />
            <Stack.Screen
              name="Guide"
              component={GuideScreen}
              options={{ title: t("nav.guide").toUpperCase() }}
            />
            <Stack.Screen
              name="Pause"
              component={PauseScreen}
              // Rises from the bottom like a sheet — it interrupts the share,
              // so it should feel like it landed on top of the flow.
              options={{ title: t("nav.pause").toUpperCase(), animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="DeepfakeHelp"
              component={DeepfakeHelpScreen}
              options={{ title: t("nav.deepfakeHelp").toUpperCase() }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ title: t("nav.game").toUpperCase() }}
            />
            <Stack.Screen
              name="Learn"
              component={LearnHubScreen}
              options={{ title: t("nav.learn").toUpperCase() }}
            />
            <Stack.Screen
              name="LessonDetail"
              component={LessonDetailScreen}
              options={{ title: t("nav.lesson").toUpperCase() }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{
                title: t("nav.quiz").toUpperCase(),
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="QuizResult"
              component={QuizResultScreen}
              options={{
                title: t("nav.quizResult").toUpperCase(),
                headerBackVisible: false,
                gestureEnabled: false,
                animation: "fade_from_bottom",
              }}
            />
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ title: t("nav.achievements").toUpperCase() }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: t("nav.profile").toUpperCase() }}
            />
            <Stack.Screen
              name="ReportCard"
              component={ReportCardScreen}
              options={{ title: t("nav.reportCard").toUpperCase() }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
