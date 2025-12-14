import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
  companyId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get identifier for rate limiting
    const authHeader = req.headers.get("Authorization");
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const identifier = authHeader ? authHeader.slice(0, 50) : clientIp;
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 10
    });
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Troppi tentativi. Riprova più tardi.",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            ...corsHeaders 
          },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userId, companyId }: DeleteUserRequest = await req.json();

    if (!userId || !companyId) {
      return new Response(
        JSON.stringify({ error: "userId e companyId sono obbligatori" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the requesting user
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorizzato" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Non autorizzato" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if requesting user is admin in the company
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("company_id", companyId)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Solo gli amministratori possono eliminare gli utenti" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: "Non puoi eliminare il tuo stesso account" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user info for audit log before deletion
    const { data: userToDelete } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, company_id")
      .eq("id", userId)
      .single();

    if (!userToDelete || userToDelete.company_id !== companyId) {
      return new Response(
        JSON.stringify({ error: "Utente non trovato o non appartiene a questa azienda" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete user's roles
    const { error: deleteRolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("company_id", companyId);

    if (deleteRolesError) {
      console.error("Error deleting user roles:", deleteRolesError);
    }

    // Delete the profile
    const { error: deleteProfileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      console.error("Error deleting profile:", deleteProfileError);
    }

    // Delete the user from auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting user from auth:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Impossibile eliminare l'utente." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log audit event
    const auditClientIp = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabaseAdmin.from("audit_logs").insert({
      company_id: companyId,
      user_id: requestingUser.id,
      user_email: requestingUser.email || "unknown",
      action: "user_deleted",
      entity_type: "user",
      entity_id: userId,
      old_value: { email: userToDelete.email, full_name: userToDelete.full_name },
      ip_address: auditClientIp,
      user_agent: userAgent,
    });

    console.log(`User deleted: ${userToDelete.email} by ${requestingUser.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    return new Response(
      JSON.stringify({ error: "Si è verificato un errore. Riprova più tardi." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
