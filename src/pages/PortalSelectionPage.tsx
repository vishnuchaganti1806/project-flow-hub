import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogIn,
  AlertTriangle,
  Shield,
  BookOpen,
  GraduationCap,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/contexts/AuthContext";

/* ─── role config ─── */
const roles: { key: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "admin", label: "Admin", icon: Shield, desc: "Manage users, assignments & monitor system activity." },
  { key: "guide", label: "Guide", icon: BookOpen, desc: "Review ideas, manage students & track deadlines." },
  { key: "student", label: "Student", icon: GraduationCap, desc: "Submit ideas, track progress & connect with guides." },
];

export default function PortalSelectionPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeRole = roles.find((r) => r.key === selectedRole)!;
  const Icon = activeRole.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data: profile, error: lookupErr } = await supabase
        .from("profiles")
        .select("email, user_id")
        .eq("login_id", loginId)
        .maybeSingle();

      if (lookupErr || !profile) throw new Error("Invalid User ID. Please check and try again.");

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (authErr) throw new Error(authErr.message);

      const userId = data.user?.id;
      if (!userId) throw new Error("Login failed");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_active, must_change_password")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData && !profileData.is_active) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated. Contact your administrator.");
      }

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!roleRow || roleRow.role !== selectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Unauthorized. This login is for ${activeRole.label}s only.`);
      }

      navigate(`/${selectedRole}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] space-y-8"
      >
        {/* ── Brand ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
            <span className="text-2xl font-black tracking-tight text-primary-foreground">SP</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SkillProject</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Academic Project Allocation &amp; Management
            </p>
          </div>
        </div>

        {/* ── Role pills ── */}
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/60 p-1.5">
          {roles.map((r) => {
            const RIcon = r.icon;
            const active = selectedRole === r.key;
            return (
              <button
                key={r.key}
                onClick={() => {
                  setSelectedRole(r.key);
                  setError("");
                }}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <RIcon className="h-3.5 w-3.5" />
                {r.label}
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl bg-card shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Card ── */}
        <Card className="overflow-hidden rounded-2xl border-0 bg-card shadow-xl shadow-foreground/5">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mb-6 flex flex-col items-center gap-2 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{activeRole.label} Portal</h2>
                <p className="text-xs leading-relaxed text-muted-foreground">{activeRole.desc}</p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="loginId" className="text-xs font-medium">
                  User ID
                </Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl text-sm font-semibold transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Signing in…" : "Sign In"}
                {!isLoading && <ArrowRight className="ml-auto h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground/50">
          © {new Date().getFullYear()} SkillProject — All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
