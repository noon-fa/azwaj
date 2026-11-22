import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Brand,
  Button,
  Card,
  Heading,
  LoadingState,
  Notice,
  Page,
} from "@/components/ui";
import { getOwnProfile } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function WelcomeScreen() {
  const { session, loading, configured, initializationError } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: () => getOwnProfile(session!.user.id),
    enabled: Boolean(session),
  });

  useEffect(() => {
    if (!session || profileQuery.isLoading || profileQuery.isError) return;
    router.replace(profileQuery.data ? "/(member)" : "/onboarding");
  }, [session, profileQuery.data, profileQuery.isLoading, profileQuery.isError]);

  if (loading || (session && profileQuery.isLoading)) {
    return (
      <Page>
        <LoadingState label="Preparing your private account" />
      </Page>
    );
  }

  if (session && profileQuery.isError) {
    return (
      <Page style={styles.center}>
        <Brand />
        <Heading title="We could not load your account" />
        <Notice tone="error">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "Please check your connection and try again."}
        </Notice>
        <Button onPress={() => void profileQuery.refetch()}>Try again</Button>
      </Page>
    );
  }

  if (session) return null;

  return (
    <Page scroll style={styles.welcome}>
      <Brand />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>A mindful introduction process</Text>
        <Text style={styles.heroTitle}>
          A considered path{"\n"}toward marriage.
        </Text>
        <Text style={styles.heroDescription}>
          A private, family-conscious space for Muslims seeking marriage with
          sincerity and care.
        </Text>
      </View>

      <Card style={styles.promiseCard}>
        <Text style={styles.cardTitle}>Built around what matters</Text>
        {[
          ["01", "Privacy first", "Your details stay private and in your control."],
          ["02", "Family welcome", "A wali can be involved with your permission."],
          ["03", "Purposeful steps", "Introductions follow a clear, respectful process."],
        ].map(([number, title, description]) => (
          <View key={number} style={styles.promiseRow}>
            <Text style={styles.promiseNumber}>{number}</Text>
            <View style={styles.promiseText}>
              <Text style={styles.promiseTitle}>{title}</Text>
              <Text style={styles.promiseDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </Card>

      {!configured ? (
        <Notice>
          Authentication is not connected yet. Add the public Supabase URL and
          key from .env.example to enable account access.
        </Notice>
      ) : null}
      {initializationError ? (
        <Notice tone="error">{initializationError}</Notice>
      ) : null}

      <View style={styles.actions}>
        <Button onPress={() => router.push("/sign-up")}>Create an account</Button>
        <Button variant="secondary" onPress={() => router.push("/sign-in")}>
          Sign in
        </Button>
      </View>
      <Text style={styles.footnote}>
        For serious marriage intentions. No public contact details.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  welcome: {
    gap: theme.spacing.xl,
  },
  center: {
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  hero: {
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  eyebrow: {
    color: theme.color.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: theme.color.text,
    fontSize: 39,
    lineHeight: 46,
    fontWeight: "700",
    letterSpacing: -1,
  },
  heroDescription: {
    maxWidth: 440,
    color: theme.color.muted,
    fontSize: 17,
    lineHeight: 26,
  },
  promiseCard: {
    gap: theme.spacing.lg,
  },
  cardTitle: {
    color: theme.color.text,
    fontSize: 18,
    fontWeight: "700",
  },
  promiseRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  promiseNumber: {
    color: theme.color.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingTop: 2,
  },
  promiseText: {
    flex: 1,
    gap: 4,
  },
  promiseTitle: {
    color: theme.color.text,
    fontSize: 15,
    fontWeight: "700",
  },
  promiseDescription: {
    color: theme.color.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  footnote: {
    color: theme.color.muted,
    textAlign: "center",
    fontSize: 13,
  },
});
