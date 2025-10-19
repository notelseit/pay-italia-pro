import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      throw new Error('Unauthorized');
    }

    // Check if user is superadmin
    const { data: isSuperAdmin } = await supabaseClient
      .rpc('is_superadmin', { _user_id: user.id });

    if (!isSuperAdmin) {
      throw new Error('Only superadmins can impersonate users');
    }

    const { companyId } = await req.json();

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // Get the admin user for this company
    console.log('Looking for admin user for company:', companyId);
    
    const { data: adminRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('user_id, company_id, role')
      .eq('company_id', companyId)
      .eq('role', 'admin')
      .limit(1)
      .single();

    console.log('Admin role query result:', { adminRole, roleError });

    if (roleError || !adminRole) {
      console.error('Admin role not found. Error:', roleError);
      throw new Error('Admin user not found for this company');
    }

    // Get the profile for this admin user
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', adminRole.user_id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    if (profileError || !profile) {
      console.error('Profile not found for admin user:', adminRole.user_id);
      throw new Error('Admin profile not found');
    }

    // Generate a session token for the admin user
    console.log('Generating magic link for:', profile.email);
    
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
    });

    if (sessionError) {
      console.error('Magic link generation error:', sessionError);
      throw sessionError;
    }

    console.log(`SuperAdmin ${user.email} impersonating admin ${profile.email} for company ${companyId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        redirectUrl: sessionData.properties.action_link,
        adminEmail: profile.email,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Impersonation error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
