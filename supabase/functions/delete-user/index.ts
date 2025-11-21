import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string;
  companyId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get identifier for rate limiting
    const authHeader = req.headers.get('Authorization');
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const identifier = authHeader ? authHeader.slice(0, 50) : clientIp;
    
    // Check rate limit: 10 requests per minute
    const rateLimitResult = checkRateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 10
    });
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Troppi tentativi. Riprova più tardi.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000))
          } 
        }
      );
    }
    const supabaseAdmin = Deno.env.get('SUPABASE_URL')
      ? await import('https://esm.sh/@supabase/supabase-js@2.75.1').then((mod) => {
          return mod.createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          )
        })
      : null

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized')
    }

    const { userId, companyId }: DeleteUserRequest = await req.json()

    if (!userId || !companyId) {
      return new Response(
        JSON.stringify({ error: 'userId and companyId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the requesting user from auth header
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user is admin of the company
    const { data: requestingUserRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single()

    if (roleError || requestingUserRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user to delete belongs to the company
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (profileError || userProfile?.company_id !== companyId) {
      console.error('User profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Impossibile eliminare l\'utente. Riprova o contatta l\'assistenza.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete user's roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    // Delete user's profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    // Delete user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Impossibile eliminare l\'utente. Riprova o contatta l\'assistenza.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Si è verificato un errore. Riprova o contatta l\'amministratore.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(handler)
