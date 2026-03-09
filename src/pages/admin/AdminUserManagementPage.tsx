import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  UserPlus, Search, Shield, BookOpen, GraduationCap, ToggleLeft, ToggleRight,
  KeyRound, Trash2, Loader2, AlertTriangle, Users, Upload, Download, FileSpreadsheet,
} from "lucide-react";

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  loginId: string;
  createdAt: string;
}

interface ExcelRow {
  name: string;
  email: string;
  login_id: string;
  password: string;
  role: string;
  team_name: string;
  guide_login_id: string;
}

async function adminAction(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Session expired. Please log in again.");
  }
  const res = await supabase.functions.invoke("admin-manage-users", {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (res.error) {
    // Try to extract message from FunctionsHttpError
    let msg = res.error.message || "Edge function error";
    try {
      const ctx = await (res.error as any).context?.json?.();
      if (ctx?.error) msg = ctx.error;
    } catch {}
    throw new Error(msg);
  }
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

const roleIcons: Record<string, React.ElementType> = { admin: Shield, guide: BookOpen, student: GraduationCap };

// Sample data for the template
const TEMPLATE_DATA = [
  { Name: "Dr. Smith", Email: "smith@college.edu", "Login ID": "GDE001", Password: "Temp@123", Role: "guide", "Team Name": "", "Guide Login ID": "" },
  { Name: "Dr. Patel", Email: "patel@college.edu", "Login ID": "GDE002", Password: "Temp@123", Role: "guide", "Team Name": "", "Guide Login ID": "" },
  { Name: "Alice Johnson", Email: "alice@college.edu", "Login ID": "STU001", Password: "Temp@123", Role: "student", "Team Name": "Team Alpha", "Guide Login ID": "GDE001" },
  { Name: "Bob Kumar", Email: "bob@college.edu", "Login ID": "STU002", Password: "Temp@123", Role: "student", "Team Name": "Team Alpha", "Guide Login ID": "GDE001" },
  { Name: "Carol Lee", Email: "carol@college.edu", "Login ID": "STU003", Password: "Temp@123", Role: "student", "Team Name": "Team Beta", "Guide Login ID": "GDE002" },
  { Name: "David Chen", Email: "david@college.edu", "Login ID": "STU004", Password: "Temp@123", Role: "student", "Team Name": "Team Beta", "Guide Login ID": "GDE002" },
];

function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_DATA);
  // Set column widths
  ws["!cols"] = [
    { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, "user_import_template.xlsx");
}

export default function AdminUserManagementPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<ManagedUser | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ExcelRow[]>([]);
  const [importResults, setImportResults] = useState<{ users?: any[]; teams?: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLoginId, setNewLoginId] = useState("");
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
    mutationFn: () => adminAction({ action: "create_user", email: newEmail, password: newPassword, name: newName, role: newRole, login_id: newLoginId }),
    onSuccess: () => {
      toast.success("User created successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setCreateOpen(false);
      setNewName(""); setNewEmail(""); setNewLoginId(""); setNewPassword(""); setNewRole("student"); setFormError("");
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

  const bulkImport = useMutation({
    mutationFn: (rows: ExcelRow[]) => adminAction({ action: "bulk_import", rows }),
    onSuccess: (data) => {
      const createdCount = (data.users || []).filter((r: any) => r.status === "created").length;
      const teamCount = (data.teams || []).filter((r: any) => r.status === "created").length;
      toast.success(`Imported ${createdCount} users and ${teamCount} teams`);
      setImportResults(data);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["guides"] });
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const mapped: ExcelRow[] = json.map((row) => ({
          name: (row["Name"] || "").trim(),
          email: (row["Email"] || "").trim(),
          login_id: (row["Login ID"] || "").trim(),
          password: (row["Password"] || "").trim(),
          role: (row["Role"] || "").trim().toLowerCase(),
          team_name: (row["Team Name"] || "").trim(),
          guide_login_id: (row["Guide Login ID"] || "").trim(),
        }));
        setParsedRows(mapped.filter(r => r.name && r.email));
        setImportResults(null);
      } catch {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  const filtered = (users || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.loginId || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Create, manage, and control all user accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk Import Button */}
          <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) { setParsedRows([]); setImportResults(null); } }}>
            <DialogTrigger asChild>
              <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Bulk Import</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader><DialogTitle>Bulk Import Users from Excel</DialogTitle></DialogHeader>
              <ScrollArea className="max-h-[75vh] pr-2">
              <div className="space-y-4">
                {/* Step 1: Upload prominently at the top */}
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-primary/5">
                  <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-semibold mb-1">Upload Your Excel File</p>
                  <p className="text-xs text-muted-foreground mb-3">Supported formats: .xlsx, .xls, .csv</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={() => fileInputRef.current?.click()} size="lg">
                      <Upload className="mr-2 h-4 w-4" /> Choose File & Upload
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="mr-2 h-3 w-3" /> Download Template
                    </Button>
                  </div>
                  {parsedRows.length > 0 && !importResults && (
                    <p className="text-sm text-green-600 font-medium mt-3">✓ {parsedRows.length} rows parsed successfully from file</p>
                  )}
                </div>

                {/* Instructions */}
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertDescription>
                    Download the template, fill in user details, then upload. Guides are created first, then students are grouped into teams and assigned to guides automatically.
                  </AlertDescription>
                </Alert>

                {/* Template Preview */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Excel Format (Template Preview)</Label>
                  <ScrollArea className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-bold">Name</TableHead>
                          <TableHead className="text-xs font-bold">Email</TableHead>
                          <TableHead className="text-xs font-bold">Login ID</TableHead>
                          <TableHead className="text-xs font-bold">Password</TableHead>
                          <TableHead className="text-xs font-bold">Role</TableHead>
                          <TableHead className="text-xs font-bold">Team Name</TableHead>
                          <TableHead className="text-xs font-bold">Guide Login ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {TEMPLATE_DATA.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs">{row.Name}</TableCell>
                            <TableCell className="text-xs">{row.Email}</TableCell>
                            <TableCell className="text-xs font-mono">{row["Login ID"]}</TableCell>
                            <TableCell className="text-xs">{row.Password}</TableCell>
                            <TableCell className="text-xs"><Badge variant={row.Role === "guide" ? "secondary" : "default"} className="text-[10px]">{row.Role}</Badge></TableCell>
                            <TableCell className="text-xs">{row["Team Name"] || "—"}</TableCell>
                            <TableCell className="text-xs font-mono">{row["Guide Login ID"] || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    • Guides: Leave "Team Name" & "Guide Login ID" empty. • Students: Set "Team Name" to group into teams. Same team name = same team. • "Guide Login ID" links that team to a guide.
                  </p>
                </div>

                {/* Parsed Preview & Import Button */}
                {parsedRows.length > 0 && !importResults && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Parsed Data Preview ({parsedRows.length} users)</Label>
                    <ScrollArea className="border rounded-md max-h-60">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">#</TableHead>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Login ID</TableHead>
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Team</TableHead>
                            <TableHead className="text-xs">Guide ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedRows.map((row, i) => {
                            const missing = !row.name || !row.email || !row.login_id || !row.password || !row.role;
                            return (
                              <TableRow key={i} className={missing ? "bg-destructive/10" : ""}>
                                <TableCell className="text-xs">{i + 1}</TableCell>
                                <TableCell className="text-xs">{row.name || <span className="text-destructive">Missing</span>}</TableCell>
                                <TableCell className="text-xs">{row.email || <span className="text-destructive">Missing</span>}</TableCell>
                                <TableCell className="text-xs font-mono">{row.login_id || <span className="text-destructive">Missing</span>}</TableCell>
                                <TableCell className="text-xs">
                                  {row.role ? (
                                    <Badge variant={row.role === "guide" ? "secondary" : "default"} className="text-[10px]">{row.role}</Badge>
                                  ) : <span className="text-destructive text-[10px]">Missing</span>}
                                </TableCell>
                                <TableCell className="text-xs">{row.team_name || "—"}</TableCell>
                                <TableCell className="text-xs font-mono">{row.guide_login_id || "—"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    {parsedRows.some(r => !r.name || !r.email || !r.login_id || !r.password || !r.role) && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Some rows have missing required fields (highlighted in red). They will fail during import. Please fix and re-upload.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button className="w-full mt-3" size="lg" onClick={() => bulkImport.mutate(parsedRows)} disabled={bulkImport.isPending}>
                      {bulkImport.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing... Please wait
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import {parsedRows.length} Users Now
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Results */}
                {importResults && (
                  <div className="space-y-3">
                    {/* Summary */}
                    {(() => {
                      const created = (importResults.users || []).filter((r: any) => r.status === "created").length;
                      const skipped = (importResults.users || []).filter((r: any) => r.status === "skipped").length;
                      const errors = (importResults.users || []).filter((r: any) => r.status === "error").length;
                      const teamsCreated = (importResults.teams || []).filter((r: any) => r.status === "created").length;
                      const teamErrors = (importResults.teams || []).filter((r: any) => r.status === "error").length;
                      return (
                        <Alert variant={errors > 0 || teamErrors > 0 ? "destructive" : "default"} className={errors === 0 && teamErrors === 0 ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
                          {errors > 0 || teamErrors > 0 ? <AlertTriangle className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
                          <AlertDescription>
                            <p className="font-semibold">
                              {errors === 0 && teamErrors === 0 ? "✅ Import Completed Successfully!" : "⚠️ Import Completed with Errors"}
                            </p>
                            <p className="text-sm mt-1">
                              Users — Created: <strong>{created}</strong>
                              {skipped > 0 && <>, Skipped: <strong>{skipped}</strong></>}
                              {errors > 0 && <>, <span className="text-destructive">Errors: <strong>{errors}</strong></span></>}
                              {(teamsCreated > 0 || teamErrors > 0) && (
                                <> | Teams — Created: <strong>{teamsCreated}</strong>
                                {teamErrors > 0 && <>, <span className="text-destructive">Errors: <strong>{teamErrors}</strong></span></>}
                                </>
                              )}
                            </p>
                            {errors > 0 && (
                              <p className="text-xs mt-1 text-destructive">Fix the errors below, then re-upload the corrected file.</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      );
                    })()}

                    <Label className="text-sm font-semibold block">Detailed Results</Label>
                    <ScrollArea className="border rounded-md max-h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Login ID / Team</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(importResults.users || []).map((r: any, i: number) => (
                            <TableRow key={i} className={r.status === "error" ? "bg-destructive/10" : r.status === "created" ? "bg-green-50 dark:bg-green-950/10" : ""}>
                              <TableCell className="text-xs font-mono">{r.login_id}</TableCell>
                              <TableCell className="text-xs">
                                <Badge variant={r.status === "created" ? "default" : r.status === "skipped" ? "secondary" : "destructive"} className="text-[10px]">
                                  {r.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{r.error || "✓ Created successfully"}</TableCell>
                            </TableRow>
                          ))}
                          {(importResults.teams || []).map((r: any, i: number) => (
                            <TableRow key={`t-${i}`} className={r.status === "error" ? "bg-destructive/10" : "bg-green-50 dark:bg-green-950/10"}>
                              <TableCell className="text-xs font-mono">Team: {r.team}</TableCell>
                              <TableCell className="text-xs">
                                <Badge variant={r.status === "created" ? "default" : "destructive"} className="text-[10px]">{r.status}</Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{r.error || "✓ Team created"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    <Button variant="outline" className="w-full" onClick={() => { setParsedRows([]); setImportResults(null); }}>
                      Upload Another File
                    </Button>
                  </div>
                )}
              </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Create Single User */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="mr-2 h-4 w-4" /> Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createUser.mutate(); }} className="space-y-4">
                {formError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
                <div className="space-y-2"><Label>Full Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Login ID</Label><Input placeholder="e.g. STU001, GDE001" value={newLoginId} onChange={e => setNewLoginId(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Temporary Password</Label><PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} /></div>
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
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, email, or login ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
                      <p className="text-xs text-muted-foreground">{u.loginId ? `ID: ${u.loginId} · ` : ""}{u.email}</p>
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
            <div className="space-y-2"><Label>New Password</Label><PasswordInput value={resetPw} onChange={e => setResetPw(e.target.value)} required minLength={6} /></div>
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
