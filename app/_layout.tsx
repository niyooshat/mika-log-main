import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { isSupabaseConfigured } from "@/src/config/supabaseClient";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { LibraryProvider } from "@/src/context/LibraryContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * Inner component that handles auth-based navigation.
 * Must be inside AuthProvider and inside the router tree.
 */
function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!user && !inAuthGroup) {
      // Not signed in — redirect to login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Already signed in — redirect to home
      router.replace("/");
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LibraryProvider>
          <AuthGate />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Modal",
                gestureEnabled: true,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </LibraryProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
