import { Stack, useRouter } from "expo-router";
import * as ExpoLinking from "expo-linking";
import { useEffect } from "react";
import { Linking as NativeLinking } from "react-native";
import { requireSupabase, supabase } from "@/lib/supabase";
import { AppProviders } from "@/providers/AppProviders";
import { useAuth } from "@/providers/AuthProvider";

function Navigation() {
  const router = useRouter();
  const { setInitializationError } = useAuth();

  useEffect(() => {
    let active = true;
    const handleUrl = async (url: string) => {
      const parsed = ExpoLinking.parse(url);
      const linkError = parsed.queryParams?.error_description;
      if (typeof linkError === "string") {
        setInitializationError(linkError);
        router.replace("/sign-in");
        return;
      }
      const code = parsed.queryParams?.code;
      if (typeof code !== "string" || !supabase) return;

      const { error } = await requireSupabase().auth.exchangeCodeForSession(code);
      if (!active) return;
      if (error) {
        setInitializationError(error.message);
        router.replace("/sign-in");
        return;
      }
      router.replace(
        parsed.path?.includes("reset-password") ? "/reset-password" : "/",
      );
    };

    const subscription = NativeLinking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });
    void NativeLinking.getInitialURL().then((url) => {
      if (url) return handleUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [router, setInitializationError]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(member)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <Navigation />
    </AppProviders>
  );
}
