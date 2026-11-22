import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import {
  Brand,
  Button,
  Heading,
  Notice,
  Page,
  TextField,
} from "@/components/ui";
import { requireSupabase } from "@/lib/supabase";
import { signUpSchema, type SignUpValues } from "@/lib/validation";
import { theme } from "@/theme";

export default function SignUpScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: Linking.createURL("/") },
      });
      if (error) throw error;
      if (data.session) {
        router.replace("/onboarding");
      } else {
        setMessage(
          "Your account has been created. Check your email to verify your address before signing in.",
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        eyebrow="Begin with intention"
        title="Create your account"
        description="Your email is used for account access only and is never shown on a profile."
      />
      {message ? <Notice tone="success">{message}</Notice> : null}
      {errorMessage ? <Notice tone="error">{errorMessage}</Notice> : null}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            hint="Use at least 10 characters."
            autoCapitalize="none"
            autoComplete="new-password"
            secureTextEntry
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm password"
            autoCapitalize="none"
            secureTextEntry
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <Notice>
        Creating an account does not make a marriage profile visible. You will
        choose your privacy settings during onboarding.
      </Notice>
      <Button loading={submitting} onPress={() => void submit()}>
        Create account
      </Button>
      <Text style={styles.footer}>
        Already registered?{" "}
        <Link href="/sign-in" style={styles.footerLink}>
          Sign in
        </Link>
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
  footer: {
    color: theme.color.muted,
    textAlign: "center",
    fontSize: 14,
  },
  footerLink: {
    color: theme.color.primary,
    fontWeight: "700",
  },
});
