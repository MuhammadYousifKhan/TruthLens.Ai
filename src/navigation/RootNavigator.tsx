import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ScanScreen from "../screens/ScanScreen";
import AnalyzingScreen from "../screens/AnalyzingScreen";
import ResultScreen from "../screens/ResultScreen";
import GuideScreen from "../screens/GuideScreen";
import LearnHubScreen from "../screens/LearnHubScreen";
import LessonDetailScreen from "../screens/LessonDetailScreen";
import QuizScreen from "../screens/QuizScreen";
import QuizResultScreen from "../screens/QuizResultScreen";
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
            <Stack.Screen name="Achievements" options={{ title: "Achievements" }}>
              {() => <PlaceholderScreen name="Achievements" />}
            </Stack.Screen>
            <Stack.Screen name="Profile" options={{ title: "Profile" }}>
              {() => <PlaceholderScreen name="Profile" />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
