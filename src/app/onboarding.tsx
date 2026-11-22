import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Brand,
  Button,
  Card,
  Heading,
  Notice,
  Page,
  TextField,
} from "@/components/ui";
import { requireSupabase } from "@/lib/supabase";
import {
  onboardingSchema,
  type OnboardingInput,
  type OnboardingValues,
} from "@/lib/validation";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function OnboardingScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingInput, unknown, OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      intendedRole: "",
      fullName: "",
      phone: "",
      country: "",
      city: "",
      preferredLanguage: "",
      dateOfBirth: "",
      dataProcessingConsent: false,
      profileVisibility: false,
    },
  });
  const selectedRole = useWatch({ control, name: "intendedRole" });
  const processingConsent = useWatch({
    control,
    name: "dataProcessingConsent",
  });
  const profileVisibility = useWatch({ control, name: "profileVisibility" });

  useEffect(() => {
    if (!session) router.replace("/sign-in");
  }, [session]);

  const submit = handleSubmit(async (values) => {
    if (!session) {
      router.replace("/sign-in");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await requireSupabase().from("profiles").insert({
        id: session.user.id,
        intended_role: values.intendedRole,
        full_name: values.fullName,
        phone: values.phone,
        country: values.country,
        city: values.city,
        preferred_language: values.preferredLanguage,
        date_of_birth: values.dateOfBirth,
        profile_visibility: values.profileVisibility,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({
        queryKey: ["profile", session.user.id],
      });
      router.replace("/(member)");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save your account details. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!session) {
    return null;
  }

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        eyebrow="Private account setup"
        title="A little about you"
        description="These details help us set up your account. Your contact information and date of birth are never part of a public profile."
      />

      <View style={styles.group}>
        <Text style={styles.label}>Your intended role</Text>
        <View style={styles.roles}>
          {(["brother", "sister"] as const).map((role) => (
            <Pressable
              key={role}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedRole === role }}
              onPress={() =>
                setValue("intendedRole", role, { shouldValidate: true })
              }
              style={[
                styles.roleOption,
                selectedRole === role && styles.roleSelected,
              ]}
            >
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === role && styles.roleTitleSelected,
                ]}
              >
                {role === "brother" ? "Brother" : "Sister"}
              </Text>
              <Text style={styles.roleHint}>
                {role === "brother"
                  ? "I am seeking a sister for marriage."
                  : "I am seeking a brother for marriage."}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.intendedRole?.message ? (
          <Text style={styles.error}>{errors.intendedRole.message}</Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Full name"
            autoComplete="name"
            textContentType="name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.fullName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Date of birth"
            placeholder="YYYY-MM-DD"
            hint="You must be 18 or older to use Azwaj."
            keyboardType="numbers-and-punctuation"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.dateOfBirth?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Phone number"
            hint="Private. Shared only after the required parties consent."
            autoComplete="tel"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
          />
        )}
      />
      <View style={styles.locationRow}>
        <View style={styles.locationField}>
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Country"
                autoComplete="country"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.country?.message}
              />
            )}
          />
        </View>
        <View style={styles.locationField}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="City"
                autoComplete="postal-address-locality"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.city?.message}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="preferredLanguage"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Preferred language"
            placeholder="For example, English"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.preferredLanguage?.message}
          />
        )}
      />

      <Card style={styles.consentCard}>
        <Text style={styles.consentTitle}>Your privacy choices</Text>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: processingConsent }}
          onPress={() =>
            setValue("dataProcessingConsent", !processingConsent, {
              shouldValidate: true,
            })
          }
          style={styles.consentRow}
        >
          <View style={[styles.checkbox, processingConsent && styles.checked]}>
            {processingConsent ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.consentCopy}>
            I have read and consent to Azwaj processing the personal information
            needed to provide this service.{" "}
            <Text style={styles.required}>Required</Text>
          </Text>
        </Pressable>
        {errors.dataProcessingConsent?.message ? (
          <Text style={styles.error}>
            {errors.dataProcessingConsent.message}
          </Text>
        ) : null}
        <Text style={styles.visibilityTitle}>Profile visibility</Text>
        <Text style={styles.consentCopy}>
          You can change this later. Profiles are not shown to anyone until they
          are reviewed and approved.
        </Text>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: profileVisibility }}
          onPress={() =>
            setValue("profileVisibility", !profileVisibility, {
              shouldValidate: true,
            })
          }
          style={styles.consentRow}
        >
          <View style={[styles.checkbox, profileVisibility && styles.checked]}>
            {profileVisibility ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.consentCopy}>
            I would like an approved profile to be eligible for visibility to
            appropriate members.
          </Text>
        </Pressable>
      </Card>
      {submitError ? <Notice tone="error">{submitError}</Notice> : null}
      <Button loading={submitting} onPress={() => void submit()}>
        Save and continue
      </Button>
      <Text style={styles.footnote}>
        Your details are private by default. You can update your choices before
        submitting a marriage profile.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
  group: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.color.text,
    fontSize: 14,
    fontWeight: "600",
  },
  roles: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  roleOption: {
    flex: 1,
    minHeight: 94,
    justifyContent: "center",
    gap: 6,
    padding: theme.spacing.md,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  roleSelected: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.surfaceMuted,
  },
  roleTitle: {
    color: theme.color.text,
    fontSize: 15,
    fontWeight: "700",
  },
  roleTitleSelected: {
    color: theme.color.primary,
  },
  roleHint: {
    color: theme.color.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    color: theme.color.error,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  locationField: {
    flex: 1,
  },
  consentCard: {
    gap: theme.spacing.md,
  },
  consentTitle: {
    color: theme.color.text,
    fontSize: 17,
    fontWeight: "700",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.color.surface,
    marginTop: 1,
  },
  checked: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primary,
  },
  checkmark: {
    color: theme.color.white,
    fontWeight: "700",
    fontSize: 14,
  },
  consentCopy: {
    flex: 1,
    color: theme.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  required: {
    color: theme.color.primary,
    fontWeight: "700",
  },
  visibilityTitle: {
    color: theme.color.text,
    fontSize: 14,
    fontWeight: "700",
  },
  footnote: {
    color: theme.color.muted,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
  },
});
