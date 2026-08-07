import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
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
import { colors } from "../theme/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const SPLASH_MIN_MS = 1500;

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
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: "TruthLens AI", headerBackVisible: false }}
            />
            <Stack.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: "Scan Content" }}
            />
            <Stack.Screen
              name="Analyzing"
              component={AnalyzingScreen}
              options={{ title: "Analyzing", headerBackVisible: false }}
            />
            <Stack.Screen name="Result" component={ResultScreen} options={{ title: "Result" }} />
            <Stack.Screen
              name="Guide"
              component={GuideScreen}
              options={{ title: "Fact-Checking Guide" }}
            />
            <Stack.Screen
              name="Pause"
              component={PauseScreen}
              options={{ title: "Think Before You Share" }}
            />
            <Stack.Screen
              name="DeepfakeHelp"
              component={DeepfakeHelpScreen}
              options={{ title: "If It's a Deepfake" }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ title: "Spot the Fake" }}
            />
            <Stack.Screen
              name="Learn"
              component={LearnHubScreen}
              options={{ title: "Learn Hub" }}
            />
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
              options={{ title: "Quiz Result", headerBackVisible: false, gestureEnabled: false }}
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
