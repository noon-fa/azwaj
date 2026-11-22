import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  Brand,
  Button,
  Card,
  Heading,
  LoadingState,
  Notice,
  Page,
} from "@/components/ui";
import { requireSupabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function AccountScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const userId = session?.user.id;
  const deletionRequestQuery = useQuery({
    queryKey: ["deletion-request", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Sign in to check your account.");
      const { data, error } = await requireSupabase()
        .from("account_deletion_requests")
        .select("id, status, requested_at")
        .eq("user_id", userId)
        .eq("status", "pending")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });

  const signOut = async () => {
    setSigningOut(true);
    setErrorMessage(null);
    try {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
      router.replace("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign out right now.",
      );
    } finally {
      setSigningOut(false);
    }
  };

  const requestDeletion = async () => {
    if (!userId) {
      setErrorMessage("Sign in to request account deletion.");
      return;
    }
    setRequestingDeletion(true);
    setErrorMessage(null);
    try {
      const { error } = await requireSupabase()
        .from("account_deletion_requests")
        .insert({ user_id: userId });
      if (error) throw error;
      setConfirmingDeletion(false);
      await queryClient.invalidateQueries({
        queryKey: ["deletion-request", userId],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your account deletion request.",
      );
    } finally {
      setRequestingDeletion(false);
    }
  };

  return (
    <Page scroll style={styles.page}>
      <Brand />
      <Heading
        title="Account and privacy"
        description="Your account details are private and are not displayed in discovery."
      />
      {errorMessage ? <Notice tone="error">{errorMessage}</Notice> : null}
      <Card style={styles.details}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{session?.user.email ?? "Unavailable"}</Text>
        <Text style={styles.note}>
          Your email address is used for account access and is never shown on a
          marriage profile.
        </Text>
      </Card>
      <Button variant="secondary" loading={signingOut} onPress={signOut}>
        Sign out
      </Button>
      {deletionRequestQuery.isError ? (
        <Notice tone="error">
          {deletionRequestQuery.error instanceof Error
            ? deletionRequestQuery.error.message
            : "Unable to check your account deletion request."}
        </Notice>
      ) : deletionRequestQuery.isLoading ? (
        <LoadingState label="Checking account deletion status" />
      ) : deletionRequestQuery.data ? (
        <Notice tone="success">
          Your account deletion request has been received. Your account remains
          active until a trusted administrator reviews the request.
        </Notice>
      ) : (
        <>
          <Text style={styles.footer}>
            You may request account deletion. The request is reviewed by a
            trusted administrator and does not immediately delete your account.
          </Text>
          {confirmingDeletion ? (
            <Card style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>
                Submit an account deletion request?
              </Text>
              <Text style={styles.footer}>
                Your account will remain active while the request is reviewed.
                You can sign in to check its status.
              </Text>
              <Button
                loading={requestingDeletion}
                onPress={() => void requestDeletion()}
              >
                Confirm deletion request
              </Button>
              <Button
                variant="text"
                onPress={() => setConfirmingDeletion(false)}
              >
                Keep my account
              </Button>
            </Card>
          ) : (
            <Button
              variant="secondary"
              disabled={!userId}
              onPress={() => setConfirmingDeletion(true)}
            >
              Request account deletion
            </Button>
          )}
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: theme.spacing.lg,
  },
  details: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.color.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  value: {
    color: theme.color.text,
    fontSize: 16,
    fontWeight: "700",
  },
  note: {
    color: theme.color.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    color: theme.color.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  confirmCard: {
    gap: theme.spacing.md,
  },
  confirmTitle: {
    color: theme.color.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
