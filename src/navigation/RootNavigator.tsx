import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { DarkTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";
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
import { colors, fontSize } from "../theme/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const SPLASH_MIN_MS = 1500;

// Navigation's own theme, so the frames it draws between screens during a
// transition match the aurora ground instead of flashing white.
const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: "transparent",
    text: colors.text,
    border: colors.glassBorder,
    notification: colors.danger,
  },
};

export default function RootNavigator() {
  const { user, initializing } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  if (initializing || !minTimeElapsed) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          // Transparent headers let the aurora run to the top edge and let
          // content scroll underneath. Each screen reserves its own top inset
          // via the Screen component.
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          // native-stack only accepts fontSize/fontWeight/fontFamily/color here,
          // so header titles cannot carry the scale's tracking.
          headerTitleStyle: {
            color: colors.text,
            fontSize: fontSize.subtitle,
            fontWeight: "600",
          },
          // iOS gets a real frosted header for free; Android reads it as
          // transparent over the aurora, which looks correct either way.
          ...(Platform.OS === "ios"
            ? { headerBlurEffect: "systemUltraThinMaterialDark" as const }
            : null),
          contentStyle: { backgroundColor: colors.background },
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
              options={{ title: "TruthLens AI", headerBackVisible: false, animation: "fade" }}
            />
            <Stack.Screen name="Scan" component={ScanScreen} options={{ title: "Scan Content" }} />
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
              options={{ title: "Result", animation: "fade_from_bottom" }}
            />
            <Stack.Screen
              name="Guide"
              component={GuideScreen}
              options={{ title: "Fact-Checking Guide" }}
            />
            <Stack.Screen
              name="Pause"
              component={PauseScreen}
              // Rises from the bottom like a sheet — it interrupts the share,
              // so it should feel like it landed on top of the flow.
              options={{ title: "Think Before You Share", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="DeepfakeHelp"
              component={DeepfakeHelpScreen}
              options={{ title: "If It's a Deepfake" }}
            />
            <Stack.Screen name="Game" component={GameScreen} options={{ title: "Spot the Fake" }} />
            <Stack.Screen name="Learn" component={LearnHubScreen} options={{ title: "Learn Hub" }} />
            <Stack.Screen
              name="LessonDetail"
              component={LessonDetailScreen}
              options={{ title: "Lesson" }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ title: "Quiz", headerBackVisible: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="QuizResult"
              component={QuizResultScreen}
              options={{
                title: "Quiz Result",
                headerBackVisible: false,
                gestureEnabled: false,
                animation: "fade_from_bottom",
              }}
            />
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ title: "Achievements" }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
            <Stack.Screen
              name="ReportCard"
              component={ReportCardScreen}
              options={{ title: "My MIL Habits" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
