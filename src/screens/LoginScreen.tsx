import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { createUserDocument } from "../firebase/users";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  GlassInput,
  Heading,
  PrimaryButton,
  Screen,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "login" | "signup";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with that email.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/network-request-failed":
      return "Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function validate(): boolean {
    if (isSignup && name.trim().length === 0) {
      setFieldError("Enter your name.");
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return false;
    }
    setFieldError(null);
    return true;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await createUserDocument(credential.user.uid, name.trim(), email.trim());
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // AuthContext picks up the resulting auth-state change and RootNavigator
      // switches to the signed-in stack automatically.
    } catch (err: any) {
      setSubmitError(friendlyAuthError(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setFieldError(null);
    setSubmitError(null);
  }

  // The first field is the only one that can hold a validation error at a
  // time, so the message renders under whichever field failed.
  const nameError = fieldError?.startsWith("Enter your name") ? fieldError : null;
  const emailError = fieldError?.startsWith("Enter a valid email") ? fieldError : null;
  const passwordError = fieldError?.startsWith("Password must") ? fieldError : null;

  return (
    <Screen scroll center avoidKeyboard>
      <FadeIn>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <MaterialIcons name="center-focus-strong" size={26} color={colors.primary} />
          </View>
          <Heading>TruthLens AI</Heading>
        </View>
        <Body muted style={styles.lede}>
          {isSignup
            ? "Build the habit of checking before you share."
            : "Welcome back — let's keep that streak going."}
        </Body>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        {/* One of the four hero surfaces that gets real backdrop blur. */}
        <BlurCard style={styles.card} tone="strong">
          {isSignup && (
            <GlassInput
              icon="person-outline"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              error={nameError}
              containerStyle={styles.field}
              accessibilityLabel="Name"
            />
          )}

          <GlassInput
            icon="alternate-email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
            containerStyle={styles.field}
            accessibilityLabel="Email"
          />

          <GlassInput
            icon="lock-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            error={passwordError}
            containerStyle={styles.field}
            accessibilityLabel="Password"
          />

          {submitError && (
            <View style={styles.submitError}>
              <MaterialIcons name="error-outline" size={16} color={colors.danger} />
              <Caption color={colors.danger} style={styles.submitErrorText}>
                {submitError}
              </Caption>
            </View>
          )}

          <PrimaryButton
            label={isSignup ? "Create account" : "Log in"}
            onPress={handleSubmit}
            loading={loading}
            icon="arrow-forward"
            iconTrailing
            style={styles.submit}
          />

          <GhostButton
            label={isSignup ? "Already have an account? Log in" : "New here? Create an account"}
            onPress={toggleMode}
            disabled={loading}
          />
        </BlurCard>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  lede: {
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  card: {
    padding: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  submitError: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.input,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  submitErrorText: {
    flex: 1,
  },
  submit: {
    marginBottom: spacing.sm,
  },
});
