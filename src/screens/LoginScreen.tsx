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
import { useLanguage } from "../i18n/LanguageContext";
import {
  BlurCard,
  Body,
  Caption,
  FadeIn,
  GhostButton,
  GlassInput,
  Heading,
  LanguageToggle,
  PrimaryButton,
  Screen,
} from "../components";
import { colors, motion, radius, spacing } from "../theme/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "login" | "signup";
type FieldErrorId = "name" | "email" | "password";

function friendlyAuthError(code: string, t: (key: string) => string): string {
  switch (code) {
    case "auth/invalid-email":
      return t("login.errorInvalidEmail");
    case "auth/user-not-found":
      return t("login.errorUserNotFound");
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return t("login.errorWrongPassword");
    case "auth/email-already-in-use":
      return t("login.errorEmailInUse");
    case "auth/weak-password":
      return t("login.errorWeakPassword");
    case "auth/network-request-failed":
      return t("login.errorNetworkFailed");
    default:
      return t("login.errorGeneric");
  }
}

export default function LoginScreen() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<FieldErrorId | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function validate(): boolean {
    if (isSignup && name.trim().length === 0) {
      setFieldError("name");
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldError("email");
      return false;
    }
    if (password.length < 6) {
      setFieldError("password");
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
      setSubmitError(friendlyAuthError(err?.code ?? "", t));
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
  const nameError = fieldError === "name" ? t("login.nameRequired") : null;
  const emailError = fieldError === "email" ? t("login.emailInvalid") : null;
  const passwordError = fieldError === "password" ? t("login.passwordTooShort") : null;

  return (
    <Screen scroll center avoidKeyboard>
      <View style={styles.languageRow}>
        <LanguageToggle />
      </View>

      <FadeIn>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <MaterialIcons name="center-focus-strong" size={26} color={colors.primary} />
          </View>
          <Heading>{t("login.brand")}</Heading>
        </View>
        <Body muted style={styles.lede}>
          {isSignup ? t("login.ledeSignup") : t("login.ledeLogin")}
        </Body>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        {/* One of the four hero surfaces that gets real backdrop blur. */}
        <BlurCard style={styles.card} tone="strong">
          {isSignup && (
            <GlassInput
              icon="person-outline"
              placeholder={t("login.namePlaceholder")}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              error={nameError}
              containerStyle={styles.field}
              accessibilityLabel={t("login.namePlaceholder")}
            />
          )}

          <GlassInput
            icon="alternate-email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
            containerStyle={styles.field}
            accessibilityLabel={t("login.emailPlaceholder")}
          />

          <GlassInput
            icon="lock-outline"
            placeholder={t("login.passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            error={passwordError}
            containerStyle={styles.field}
            accessibilityLabel={t("login.passwordPlaceholder")}
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
            label={isSignup ? t("login.createAccount") : t("login.logIn")}
            onPress={handleSubmit}
            loading={loading}
            icon="arrow-forward"
            iconTrailing
            style={styles.submit}
          />

          <GhostButton
            label={isSignup ? t("login.toggleToLogin") : t("login.toggleToSignup")}
            onPress={toggleMode}
            disabled={loading}
          />
        </BlurCard>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  languageRow: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
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
