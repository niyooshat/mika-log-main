import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

/**
 * Supabase Client Configuration
 *
 * Get your Supabase credentials from:
 * https://app.supabase.com/project/_/settings/api
 *
 * Add them to .env.local:
 * EXPO_PUBLIC_SUPABASE_URL=your_project_url
 * EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Check if we're in a browser/React Native environment (not SSR)
 */
const isClient = typeof window !== "undefined" || Platform.OS !== "web";

/**
 * Get Supabase client instance (lazy initialization)
 */
export const getSupabase = (): SupabaseClient | null => {
  // Don't initialize on server-side (SSR)
  if (!isClient) {
    console.log("[Supabase] Skipping init - not client environment");
    return null;
  }

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "your_supabase_project_url_here"
  ) {
    console.warn("[Supabase] Not configured - missing URL or key", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    return null;
  }

  if (!supabaseInstance) {
    try {
      console.log("[Supabase] Initializing client for", Platform.OS);
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      console.log("[Supabase] Successfully initialized");
    } catch (error) {
      console.error("[Supabase] Failed to create client:", error);
      return null;
    }
  }

  return supabaseInstance;
};

// For backward compatibility - but don't initialize during import
export const supabase = null as any;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    isClient &&
    !!(
      supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "your_supabase_project_url_here"
    )
  );
};
