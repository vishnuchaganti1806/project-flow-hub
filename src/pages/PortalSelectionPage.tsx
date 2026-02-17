import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, AlertTriangle, Shield, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/contexts/AuthContext";

const roleConfig: Record<UserRole, {
  label: string;
  icon: React.ElementType;
  description: string;
  accent: string;
  accentBg: string;
  buttonClass: string;
}> = {
  admin: {
    label: "Admin",
    icon: Shield,
    description: "Manage users, assign students to guides, and monitor system activity.",
    accent: "text-[hsl(224,76%,33%)]",
    accentBg: "bg-[hsl(224,76%,33%)]/10",
    buttonClass: "bg-[hsl(224,76%,33%)] hover:bg-[hsl(224,76%,28%)] text-white",
  },
  guide: {
    label: "Guide",
    icon: BookOpen,
    description: "Review project ideas, manage assigned students, and track deadlines.",
    accent: "text-[hsl(174,84%,29%)]",
    accentBg: "bg-[hsl(174,84%,29%)]/10",
    buttonClass: "bg-[hsl(174,84%,29%)] hover:bg-[hsl(174,84%,24%)] text-white",
  },
  student: {
    label: "Student",
    icon: GraduationCap,
    description: "Submit ideas, track progress, and communicate with your assigned guide.",
    accent: "text-[hsl(160,84%,29%)]",
    accentBg: "bg-[hsl(160,84%,29%)]/10",
    buttonClass: "bg-[hsl(160,84%,29%)] hover:bg-[hsl(160,84%,24%)] text-white",
  },
};

const tabAccentMap: Record<UserRole, string> = {
  admin: "shadow-[0_2px_0_hsl(224,76%,33%)]",
  guide: "shadow-[0_2px_0_hsl(174,84%,29%)]",
  student: "shadow-[0_2px_0_hsl(160,84%,29%)]",
};

export default function PortalSelectionPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const config = roleConfig[selectedRole];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Step 1: Look up email from login_id
      const { data: profile, error: lookupErr } = await supabase
        .from("profiles")
        .select("email, user_id")
        .eq("login_id", loginId)
        .maybeSingle();

      if (lookupErr || !profile) {
        throw new Error("Invalid User ID. Please check and try again.");
      }

      // Step 2: Sign in with retrieved email
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (authErr) throw new Error(authErr.message);

      const userId = data.user?.id;
      if (!userId) throw new Error("Login failed");

      // Step 3: Check active status
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_active, must_change_password")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData && !profileData.is_active) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated. Contact your administrator.");
      }

      // Step 4: Validate role matches selected tab
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!roleRow || roleRow.role !== selectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Unauthorized. This login is for ${config.label}s only.`);
      }

      // Step 5: Check forced password change
      if (profileData?.must_change_password) {
        navigate("/change-password", { replace: true });
        return;
      }

      navigate(`/${selectedRole}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg">
            SP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SkillProject</h1>
          <p className="text-sm text-muted-foreground">Academic Project Allocation &amp; Management System</p>
        </div>

        {/* Login Card */}
        <Card className="rounded-2xl shadow-xl border-0 bg-card">
          <CardHeader className="pb-2">
            {/* Role Tabs */}
            <Tabs
              value={selectedRole}
              onValueChange={(v) => {
                setSelectedRole(v as UserRole);
                setError("");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                {(["admin", "guide", "student"] as UserRole[]).map((role) => {
                  const rc = roleConfig[role];
                  const RIcon = rc.icon;
                  const isActive = selectedRole === role;
                  return (
                    <TabsTrigger
                      key={role}
                      value={role}
                      className={`gap-1.5 text-xs font-semibold transition-all data-[state=active]:bg-card ${isActive ? tabAccentMap[role] : ""}`}
                    >
                      <RIcon className="h-3.5 w-3.5" />
                      {rc.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex flex-col items-center gap-2 text-center"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.accentBg}`}>
                  <Icon className={`h-6 w-6 ${config.accent}`} />
                </div>
                <CardTitle className="text-lg">{config.label} Login</CardTitle>
                <CardDescription className="text-xs">{config.description}</CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="loginId">User ID</Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className={`w-full rounded-xl transition-all duration-200 ${config.buttonClass}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} SkillProject. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
