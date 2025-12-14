import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is superadmin or admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role, company_id')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(r => r.role === 'superadmin');
    const isAdmin = userRoles?.some(r => r.role === 'admin');
    
    if (!isSuperAdmin && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Solo superadmin e admin possono creare aziende' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const adminCompanyId = isAdmin && !isSuperAdmin 
      ? userRoles?.find(r => r.role === 'admin')?.company_id 
      : null;

    const { adminEmail, adminPassword, adminFullName, companyName, companyEmail } = await req.json();

    // Validate inputs
    if (!adminEmail || !adminPassword || !adminFullName || !companyName || !companyEmail) {
      return new Response(
        JSON.stringify({ error: 'Tutti i campi sono obbligatori' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate emails
    if (!validateEmail(adminEmail) || !validateEmail(companyEmail)) {
      return new Response(
        JSON.stringify({ error: 'Email non valida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(adminPassword);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate names
    if (adminFullName.length < 2 || adminFullName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Il nome deve essere tra 2 e 100 caratteri' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (companyName.length < 2 || companyName.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Il nome azienda deve essere tra 2 e 200 caratteri' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Creating company:', companyName, 'with admin:', adminEmail);

    // Create the company first
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .insert({
        name: companyName,
        email: companyEmail,
        created_by: user.id,
        parent_company_id: adminCompanyId,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      return new Response(
        JSON.stringify({ error: 'Impossibile creare l\'azienda.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    console.log('Company created successfully:', company.id);

    // Create the admin user using admin API
    const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
      },
    });

    if (userError) {
      console.error('User creation error:', userError);
      // Rollback company creation if user creation fails
      await supabaseClient.from('companies').delete().eq('id', company.id);
      return new Response(
        JSON.stringify({ error: 'Impossibile creare l\'utente admin. L\'email potrebbe essere già in uso.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    console.log('User created successfully:', newUser.user.id);

    // Update profile for the new user
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: adminFullName,
        company_id: company.id,
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Rollback
      await supabaseClient.from('companies').delete().eq('id', company.id);
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Impossibile creare il profilo.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    console.log('Profile updated successfully');

    // Assign admin role to the new user
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        company_id: company.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Rollback
      await supabaseClient.from('companies').delete().eq('id', company.id);
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Impossibile assegnare il ruolo admin.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    console.log('Admin role assigned successfully');

    // Log audit event
    const auditClientIp = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabaseClient.from("audit_logs").insert({
      company_id: company.id,
      user_id: user.id,
      user_email: user.email || "unknown",
      action: "company_created",
      entity_type: "company",
      entity_id: company.id,
      new_value: { 
        company_name: companyName, 
        company_email: companyEmail,
        admin_email: adminEmail,
        admin_name: adminFullName 
      },
      ip_address: auditClientIp,
      user_agent: userAgent,
    });

    console.log(`Company created: ${companyName} by ${user.email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        company,
        adminUser: { id: newUser.user.id, email: adminEmail }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Create company error:', error);
    return new Response(
      JSON.stringify({ error: 'Si è verificato un errore. Riprova più tardi.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
