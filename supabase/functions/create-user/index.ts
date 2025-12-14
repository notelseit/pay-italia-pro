import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: string;
  companyId: string;
}

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get identifier for rate limiting
    const authHeader = req.headers.get("Authorization");
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const identifier = authHeader ? authHeader.slice(0, 50) : clientIp;
    
    // Check rate limit: 10 requests per minute
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
    
    const { email, password, fullName, role, companyId }: CreateUserRequest = await req.json();

    // Validate required inputs
    if (!email || !password || !fullName || !role || !companyId) {
      return new Response(
        JSON.stringify({ error: "Tutti i campi sono obbligatori" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Email non valida" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate full name
    if (fullName.length < 2 || fullName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Il nome deve essere tra 2 e 100 caratteri" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate role
    const validRoles = ["admin", "hr_manager", "employee", "admin_sub_azienda"];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Ruolo non valido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase admin client
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

    // Verify requesting user is authenticated
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

    // Verify requesting user is admin of the company
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("company_id", companyId)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo gli amministratori possono creare nuovi utenti" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: "Impossibile creare l'utente. L'email potrebbe essere già in uso." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update profile with company_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Impossibile creare il profilo utente." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Assign role to the new user
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        company_id: companyId,
        role: role,
      });

    if (roleInsertError) {
      console.error("Error assigning role:", roleInsertError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Impossibile assegnare il ruolo." }),
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
      action: "user_created",
      entity_type: "user",
      entity_id: newUser.user.id,
      new_value: { email: newUser.user.email, role, full_name: fullName },
      ip_address: auditClientIp,
      user_agent: userAgent,
    });

    console.log(`User created: ${newUser.user.email} with role ${role} by ${requestingUser.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: newUser.user.id, email: newUser.user.email },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ error: "Si è verificato un errore. Riprova più tardi." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
