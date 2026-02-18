import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabase, isSupabaseConfigured } from "../config/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signOutLocal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] auth state change:', event, {
          userId: newSession?.user?.id ?? null,
          hasSession: !!newSession,
        });
        setSession(newSession);
        setUser(newSession?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const supabase = getSupabase();
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      console.log('[Auth] Performing server signOut');
      await supabase.auth.signOut();
      console.log('[Auth] Server signOut completed');
    } catch (e) {
      console.warn('[Auth] signOut failed', e);
    }
  };

  // Local-only sign out: clears local persisted auth state without calling Supabase server
  const signOutLocal = async () => {
    try {
      console.log('[Auth] Performing local-only signOut (clearing local storage)');
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter((k) =>
        typeof k === 'string' && (
          k.includes('supabase') ||
          k.includes('sb:') ||
          k.includes('sb-') ||
          k.includes('supabase.auth')
        ),
      );
      if (authKeys.length > 0) await AsyncStorage.multiRemove(authKeys);
      // Also clear in-memory session
      setSession(null);
      setUser(null);
      console.log('[Auth] Local-only signOut complete, removed keys:', authKeys);
    } catch (e) {
      console.warn('[Auth] Local-only signOut failed', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut, signOutLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
