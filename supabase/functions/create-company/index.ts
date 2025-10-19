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
      throw new Error('Only superadmins can create companies');
    }

    const { adminEmail, adminPassword, adminFullName, companyName, companyEmail } = await req.json();
    console.log('Creating company:', companyName, 'with admin:', adminEmail);

    // Create the company first
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .insert({
        name: companyName,
        email: companyEmail,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw companyError;
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
      throw userError;
    }
    console.log('User created successfully:', newUser.user.id);

    // Create profile for the new user
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: adminFullName,
        email: adminEmail,
        company_id: company.id,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    console.log('Profile created successfully');

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
      throw roleError;
    }
    console.log('Admin role assigned successfully');

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
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
