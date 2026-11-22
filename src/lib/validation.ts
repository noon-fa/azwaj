import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function isAdultDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return false;
  }

  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const birthdayHasNotPassed =
    now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() &&
      now.getUTCDate() < date.getUTCDate());
  if (birthdayHasNotPassed) age -= 1;
  return age >= 18;
}

export const onboardingSchema = z.object({
  intendedRole: z
    .enum(["brother", "sister", ""])
    .refine((role): role is "brother" | "sister" => role !== "", {
      message: "Choose the role that best describes your introduction journey.",
    }),
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(24),
  country: z.string().trim().min(2, "Enter your country.").max(80),
  city: z.string().trim().min(2, "Enter your city.").max(100),
  preferredLanguage: z
    .string()
    .trim()
    .min(2, "Enter your preferred language.")
    .max(60),
  dateOfBirth: z
    .string()
    .refine(isAdultDate, "You must be at least 18 years old."),
  dataProcessingConsent: z.boolean().refine(Boolean, {
    error: "Please review and accept the privacy information.",
  }),
  profileVisibility: z.boolean(),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
export type OnboardingInput = z.input<typeof onboardingSchema>;
export type OnboardingValues = z.output<typeof onboardingSchema>;
