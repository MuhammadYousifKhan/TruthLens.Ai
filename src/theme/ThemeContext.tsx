import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palettes, type Palette, type ThemeMode } from "./theme";

/**
 * Runtime theming.
 *
 * The old theme exported one frozen object of hex strings that every
 * StyleSheet.create read at import time, which meant no colour could change
 * after boot. This provider resolves a palette per render instead, and screens
 * build their styles through `makeStyles(t)` memoised on it.
 *
 * Three-way preference, mirroring what every OS offers: follow the system, or
 * pin light/dark. The choice persists next to the language override.
 */

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "truthlens.theme";

type ThemeContextValue = {
  /** The resolved palette. This is what screens style against. */
  palette: Palette;
  /** The mode actually in effect, after resolving "system". */
  mode: ThemeMode;
  /** What the user picked. "system" means follow the OS. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** True once AsyncStorage has been read, so we can avoid a flash. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isPreference(stored)) setPreferenceState(stored);
      })
      .finally(() => setReady(true));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // The app is dark-first: an unknown system scheme resolves to dark rather
  // than flashing a light screen before the OS reports in.
  const mode: ThemeMode =
    preference === "system" ? (systemScheme === "light" ? "light" : "dark") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ palette: palettes[mode], mode, preference, setPreference, ready }),
    [mode, preference, setPreference, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/** Shorthand for the common case — screens usually only want the palette. */
export function usePalette(): Palette {
  return useTheme().palette;
}

/**
 * Memoises a palette-dependent stylesheet factory.
 *
 * Usage:
 *   const styles = useThemedStyles(makeStyles);
 *   // where: const makeStyles = (t: Palette) => StyleSheet.create({ ... })
 *
 * The factory must be defined at module scope so its identity is stable.
 */
export function useThemedStyles<T>(factory: (palette: Palette) => T): T {
  const palette = usePalette();
  return useMemo(() => factory(palette), [factory, palette]);
}
