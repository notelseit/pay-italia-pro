import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SessionRequest {
  action: "create" | "validate" | "revoke" | "list" | "revoke_all";
  sessionToken?: string;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
    deviceName?: string;
  };
  sessionId?: string;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = checkRateLimit(clientIp, {
      windowMs: 60 * 1000,
      maxRequests: 30,
    });

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Troppi tentativi" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorizzato" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Non autorizzato" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, sessionToken, deviceInfo, sessionId }: SessionRequest = await req.json();

    switch (action) {
      case "create": {
        const userAgent = req.headers.get("user-agent") || "unknown";
        const ipAddress = clientIp;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Generate a raw token, hash it before storing
        const rawToken = sessionToken || crypto.randomUUID();
        const tokenHash = await hashToken(rawToken);

        const { data: session, error: sessionError } = await supabaseAdmin
          .from("user_sessions")
          .insert({
            user_id: user.id,
            session_token_hash: tokenHash,
            device_info: deviceInfo || {},
            ip_address: ipAddress,
            user_agent: userAgent,
            expires_at: expiresAt.toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (sessionError) {
          console.error("Session creation error:", sessionError);
          return new Response(
            JSON.stringify({ error: "Errore del server" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Return the raw token to the client (not the hash)
        return new Response(
          JSON.stringify({ success: true, session: { ...session, sessionToken: rawToken } }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "validate": {
        if (!sessionToken) {
          return new Response(
            JSON.stringify({ error: "Token sessione richiesto" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash the incoming token to compare
        const tokenHash = await hashToken(sessionToken);

        const { data: session, error: validateError } = await supabaseAdmin
          .from("user_sessions")
          .select("*")
          .eq("session_token_hash", tokenHash)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (validateError || !session) {
          return new Response(
            JSON.stringify({ valid: false, error: "Sessione non valida o scaduta" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update last activity using the hashed token
        await supabaseAdmin.rpc("update_session_activity", {
          p_session_token: tokenHash,
        });

        return new Response(
          JSON.stringify({ valid: true, session }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "ID sessione richiesto" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: revokeError } = await supabaseAdmin
          .from("user_sessions")
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
            revoked_reason: "Revocata dall'utente",
          })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (revokeError) {
          console.error("Session revoke error:", revokeError);
          return new Response(
            JSON.stringify({ error: "Errore del server" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke_all": {
        // Hash current token to exclude it
        const currentTokenHash = sessionToken ? await hashToken(sessionToken) : "";

        const { error: revokeAllError } = await supabaseAdmin
          .from("user_sessions")
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
            revoked_reason: "Revocate tutte le sessioni dall'utente",
          })
          .eq("user_id", user.id)
          .neq("session_token_hash", currentTokenHash);

        if (revokeAllError) {
          console.error("Revoke all sessions error:", revokeAllError);
          return new Response(
            JSON.stringify({ error: "Errore del server" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        const { data: sessions, error: listError } = await supabaseAdmin
          .from("user_sessions")
          .select("id, device_info, ip_address, user_agent, is_active, last_activity_at, created_at, expires_at")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("last_activity_at", { ascending: false });

        if (listError) {
          console.error("List sessions error:", listError);
          return new Response(
            JSON.stringify({ error: "Errore del server" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ sessions }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Azione non valida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("Session manager error:", error);
    return new Response(
      JSON.stringify({ error: "Errore del server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
