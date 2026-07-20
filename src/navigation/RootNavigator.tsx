import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import PlaceholderScreen from "../screens/PlaceholderScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerStyle: { backgroundColor: "#0b3d91" }, headerTintColor: "#fff" }}
      >
        <Stack.Screen name="Splash" options={{ headerShown: false }}>
          {() => <PlaceholderScreen name="Splash" />}
        </Stack.Screen>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => <PlaceholderScreen name="Login / Sign up" />}
        </Stack.Screen>
        <Stack.Screen name="Dashboard" options={{ title: "TruthLens AI", headerBackVisible: false }}>
          {() => <PlaceholderScreen name="Home Dashboard" />}
        </Stack.Screen>
        <Stack.Screen name="Scan" options={{ title: "Scan Content" }}>
          {() => <PlaceholderScreen name="Scan" />}
        </Stack.Screen>
        <Stack.Screen name="Analyzing" options={{ title: "Analyzing", headerBackVisible: false }}>
          {() => <PlaceholderScreen name="Analyzing" />}
        </Stack.Screen>
        <Stack.Screen name="Result" options={{ title: "Result" }}>
          {() => <PlaceholderScreen name="Scan Result" />}
        </Stack.Screen>
        <Stack.Screen name="Guide" options={{ title: "Fact-Checking Guide" }}>
          {() => <PlaceholderScreen name="Fact-Checking Guide" />}
        </Stack.Screen>
        <Stack.Screen name="Learn" options={{ title: "Learn Hub" }}>
          {() => <PlaceholderScreen name="Learn Hub" />}
        </Stack.Screen>
        <Stack.Screen name="LessonDetail" options={{ title: "Lesson" }}>
          {() => <PlaceholderScreen name="Lesson Detail" />}
        </Stack.Screen>
        <Stack.Screen name="Quiz" options={{ title: "Quiz", headerBackVisible: false }}>
          {() => <PlaceholderScreen name="Quiz" />}
        </Stack.Screen>
        <Stack.Screen name="QuizResult" options={{ title: "Quiz Result", headerBackVisible: false }}>
          {() => <PlaceholderScreen name="Quiz Result" />}
        </Stack.Screen>
        <Stack.Screen name="Achievements" options={{ title: "Achievements" }}>
          {() => <PlaceholderScreen name="Achievements" />}
        </Stack.Screen>
        <Stack.Screen name="Profile" options={{ title: "Profile" }}>
          {() => <PlaceholderScreen name="Profile" />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
