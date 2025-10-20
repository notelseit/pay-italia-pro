import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    // Check if user is superadmin
    const { data: isSuperAdmin, error: rpcError } = await supabaseClient
      .rpc('is_superadmin', { _user_id: user.id });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw new Error('Failed to verify superadmin status');
    }

    if (!isSuperAdmin) {
      throw new Error('Only superadmins can delete companies');
    }

    const { companyId } = await req.json();
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    console.log('Deleting company:', companyId);

    // Delete all documents from storage for this company
    const { data: documents } = await supabaseClient
      .from('documents')
      .select('file_path')
      .eq('company_id', companyId);

    if (documents && documents.length > 0) {
      console.log('Deleting', documents.length, 'documents from storage');
      
      // Extract file paths from documents bucket
      const filePaths = documents.map(doc => doc.file_path.replace('documents/', ''));
      
      // Delete files from storage bucket
      const { error: storageError } = await supabaseClient
        .storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // Continue anyway - we still want to delete the company
      }
    }

    // Delete the company (cascades to related tables)
    const { error: deleteError } = await supabaseClient
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (deleteError) {
      console.error('Error deleting company:', deleteError);
      throw deleteError;
    }

    console.log('Company deleted successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Company and all related data deleted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Delete company error:', error);
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
