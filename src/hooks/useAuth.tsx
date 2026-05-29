import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/browser";

const DEVICE_TOKEN_KEY = "dc_device_token";
// sessionStorage: cleared when tab is closed, persists across same-tab refreshes
const SESSION_CHECK_KEY = "dc_session_ok";

function getDeviceToken(): string {
  let token = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  }
  return token;
}

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

function isSessionVerifiedThisTab(): boolean {
  return sessionStorage.getItem(SESSION_CHECK_KEY) === "1";
}

function markSessionVerified() {
  sessionStorage.setItem(SESSION_CHECK_KEY, "1");
}

async function registerSession(): Promise<{ ok?: boolean; error?: string; code?: string }> {
  const { data, error } = await supabase.functions.invoke("manage-session", {
    body: {
      action: "register",
      device_token: getDeviceToken(),
      device_info: getDeviceInfo(),
    },
  });
  if (error) return { error: error.message };
  return data;
}

async function verifySession(): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("manage-session", {
    body: { action: "verify", device_token: getDeviceToken() },
  });
  if (error || !data) return true; // lenient on network errors
  return data.valid === true;
}

async function logoutSession(): Promise<void> {
  await supabase.functions.invoke("manage-session", {
    body: { action: "logout", device_token: getDeviceToken() },
  });
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  activity: string | null;
  avatar_url: string | null;
  subscription_active: boolean;
  lifetime_access: boolean;
  beta_tester: boolean;
  role: 'creator' | 'student';
  plan_type: 'starter' | 'pro' | null;
  stripe_customer_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  sessionError: string | null;
  signUp: (email: string, password: string, metadata?: { full_name?: string; activity?: string; subscription_active?: boolean; role?: 'creator' | 'student' }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  // Prevent double profile fetch from getSession() + INITIAL_SESSION firing together
  const profileLoadedRef = useRef(false);

  const fetchProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (data && !error) {
      setProfile(data as unknown as Profile);
      return;
    }

    const fullName =
      (authUser.user_metadata?.full_name as string | undefined) ||
      authUser.email?.split("@")[0] ||
      "Creator";

    // Profilul nu a fost găsit (trigger poate că nu a rulat încă) — inserăm direct
    // Folosim onConflict: "user_id" (nu "id") fiindcă profiles.id e auto-generat
    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .upsert({
        user_id: authUser.id,
        full_name: fullName,
        activity: (authUser.user_metadata?.activity as string | undefined) || null,
        email: authUser.email || ''
      }, { onConflict: "user_id" })
      .select()
      .maybeSingle();

    if (createdProfile && !createError) {
      setProfile(createdProfile as unknown as Profile);
      return;
    }

    // Ultimă încercare — citim direct din DB
    const { data: retryProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (retryProfile) {
      setProfile(retryProfile as unknown as Profile);
    }
  };

  const checkIsAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  // Background session check — runs after profile is already loading, never blocks UI
  const runSessionCheckInBackground = (signOutFn: () => Promise<void>) => {
    if (isSessionVerifiedThisTab()) return;

    (async () => {
      const valid = await verifySession();
      if (!valid) {
        const result = await registerSession();
        // Deconectăm DOAR dacă limita de dispozitive e atinsă în mod explicit
        // Erorile de rețea sau alt tip nu deconectează utilizatorul
        if (result?.code === "MAX_SESSIONS_REACHED") {
          setSessionError(result.error || "Limita de dispozitive atinsă.");
          await signOutFn();
          return;
        }
        // Dacă registerSession a eșuat din alt motiv (rețea etc.), lăsăm utilizatorul logat
        if (result?.error && result.code !== "MAX_SESSIONS_REACHED") {
          console.warn("Session register failed (non-critical):", result.error);
          markSessionVerified(); // tratăm ca verificat ca să nu reîncercăm la fiecare reload
          return;
        }
      }
      markSessionVerified();
    })();
  };

  useEffect(() => {
    // Load session immediately from localStorage (no network call)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        profileLoadedRef.current = true;
        // These are fast DB calls — start immediately
        fetchProfile(session.user);
        checkIsAdmin(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN") {
            // Load profile immediately — don't block on session check
            profileLoadedRef.current = true;
            fetchProfile(session.user);
            checkIsAdmin(session.user.id);
            // Register device in background — checks 2-device limit
            (async () => {
              const result = await registerSession();
              if (result?.code === "MAX_SESSIONS_REACHED") {
                setSessionError(result.error || "Limita de dispozitive atinsă.");
                await supabase.auth.signOut();
                return;
              }
              setSessionError(null);
              markSessionVerified();
            })();
          }

          if (event === "INITIAL_SESSION") {
            // Profile: load only if getSession() hasn't already started it
            if (!profileLoadedRef.current) {
              profileLoadedRef.current = true;
              fetchProfile(session.user);
              checkIsAdmin(session.user.id);
            }
            // Session check runs in background — doesn't block anything
            runSessionCheckInBackground(async () => {
              await supabase.auth.signOut();
            });
          }

          // TOKEN_REFRESHED: token auto-renewed, just ensure profile is loaded
          if (event === "TOKEN_REFRESHED") {
            if (!profileLoadedRef.current) {
              profileLoadedRef.current = true;
              fetchProfile(session.user);
              checkIsAdmin(session.user.id);
            }
          }
        } else {
          profileLoadedRef.current = false;
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Real-time profile sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as unknown as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; activity?: string; subscription_active?: boolean; role?: 'creator' | 'student' }
  ) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: metadata?.full_name, activity: metadata?.activity }
      }
    });

    if (!error) {
      // Folosim userul direct din răspunsul signUp (nu getUser care poate fi null)
      const newUser = signUpData?.user;
      if (newUser) {
        // Trigger-ul on_auth_user_created creează profilul automat cu subscription_active=false
        // și un id auto-generat diferit de user_id.
        // Facem UPDATE după user_id (nu upsert după id) ca să nu creăm duplicat.
        await supabase
          .from("profiles")
          .update({
            full_name: metadata?.full_name || "Utilizator",
            activity: metadata?.activity || null,
            subscription_active: metadata?.subscription_active || false,
            role: metadata?.role || 'student'
          })
          .eq("user_id", newUser.id);
        await fetchProfile(newUser);
      }
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await logoutSession();
    sessionStorage.removeItem(SESSION_CHECK_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      sessionError,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
