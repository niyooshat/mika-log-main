import { getSupabase } from "../config/supabaseClient";

export const signUp = async (email: string, password: string) => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const result = await supabase.auth.signInWithPassword({ email, password });
  return result;
};

export const signOut = async () => {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const onAuthStateChange = (
  cb: (event: string, session: any) => void,
) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    try {
      cb(event, session);
    } catch (e) {
      // swallow
    }
  });
  return () => data.subscription?.unsubscribe();
};
