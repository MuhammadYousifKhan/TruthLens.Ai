import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../firebase/config";
import { createUserDocument } from "../firebase/users";
import { useLanguage } from "../i18n/LanguageContext";
import { usePalette } from "../theme/ThemeContext";
import {
  BlurCard,
  Body,
  Caption,
  Display,
  FadeIn,
  GlassInput,
  LanguageToggle,
  Overline,
  PrimaryButton,
  Screen,
  UnderlineLink,
} from "../components";
import { motion, spacing } from "../theme/theme";

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
  const palette = usePalette();
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

  // Only the first failing field can hold a validation error at a time.
  const nameError = fieldError === "name" ? t("login.nameRequired") : null;
  const emailError = fieldError === "email" ? t("login.emailInvalid") : null;
  const passwordError = fieldError === "password" ? t("login.passwordTooShort") : null;

  return (
    <Screen scroll avoidKeyboard wash="bottomLeft">
      <FadeIn>
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={[styles.mark, { borderColor: palette.accentBrand }]}>
              <View style={[styles.markCore, { backgroundColor: palette.accentBrand }]} />
            </View>
            <Overline color={palette.textPrimary}>{t("login.brand")}</Overline>
          </View>
          <LanguageToggle />
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger}>
        <View style={styles.titleBlock}>
          <Overline color={palette.accentBrand}>
            {isSignup ? t("login.kickerSignup") : t("login.kickerLogin")}
          </Overline>
          <Display style={styles.title}>
            {isSignup ? t("login.titleSignup") : t("login.titleLogin")}
          </Display>
        </View>
      </FadeIn>

      <FadeIn delay={motion.stagger * 2}>
        {/* The one translucent surface on this screen. Fields inside it stay
            opaque so the value you are typing never fights the backdrop. */}
        <BlurCard style={styles.card} tone="strong">
          {isSignup && (
            <GlassInput
              label={t("login.namePlaceholder")}
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
            label={t("login.emailPlaceholder")}
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
            label={t("login.passwordPlaceholder")}
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
            <View
              style={[
                styles.submitError,
                { backgroundColor: palette.statusAiSoft, borderLeftColor: palette.statusAi },
              ]}
            >
              <MaterialIcons name="error-outline" size={16} color={palette.statusAi} />
              <Caption color={palette.accentBrandText} style={styles.submitErrorText}>
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
          />
        </BlurCard>
      </FadeIn>

      <FadeIn delay={motion.stagger * 3}>
        <View style={styles.switchRow}>
          <Body muted>{isSignup ? t("login.haveAccount") : t("login.newHere")}</Body>
          <UnderlineLink
            label={isSignup ? t("login.linkLogin") : t("login.linkSignup")}
            onPress={loading ? undefined : toggleMode}
          />
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  mark: {
    width: 26,
    height: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markCore: {
    width: 8,
    height: 8,
  },
  titleBlock: {
    marginTop: spacing.xxl + spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm + 2,
  },
  title: {
    maxWidth: 320,
  },
  card: {
    padding: spacing.xl - 2,
  },
  field: {
    marginBottom: spacing.lg,
  },
  submitError: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderLeftWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  submitErrorText: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
