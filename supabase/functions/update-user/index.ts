import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Strong password validation
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "La password deve essere di almeno 8 caratteri" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "La password deve contenere almeno una lettera maiuscola" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "La password deve contenere almeno una lettera minuscola" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "La password deve contenere almeno un numero" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) {
    return { valid: false, message: "La password deve contenere almeno un carattere speciale" };
  }
  return { valid: true };
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { userId, email, password, companyId } = await req.json();

    if (!userId || !companyId) {
      return new Response(
        JSON.stringify({ error: "userId e companyId sono obbligatori" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email if provided
    if (email && !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Email non valida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password if provided
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return new Response(
          JSON.stringify({ error: passwordValidation.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autenticato" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser } } = await supabaseAdmin.auth.getUser(token);

    if (!requestingUser) {
      return new Response(
        JSON.stringify({ error: "Non autenticato" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        JSON.stringify({ error: "Solo gli amministratori possono modificare gli utenti" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info before update for audit log
    const { data: userBeforeUpdate } = await supabaseAdmin
      .from("profiles")
      .select("email, company_id")
      .eq("id", userId)
      .single();

    if (!userBeforeUpdate) {
      return new Response(
        JSON.stringify({ error: "Utente non trovato" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userBeforeUpdate.company_id !== companyId) {
      return new Response(
        JSON.stringify({ error: "Non puoi modificare utenti di altre aziende" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build update object
    const updateData: Record<string, string> = {};
    
    if (email) {
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "Nessun dato da aggiornare" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user using admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error("Error updating user:", updateError);
      return new Response(
        JSON.stringify({ error: "Impossibile aggiornare l'utente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If email was changed, update the profile table too
    if (email) {
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({ email })
        .eq("id", userId);

      if (profileUpdateError) {
        console.error("Error updating profile email:", profileUpdateError);
      }
    }

    // Log audit event
    const auditClientIp = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabaseAdmin.from("audit_logs").insert({
      company_id: companyId,
      user_id: requestingUser.id,
      user_email: requestingUser.email || "unknown",
      action: "user_updated",
      entity_type: "user",
      entity_id: userId,
      old_value: { email: userBeforeUpdate.email },
      new_value: { 
        email: email || userBeforeUpdate.email,
        password_changed: !!password 
      },
      ip_address: auditClientIp,
      user_agent: userAgent,
    });

    console.log(`User ${userId} updated by ${requestingUser.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-user function:", error);
    return new Response(
      JSON.stringify({ error: "Si è verificato un errore. Riprova più tardi." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
