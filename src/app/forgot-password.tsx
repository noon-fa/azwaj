import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { z } from "zod";
import {
  Brand,
  Button,
  Heading,
  Notice,
  Page,
  TextField,
} from "@/components/ui";
import { requireSupabase } from "@/lib/supabase";
import { emailSchema } from "@/lib/validation";
import { theme } from "@/theme";

const resetRequestSchema = z.object({ email: emailSchema });
type ResetRequestValues = z.infer<typeof resetRequestSchema>;

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });

  const submit = handleSubmit(async ({ email }) => {
    setSubmitting(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(
        email,
        { redirectTo: Linking.createURL("reset-password") },
      );
      if (error) throw error;
      setMessage(
        "If an account exists for that address, a password reset link is on its way.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        title="Reset your password"
        description="Enter the email address connected to your Azwaj account."
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
            keyboardType="email-address"
            autoComplete="email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />
      <Button loading={submitting} onPress={() => void submit()}>
        Send reset link
      </Button>
      <Button variant="text" onPress={() => router.back()}>
        Back to sign in
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
});
