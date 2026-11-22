import { zodResolver } from "@hookform/resolvers/zod";
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
import { signInSchema, type SignInValues } from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function SignInScreen() {
  const { initializationError, setInitializationError } = useAuth();
  const [message, setMessage] = useState<string | null>(initializationError);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true);
    setMessage(null);
    setInitializationError(null);
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace("/");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        eyebrow="Welcome back"
        title="Sign in"
        description="Continue your marriage introduction journey."
      />
      {message ? <Notice tone="error">{message}</Notice> : null}
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
            autoCapitalize="none"
            secureTextEntry
            textContentType="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />
      <Link href="/forgot-password" asChild>
        <Text style={styles.link}>Forgot your password?</Text>
      </Link>
      <Button loading={submitting} onPress={() => void submit()}>
        Sign in securely
      </Button>
      <Text style={styles.footer}>
        New to Azwaj?{" "}
        <Text style={styles.footerLink} onPress={() => router.push("/sign-up")}>
          Create an account
        </Text>
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
  link: {
    alignSelf: "flex-end",
    color: theme.color.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    color: theme.color.muted,
    textAlign: "center",
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  footerLink: {
    color: theme.color.primary,
    fontWeight: "700",
  },
});
