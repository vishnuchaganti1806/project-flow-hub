import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertTriangle, Shield, BookOpen, GraduationCap } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import type { UserRole } from "@/contexts/AuthContext";

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "bg-red-500/10 text-red-600" },
  guide: { label: "Guide", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
  student: { label: "Student", icon: GraduationCap, color: "bg-green-500/10 text-green-600" },
};

interface Props {
  expectedRole: UserRole;
}

export default function RoleLoginPage({ expectedRole }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const config = roleConfig[expectedRole];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);

      const userId = data.user?.id;
      if (!userId) throw new Error("Login failed");

      // Check if account is active
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active, must_change_password")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated. Contact your administrator.");
      }

      // Validate role matches expected
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!roleRow || roleRow.role !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Unauthorized. This login is for ${config.label}s only.`);
      }

      // Check if must change password
      if (profile?.must_change_password) {
        navigate("/change-password", { replace: true });
        return;
      }

      navigate(`/${expectedRole}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            SP
          </div>
          <h1 className="text-xl font-bold">SkillProject</h1>
          <p className="text-sm text-muted-foreground">Academic Allocation System</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <CardTitle>{config.label} Login</CardTitle>
            <CardDescription>Sign in to your {config.label.toLowerCase()} account</CardDescription>
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
