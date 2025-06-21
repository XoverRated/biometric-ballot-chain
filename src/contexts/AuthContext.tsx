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
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

        if (error && status !== 406) {
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
          setTimeout(() => fetchUserProfile(currentUser.id), 0);
        } else {
          setProfile(null);
        }
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
      setLoading(false);
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

      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      });

    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
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

      // Send registration confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-registration-email', {
          body: { email, fullName }
        });
        
        if (emailError) {
          console.error("Failed to send registration email:", emailError);
        }
      } catch (emailErr) {
        console.error("Email service error:", emailErr);
      }

      toast({
        title: "Sign Up Successful",
        description: "Welcome! Please check your email for confirmation and complete your biometric setup.",
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
    profile,
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
