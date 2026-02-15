import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "student" | "guide" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as UserRole) || "student";
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("name, email, avatar")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function buildAuthUser(user: User): Promise<AuthUser> {
  const [role, profile] = await Promise.all([
    fetchUserRole(user.id),
    fetchProfile(user.id),
  ]);
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || "",
    email: profile?.email || user.email || "",
    role,
    avatar: profile?.avatar || (profile?.name || "").split(" ").map((n: string) => n[0]).join(""),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Use setTimeout to avoid Supabase client deadlock
        setTimeout(async () => {
          const authUser = await buildAuthUser(newSession.user);
          setUser(authUser);
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        const authUser = await buildAuthUser(existingSession.user);
        setUser(authUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    // State update handled by onAuthStateChange
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    // Assign role
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: role as UserRole });
      // Create role-specific record
      if (role === "student") {
        await supabase.from("students").insert({ user_id: data.user.id });
      } else if (role === "guide") {
        await supabase.from("guides").insert({ user_id: data.user.id });
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
