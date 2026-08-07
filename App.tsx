import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        {/* The app is dark-only, so status bar content is always light. */}
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
