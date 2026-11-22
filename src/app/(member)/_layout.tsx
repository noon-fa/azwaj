import { useQuery } from "@tanstack/react-query";
import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { LoadingState, Notice, Page } from "@/components/ui";
import { getOwnProfile } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { theme } from "@/theme";

export default function MemberLayout() {
  const { session, loading } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: () => getOwnProfile(session!.user.id),
    enabled: Boolean(session),
  });

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/sign-in");
    } else if (profileQuery.data === null) {
      router.replace("/onboarding");
    }
  }, [loading, session, profileQuery.data]);

  if (loading || !session || profileQuery.isLoading) {
    return (
      <Page>
        <LoadingState label="Loading your private account" />
      </Page>
    );
  }

  if (profileQuery.isError) {
    return (
      <Page style={{ justifyContent: "center" }}>
        <Notice tone="error">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "Unable to load your account. Check your connection and try again."}
        </Notice>
      </Page>
    );
  }

  if (!profileQuery.data) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.primary,
        tabBarInactiveTintColor: theme.color.muted,
        tabBarStyle: {
          backgroundColor: theme.color.surface,
          borderTopColor: theme.color.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
