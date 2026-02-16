import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  UserPlus, Search, Shield, BookOpen, GraduationCap, ToggleLeft, ToggleRight,
  KeyRound, Trash2, Loader2, AlertTriangle, Users,
} from "lucide-react";

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

async function adminAction(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("admin-manage-users", {
    body,
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

const roleIcons: Record<string, React.ElementType> = { admin: Shield, guide: BookOpen, student: GraduationCap };

export default function AdminUserManagementPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<ManagedUser | null>(null);

  // Create user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [formError, setFormError] = useState("");

  const { data: users, isLoading } = useQuery<ManagedUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await adminAction({ action: "list_users" });
      return result.users || [];
    },
  });

  const createUser = useMutation({
    mutationFn: () => adminAction({ action: "create_user", email: newEmail, password: newPassword, name: newName, role: newRole }),
    onSuccess: () => {
      toast.success("User created successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setCreateOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("student"); setFormError("");
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: (u: ManagedUser) => adminAction({ action: u.isActive ? "deactivate_user" : "activate_user", userId: u.id }),
    onSuccess: () => { toast.success("User status updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => adminAction({ action: "delete_user", userId }),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const [resetPw, setResetPw] = useState("");
  const resetPassword = useMutation({
    mutationFn: () => adminAction({ action: "reset_password", userId: resetOpen!.id, newPassword: resetPw }),
    onSuccess: () => { toast.success("Password reset"); setResetOpen(null); setResetPw(""); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = (users || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Create, manage, and control all user accounts.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createUser.mutate(); }} className="space-y-4">
              {formError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
              <div className="space-y-2"><Label>Full Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Temporary Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createUser.isPending}>
                {createUser.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-center"><Users className="h-12 w-12 text-muted-foreground/40 mb-3" /><p className="font-medium text-muted-foreground">No users found</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const RoleIcon = roleIcons[u.role] || GraduationCap;
            return (
              <Card key={u.id} className="animate-fade-in">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <RoleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{u.name || u.email}</p>
                        <Badge variant={u.isActive ? "default" : "destructive"} className="text-[10px]">{u.isActive ? "Active" : "Inactive"}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{u.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" title={u.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive.mutate(u)}>
                      {u.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" title="Reset Password" onClick={() => setResetOpen(u)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => { if (confirm("Delete this user permanently?")) deleteUser.mutate(u.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reset Password Dialog */}
      <Dialog open={!!resetOpen} onOpenChange={open => !open && setResetOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password for {resetOpen?.name || resetOpen?.email}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); resetPassword.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)} required minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Reset Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
