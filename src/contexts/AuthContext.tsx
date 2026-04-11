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
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) syncUserMetadata(currentUser);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
          syncUserMetadata(currentUser);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, []);

  const syncUserMetadata = async (currentUser: User) => {
    try {
      // 1. Fetch role from DB
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (roleError) {
        console.warn("Error fetching role for sync:", roleError.message);
        return;
      }

      const dbRole = roleData?.role;
      const currentMetadataRole = currentUser.user_metadata?.user_role;

      // 2. Fetch profile info if needed (just for full_name sync)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      const isAutoAssignedCustomer = dbRole === "customer" && !currentMetadataRole;
      const needsUpdate = dbRole && dbRole !== currentMetadataRole && !isAutoAssignedCustomer;

      if (needsUpdate) {
        console.log("Synchronizing user metadata with database role:", dbRole);
        const { data: updatedData, error: updateError } = await supabase.auth.updateUser({
          data: { 
            user_role: dbRole
          }
        });
        
        if (!updateError && updatedData.user) {
          setUser(updatedData.user);
        }
      }
    } catch (err) {
      console.error("Critical error in syncUserMetadata:", err);
    }
  };

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

      // Check for pending referral code
      const pendingRef = localStorage.getItem("pending_referral_code");
      let referredById = null;

      if (pendingRef) {
        const { data: referrerId } = await supabase.rpc("get_user_id_by_referral_code", { 
          p_code: pendingRef 
        });
        if (referrerId) {
          referredById = referrerId;
          console.log("Successfully linked to referrer:", referredById);
        }
      }

      // Update auth metadata
      const { data, error: authError } = await supabase.auth.updateUser({
        data: { user_role: role }
      });
      if (authError) throw authError;

      // Also upsert into user_roles and update profiles
      const { error: dbError } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: currentUser.id, 
          role: role 
        });
      
      if (dbError) {
        console.warn("Could not sync role to DB:", dbError.message);
      }

      // Proactively ensure profile exists
      const { error: profileSyncError } = await supabase
        .from("profiles")
        .upsert({
          user_id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "User",
          phone: currentUser.user_metadata?.phone || "0000000000"
        }, { onConflict: "user_id" });

      if (profileSyncError) {
        console.warn("Profile sync warning:", profileSyncError.message);
      }

      // Update profile with referral info if found
      if (referredById) {
        await supabase
          .from("profiles")
          .update({ referred_by: referredById })
          .eq("user_id", currentUser.id);
        
        // Clear the code after successful linkage
        localStorage.removeItem("pending_referral_code");
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
