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
      // Set must_change_password and login_id
      await adminClient.from("profiles").update({ must_change_password: true, login_id }).eq("user_id", newUser.user!.id);
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
      await adminClient.from("profiles").update({ must_change_password: true }).eq("user_id", userId);
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
