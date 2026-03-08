import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id).maybeSingle();
    if (roleData?.role !== "admin") return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });

    const body = await req.json();
    const { action } = body;

    // CREATE USER
    if (action === "create_user") {
      const { email, password, name, role, login_id } = body;
      if (!email || !password || !name || !role || !login_id) {
        return new Response(JSON.stringify({ error: "Missing fields (email, password, name, role, login_id required)" }), { status: 400, headers: corsHeaders });
      }

      // Check login_id uniqueness
      const { data: existing } = await adminClient.from("profiles").select("id").eq("login_id", login_id).maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ error: "Login ID already exists. Choose a different one." }), { status: 400, headers: corsHeaders });
      }

      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (createErr) return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: corsHeaders });

      // Assign role
      await adminClient.from("user_roles").insert({ user_id: newUser.user!.id, role });
      // Set login_id
      await adminClient.from("profiles").update({ must_change_password: false, login_id }).eq("user_id", newUser.user!.id);
      // Create role-specific record
      if (role === "student") {
        await adminClient.from("students").insert({ user_id: newUser.user!.id });
      } else if (role === "guide") {
        await adminClient.from("guides").insert({ user_id: newUser.user!.id });
      }
      // Log activity
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "create_user", details: `Created ${role}: ${login_id} (${email})` });

      return new Response(JSON.stringify({ success: true, userId: newUser.user!.id }), { headers: corsHeaders });
    }

    // BULK IMPORT
    if (action === "bulk_import") {
      const { rows } = body as { rows: Array<{ name: string; email: string; login_id: string; password: string; role: string; team_name?: string; guide_login_id?: string }> };
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return new Response(JSON.stringify({ error: "No rows provided" }), { status: 400, headers: corsHeaders });
      }

      const results: Array<{ login_id: string; status: string; error?: string }> = [];
      // Map login_id -> user_id for guide assignment
      const loginIdToUserId: Record<string, string> = {};
      // Map team_name -> member user_ids
      const teamMap: Record<string, string[]> = {};
      // Map team_name -> guide_login_id
      const teamGuideMap: Record<string, string> = {};

      // First pass: load existing login_ids to avoid duplicates
      const { data: existingProfiles } = await adminClient.from("profiles").select("login_id, user_id");
      const existingLoginIds = new Set((existingProfiles || []).map(p => p.login_id));
      for (const p of (existingProfiles || [])) {
        if (p.login_id) loginIdToUserId[p.login_id] = p.user_id;
      }

      // Sort rows: guides first so they exist before team assignment
      const sorted = [...rows].sort((a, b) => {
        if (a.role === "guide" && b.role !== "guide") return -1;
        if (a.role !== "guide" && b.role === "guide") return 1;
        return 0;
      });

      for (const row of sorted) {
        const { name, email, login_id, password, role, team_name, guide_login_id } = row;
        if (!name || !email || !login_id || !password || !role) {
          results.push({ login_id: login_id || "?", status: "error", error: "Missing required fields" });
          continue;
        }
        if (!["student", "guide"].includes(role)) {
          results.push({ login_id, status: "error", error: "Role must be student or guide" });
          continue;
        }
        if (existingLoginIds.has(login_id)) {
          results.push({ login_id, status: "skipped", error: "Login ID already exists" });
          // Still map it for team purposes
          continue;
        }

        try {
          const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name },
          });
          if (createErr) {
            results.push({ login_id, status: "error", error: createErr.message });
            continue;
          }

          const userId = newUser.user!.id;
          await adminClient.from("user_roles").insert({ user_id: userId, role });
          await adminClient.from("profiles").update({ must_change_password: false, login_id }).eq("user_id", userId);

          if (role === "student") {
            await adminClient.from("students").insert({ user_id: userId });
          } else if (role === "guide") {
            await adminClient.from("guides").insert({ user_id: userId });
          }

          loginIdToUserId[login_id] = userId;
          existingLoginIds.add(login_id);
          results.push({ login_id, status: "created" });

          // Track team membership for students
          if (role === "student" && team_name && team_name.trim()) {
            const tn = team_name.trim();
            if (!teamMap[tn]) teamMap[tn] = [];
            teamMap[tn].push(userId);
            if (guide_login_id && guide_login_id.trim()) {
              teamGuideMap[tn] = guide_login_id.trim();
            }
          }
        } catch (e) {
          results.push({ login_id, status: "error", error: String(e) });
        }
      }

      // Create teams
      const teamResults: Array<{ team: string; status: string; error?: string }> = [];
      for (const [teamName, memberIds] of Object.entries(teamMap)) {
        try {
          const guideLoginId = teamGuideMap[teamName];
          const guideUserId = guideLoginId ? loginIdToUserId[guideLoginId] || null : null;

          const { data: team, error: teamErr } = await adminClient.from("teams").insert({
            name: teamName,
            members: memberIds,
            guide_id: guideUserId,
          }).select().single();

          if (teamErr) {
            teamResults.push({ team: teamName, status: "error", error: teamErr.message });
            continue;
          }

          // Update students with team_id and guide_id
          for (const mid of memberIds) {
            await adminClient.from("students").update({
              team_id: team.id,
              guide_id: guideUserId,
            }).eq("user_id", mid);
          }

          teamResults.push({ team: teamName, status: "created" });
        } catch (e) {
          teamResults.push({ team: teamName, status: "error", error: String(e) });
        }
      }

      await adminClient.from("activity_logs").insert({
        user_id: caller.id,
        action: "bulk_import",
        details: `Bulk imported ${results.filter(r => r.status === "created").length} users, ${teamResults.filter(r => r.status === "created").length} teams`,
      });

      return new Response(JSON.stringify({ success: true, users: results, teams: teamResults }), { headers: corsHeaders });
    }

    // DEACTIVATE USER
    if (action === "deactivate_user") {
      const { userId } = body;
      await adminClient.from("profiles").update({ is_active: false }).eq("user_id", userId);
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "deactivate_user", details: `Deactivated user ${userId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // ACTIVATE USER
    if (action === "activate_user") {
      const { userId } = body;
      await adminClient.from("profiles").update({ is_active: true }).eq("user_id", userId);
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "activate_user", details: `Activated user ${userId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // RESET PASSWORD
    if (action === "reset_password") {
      const { userId, newPassword } = body;
      const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
      await adminClient.from("profiles").update({ must_change_password: false }).eq("user_id", userId);
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "reset_password", details: `Reset password for ${userId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // DELETE USER
    if (action === "delete_user") {
      const { userId } = body;
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "delete_user", details: `Deleted user ${userId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // ASSIGN STUDENT TO GUIDE
    if (action === "assign_student") {
      const { studentId, guideId } = body;
      await adminClient.from("students").update({ guide_id: guideId }).eq("id", studentId);
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "assign_student", details: `Assigned student ${studentId} to guide ${guideId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // UNASSIGN STUDENT
    if (action === "unassign_student") {
      const { studentId } = body;
      await adminClient.from("students").update({ guide_id: null }).eq("id", studentId);
      await adminClient.from("activity_logs").insert({ user_id: caller.id, action: "unassign_student", details: `Unassigned student ${studentId}` });
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // LIST ALL USERS (admin)
    if (action === "list_users") {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });

      const enriched = await Promise.all(users.map(async (u) => {
        const { data: profile } = await adminClient.from("profiles").select("name, is_active, must_change_password, login_id").eq("user_id", u.id).maybeSingle();
        const { data: roleRow } = await adminClient.from("user_roles").select("role").eq("user_id", u.id).maybeSingle();
        return {
          id: u.id,
          email: u.email,
          name: profile?.name || "",
          role: roleRow?.role || "student",
          isActive: profile?.is_active ?? true,
          mustChangePassword: profile?.must_change_password ?? false,
          loginId: profile?.login_id || "",
          createdAt: u.created_at,
        };
      }));
      return new Response(JSON.stringify({ users: enriched }), { headers: corsHeaders });
    }

    // GET ACTIVITY LOGS
    if (action === "get_activity_logs") {
      const { data, error } = await adminClient.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
      return new Response(JSON.stringify({ logs: data }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
