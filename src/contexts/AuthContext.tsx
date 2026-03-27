import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  setUserRole: (role: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!supabase.isInitialized) {
      console.warn("Supabase client not initialized. Auth features will be disabled.");
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) console.error("Error getting session:", error);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: metadata, 
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!supabase.isInitialized) throw new Error("Supabase client not initialized");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + (import.meta.env.BASE_URL || "/"),
        }
      });
      if (error) return { error };
      return { error: null };
    } catch (err) {
      console.error("Error signing in with Google:", err);
      return { error: err as Error };
    }
  };

  const setUserRole = async (role: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("No user logged in");

      // Update auth metadata
      const { data, error: authError } = await supabase.auth.updateUser({
        data: { user_role: role }
      });
      if (authError) throw authError;

      // Also upsert into user_roles table for consistency
      const { error: dbError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: currentUser.id, 
          role: role 
        });
      
      if (dbError) {
        console.warn("Could not sync role to DB, but metadata updated:", dbError.message);
      }

      setUser(data.user);
      return { error: null };
    } catch (err) {
      console.error("Error setting user role:", err);
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, signInWithGoogle, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
