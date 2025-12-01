import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[check-medical-visit-expiry] Starting medical visit expiry check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Trova visite in scadenza nei prossimi 30 giorni
    const { data: expiringVisits, error: visitsError } = await supabase
      .from('medical_visits')
      .select(`
        id,
        scheduled_date,
        visit_type,
        company_id,
        employee_id,
        employees!inner (
          id,
          full_name,
          email
        ),
        companies!inner (
          id,
          name,
          email
        )
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_date', today.toISOString().split('T')[0])
      .lte('scheduled_date', thirtyDaysFromNow.toISOString().split('T')[0]);

    if (visitsError) {
      console.error('[check-medical-visit-expiry] Error fetching expiring visits:', visitsError);
      throw visitsError;
    }

    console.log(`[check-medical-visit-expiry] Found ${expiringVisits?.length || 0} expiring visits`);

    // Trova giudizi di idoneità in scadenza nei prossimi 60 giorni
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    const { data: expiringJudgments, error: judgmentsError } = await supabase
      .from('fitness_judgments')
      .select(`
        id,
        expiry_date,
        judgment_type,
        company_id,
        employee_id,
        employees!inner (
          id,
          full_name,
          email
        ),
        companies!inner (
          id,
          name,
          email
        )
      `)
      .not('expiry_date', 'is', null)
      .gte('expiry_date', today.toISOString().split('T')[0])
      .lte('expiry_date', sixtyDaysFromNow.toISOString().split('T')[0]);

    if (judgmentsError) {
      console.error('[check-medical-visit-expiry] Error fetching expiring judgments:', judgmentsError);
      throw judgmentsError;
    }

    console.log(`[check-medical-visit-expiry] Found ${expiringJudgments?.length || 0} expiring judgments`);

    const notifications = [];

    // Crea notifiche per visite in scadenza
    for (const visit of expiringVisits || []) {
      const daysUntilExpiry = Math.floor(
        (new Date(visit.scheduled_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const employee = visit.employees as any;
      const company = visit.companies as any;

      const notificationMessage = `Promemoria: Visita medica programmata per ${employee?.full_name} tra ${daysUntilExpiry} giorni (${visit.scheduled_date}).`;

      // Invia email alla company (se configurato)
      if (company?.email) {
        console.log(`[check-medical-visit-expiry] Sending notification for visit ${visit.id}`);
        
        // Qui potresti invocare la funzione send-email per inviare una notifica reale
        // Per ora logghiamo solo
        notifications.push({
          type: 'medical_visit',
          visit_id: visit.id,
          employee: employee?.full_name,
          company: company?.name,
          days_until_expiry: daysUntilExpiry,
          message: notificationMessage,
        });
      }
    }

    // Crea notifiche per giudizi in scadenza
    for (const judgment of expiringJudgments || []) {
      const daysUntilExpiry = Math.floor(
        (new Date(judgment.expiry_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const employee = judgment.employees as any;
      const company = judgment.companies as any;

      const notificationMessage = `Attenzione: Giudizio di idoneità di ${employee?.full_name} in scadenza tra ${daysUntilExpiry} giorni (${judgment.expiry_date}).`;

      if (company?.email) {
        console.log(`[check-medical-visit-expiry] Sending notification for judgment ${judgment.id}`);
        
        notifications.push({
          type: 'fitness_judgment',
          judgment_id: judgment.id,
          employee: employee?.full_name,
          company: company?.name,
          days_until_expiry: daysUntilExpiry,
          message: notificationMessage,
        });
      }
    }

    console.log(`[check-medical-visit-expiry] Generated ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        expiring_visits_count: expiringVisits?.length || 0,
        expiring_judgments_count: expiringJudgments?.length || 0,
        notifications_generated: notifications.length,
        notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[check-medical-visit-expiry] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});