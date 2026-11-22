import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import {
  Brand,
  Button,
  Card,
  Heading,
  LoadingState,
  Page,
} from "@/components/ui";
import { getOwnProfile } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function MemberHomeScreen() {
  const { session } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: () => getOwnProfile(session!.user.id),
    enabled: Boolean(session),
  });
  const profile = profileQuery.data;

  if (profileQuery.isLoading) {
    return (
      <Page>
        <LoadingState label="Loading your account" />
      </Page>
    );
  }

  if (!profile) {
    return (
      <Page>
        <Heading title="Account details are unavailable" />
      </Page>
    );
  }

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        eyebrow={
          profile.intended_role === "brother"
            ? "Brother's account"
            : "Sister's account"
        }
        title={`Assalamu alaikum, ${profile.full_name.split(" ")[0]}`}
        description="Your account is ready. You remain in control of your privacy and next steps."
      />

      <Card style={styles.statusCard}>
        <View style={styles.statusDot} />
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>Your profile is private</Text>
          <Text style={styles.statusDescription}>
            No marriage profile has been submitted or shown to other members.
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>A considered process</Text>
        {[
          [
            "01",
            "Complete a marriage profile",
            "Share only information you are comfortable providing.",
          ],
          [
            "02",
            "Review before visibility",
            "Your profile is reviewed before it can be considered.",
          ],
          [
            "03",
            "Proceed with consent",
            "Any introduction follows an agreed, family-conscious process.",
          ],
        ].map(([number, title, description]) => (
          <Card key={number} style={styles.stepCard}>
            <Text style={styles.stepNumber}>{number}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{title}</Text>
              <Text style={styles.stepDescription}>{description}</Text>
            </View>
          </Card>
        ))}
      </View>

      <Button
        variant="secondary"
        onPress={() => router.push("/(member)/account")}
      >
        Review account and privacy
      </Button>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.xl,
  },
  statusCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start",
    backgroundColor: theme.color.surfaceMuted,
    borderColor: "transparent",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: theme.color.primary,
  },
  statusText: {
    flex: 1,
    gap: 5,
  },
  statusTitle: {
    color: theme.color.text,
    fontSize: 15,
    fontWeight: "700",
  },
  statusDescription: {
    color: theme.color.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.color.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepCard: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  stepNumber: {
    color: theme.color.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingTop: 2,
  },
  stepText: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    color: theme.color.text,
    fontSize: 14,
    fontWeight: "700",
  },
  stepDescription: {
    color: theme.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
