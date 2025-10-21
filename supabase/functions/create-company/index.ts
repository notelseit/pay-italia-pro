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

    // Check if user is superadmin or admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role, company_id')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(r => r.role === 'superadmin');
    const isAdmin = userRoles?.some(r => r.role === 'admin');
    
    if (!isSuperAdmin && !isAdmin) {
      throw new Error('Only superadmins and admins can create companies');
    }

    // Get the user's company_id if they are admin (for parent_company_id)
    const adminCompanyId = isAdmin && !isSuperAdmin 
      ? userRoles?.find(r => r.role === 'admin')?.company_id 
      : null;

    const { adminEmail, adminPassword, adminFullName, companyName, companyEmail } = await req.json();
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

    // Update profile for the new user (profile was created by trigger)
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: adminFullName,
        company_id: company.id,
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
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
