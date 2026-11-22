import assert from "node:assert/strict";
import test from "node:test";
import {
  onboardingSchema,
  signUpSchema,
} from "../src/lib/validation";

function onboardingInput(dateOfBirth: string) {
  return {
    intendedRole: "sister" as const,
    fullName: "Amina Rahman",
    phone: "+94771234567",
    country: "Sri Lanka",
    city: "Colombo",
    preferredLanguage: "English",
    dateOfBirth,
    dataProcessingConsent: true,
    profileVisibility: false,
  };
}

function dateEighteenYearsAgo() {
  const today = new Date();
  return new Date(
    Date.UTC(
      today.getUTCFullYear() - 18,
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  )
    .toISOString()
    .slice(0, 10);
}

test("onboarding accepts an adult while leaving profile visibility private", () => {
  const result = onboardingSchema.safeParse(
    onboardingInput(dateEighteenYearsAgo()),
  );

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.profileVisibility, false);
});

test("onboarding rejects underage, impossible-date, and unconsented profiles", () => {
  const adultDate = dateEighteenYearsAgo();
  const nextDay = new Date(`${adultDate}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const underage = onboardingInput(nextDay.toISOString().slice(0, 10));

  assert.equal(onboardingSchema.safeParse(underage).success, false);
  assert.equal(
    onboardingSchema.safeParse(onboardingInput("2000-02-31")).success,
    false,
  );
  assert.equal(
    onboardingSchema.safeParse({
      ...onboardingInput(adultDate),
      dataProcessingConsent: false,
    }).success,
    false,
  );
});

test("registration rejects mismatched or too-short passwords", () => {
  assert.equal(
    signUpSchema.safeParse({
      email: "person@example.com",
      password: "A-long-password",
      confirmPassword: "A-different-password",
    }).success,
    false,
  );
  assert.equal(
    signUpSchema.safeParse({
      email: "person@example.com",
      password: "short",
      confirmPassword: "short",
    }).success,
    false,
  );
});
