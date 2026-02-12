import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authAPI } from "@/services/api";
import type { UserRole } from "@/data/mockData";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Mock auth for development (remove when backend is ready) ───
const MOCK_USERS: AuthUser[] = [
  { id: "u1", name: "Aarav Patel", email: "student@demo.com", role: "student", avatar: "AP" },
  { id: "u2", name: "Dr. Sharma", email: "guide@demo.com", role: "guide", avatar: "DS" },
  { id: "u3", name: "Admin User", email: "admin@demo.com", role: "admin", avatar: "AD" },
];

function mockLogin(email: string, _password: string): AuthUser | null {
  return MOCK_USERS.find((u) => u.email === email) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try real API first
      const res = await authAPI.login({ email, password });
      const { token: jwt, user: userData } = res.data;
      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
    } catch {
      // Fallback to mock auth in development
      const mockUser = mockLogin(email, password);
      if (!mockUser) throw new Error("Invalid credentials");
      const fakeToken = "mock-jwt-" + mockUser.id;
      localStorage.setItem("token", fakeToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setToken(fakeToken);
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({ name, email, password, role });
      const { token: jwt, user: userData } = res.data;
      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
    } catch {
      // Mock registration fallback
      const newUser: AuthUser = { id: "u-new", name, email, role: role as UserRole, avatar: name.split(" ").map(n => n[0]).join("") };
      const fakeToken = "mock-jwt-new";
      localStorage.setItem("token", fakeToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(fakeToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
