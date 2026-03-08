import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { User, KeyRound, IdCard, Loader2, CheckCircle, AlertTriangle, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function AdminProfilePage() {
  const { user } = useAuth();

  // Fetch profile details
  const { data: profile, refetch } = useQuery({
    queryKey: ["admin-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, email, login_id, bio, avatar, created_at")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Change login ID state
  const [newLoginId, setNewLoginId] = useState("");
  const [loginIdLoading, setLoginIdLoading] = useState(false);
  const [loginIdError, setLoginIdError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeLoginId = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginIdError("");

    if (!newLoginId.trim()) {
      setLoginIdError("Login ID cannot be empty");
      return;
    }
    if (newLoginId.trim() === profile?.login_id) {
      setLoginIdError("New Login ID is the same as current");
      return;
    }

    setLoginIdLoading(true);
    try {
      // Check uniqueness
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("login_id", newLoginId.trim())
        .maybeSingle();
      if (existing) {
        setLoginIdError("This Login ID is already taken");
        setLoginIdLoading(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ login_id: newLoginId.trim() })
        .eq("user_id", user!.id);
      if (error) throw new Error(error.message);

      toast.success("Login ID updated successfully");
      setNewLoginId("");
      refetch();
    } catch (err: unknown) {
      setLoginIdError(err instanceof Error ? err.message : "Failed to update Login ID");
    } finally {
      setLoginIdLoading(false);
    }
  };

  const initials = (profile?.name || "A")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">View your details and manage your credentials.</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              {initials}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 flex-1">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="text-sm font-semibold">{profile?.name || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                <p className="text-sm">{profile?.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><IdCard className="h-3 w-3" /> Login ID (Username)</p>
                <p className="text-sm font-mono">{profile?.login_id || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Shield className="h-3 w-3" /> Role</p>
                <p className="text-sm font-semibold text-primary">Admin</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Created</p>
                <p className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Change Login ID */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IdCard className="h-5 w-5" /> Change Login ID
            </CardTitle>
            <CardDescription>
              Update the username used to sign in. Current: <span className="font-mono font-semibold">{profile?.login_id || "—"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeLoginId} className="space-y-4">
              {loginIdError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{loginIdError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-login-id">New Login ID</Label>
                <Input
                  id="new-login-id"
                  placeholder="Enter new login ID"
                  value={newLoginId}
                  onChange={(e) => setNewLoginId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loginIdLoading} className="w-full">
                {loginIdLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {loginIdLoading ? "Updating…" : "Update Login ID"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5" /> Change Password
            </CardTitle>
            <CardDescription>
              Set a new password for your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="admin-new-pw">New Password</Label>
                <PasswordInput
                  id="admin-new-pw"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-confirm-pw">Confirm Password</Label>
                <PasswordInput
                  id="admin-confirm-pw"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={passwordLoading} className="w-full">
                {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                {passwordLoading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
