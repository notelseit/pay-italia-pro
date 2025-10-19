import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
      throw new Error("userId e companyId sono obbligatori");
    }

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autenticato");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser } } = await supabaseAdmin.auth.getUser(token);

    if (!requestingUser) {
      throw new Error("Non autenticato");
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
      throw new Error("Solo gli amministratori possono modificare gli utenti");
    }

    // Verify the user being updated belongs to the same company
    const { data: targetUserProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profileError || !targetUserProfile) {
      throw new Error("Utente non trovato");
    }

    if (targetUserProfile.company_id !== companyId) {
      throw new Error("Non puoi modificare utenti di altre aziende");
    }

    // Build update object
    const updateData: any = {};
    
    if (email) {
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nessun dato da aggiornare");
    }

    // Update user using admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error("Error updating user:", updateError);
      throw new Error(updateError.message || "Errore nell'aggiornamento dell'utente");
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

    console.log(`User ${userId} updated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-user function:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
