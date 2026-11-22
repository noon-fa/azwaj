import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import {
  Brand,
  Button,
  Heading,
  Notice,
  Page,
  TextField,
} from "@/components/ui";
import { requireSupabase } from "@/lib/supabase";
import {
  passwordResetSchema,
  type PasswordResetValues,
} from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function ResetPasswordScreen() {
  const { session } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async ({ password }) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) throw error;
      router.replace("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update the password.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!session) {
    return (
      <Page style={styles.page}>
        <Brand />
        <Heading
          title="Open your reset link"
          description="Use the password reset link sent to your email, then return here to choose a new password."
        />
        <Button variant="secondary" onPress={() => router.replace("/sign-in")}>
          Return to sign in
        </Button>
      </Page>
    );
  }

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        title="Choose a new password"
        description="Use at least 10 characters and keep it unique to Azwaj."
      />
      {errorMessage ? <Notice tone="error">{errorMessage}</Notice> : null}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New password"
            autoCapitalize="none"
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
            label="Confirm new password"
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
      <Button loading={submitting} onPress={() => void submit()}>
        Update password
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
});
