import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/i18n/LanguageContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <RootNavigator />
          {/* The app is dark-only, so status bar content is always light. */}
          <StatusBar style="light" />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
