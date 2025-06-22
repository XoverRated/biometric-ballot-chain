import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define a type for the user profile data we expect from the 'profiles' table
interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  created_at: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // Add profile here
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // Add profile state
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`id, full_name, avatar_url, is_admin, created_at`)
          .eq('id', userId)
          .single();

        if (error && status !== 406) { // 406 means no rows found, which is fine if profile not created yet
          console.error("Error fetching profile:", error);
          setProfile(null);
          return;
        }
        if (data) {
          setProfile(data as UserProfile);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Exception fetching profile:", e);
        setProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          // Fetch profile when auth state changes and user is present
          // Use setTimeout to avoid potential deadlocks with onAuthStateChange
          setTimeout(() => fetchUserProfile(currentUser.id), 0);
        } else {
          setProfile(null); // Clear profile on logout
        }
        // setLoading(false) will be handled after initial session check or profile fetch
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false); // Set loading to false after initial session and profile check
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // After successful sign-in, user state will be updated by onAuthStateChange,
      // which will also trigger profile fetching.

      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      });
      // No explicit navigation here, let calling component or onAuthStateChange side-effects handle it.
      // Example: if (signInData.user) { fetchUserProfile(signInData.user.id); }
      // But onAuthStateChange should cover this.

    } catch (error) {
      console.error("Error signing in:", error);
      // toast already shown or error re-thrown
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      // Profile creation is handled by a DB trigger 'handle_new_user'.
      // onAuthStateChange will pick up the new user and fetch profile.

      toast({
        title: "Sign Up Successful",
        description: "Welcome! Please verify your email to continue.",
      });

    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // User and profile states will be cleared by onAuthStateChange
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });

    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile, // Provide profile in context
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
