import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[check-medical-visit-expiry] Starting medical visit expiry check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ottieni tutte le aziende con configurazioni notifiche
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email')
      .not('email', 'is', null);

    if (companiesError) throw companiesError;

    let totalNotificationsSent = 0;
    let totalVisitsChecked = 0;
    let totalJudgmentsChecked = 0;

    for (const company of companies || []) {
      console.log(`[check-medical-visit-expiry] Processing company: ${company.name}`);

      // Ottieni configurazioni notifiche per questa azienda
      const { data: visitSettings } = await supabase
        .from('notification_settings')
        .select('days_before_expiry, is_active')
        .eq('company_id', company.id)
        .eq('notification_type', 'medical_visit')
        .eq('is_active', true)
        .maybeSingle();

      const { data: judgmentSettings } = await supabase
        .from('notification_settings')
        .select('days_before_expiry, is_active')
        .eq('company_id', company.id)
        .eq('notification_type', 'fitness_judgment')
        .eq('is_active', true)
        .maybeSingle();

      // Processa visite mediche
      if (visitSettings && visitSettings.days_before_expiry) {
        for (const daysBeforeExpiry of visitSettings.days_before_expiry) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + daysBeforeExpiry);

          const { data: expiringVisits, error: visitsError } = await supabase
            .from('medical_visits')
            .select(`
              id,
              scheduled_date,
              visit_type,
              employee_id,
              employees!inner (id, full_name, email)
            `)
            .eq('company_id', company.id)
            .eq('status', 'scheduled')
            .eq('scheduled_date', targetDate.toISOString().split('T')[0]);

          if (visitsError) {
            console.error(`Error fetching visits for ${company.name}:`, visitsError);
            continue;
          }

          totalVisitsChecked += expiringVisits?.length || 0;

          for (const visit of expiringVisits || []) {
            const employee = visit.employees as any;

            // Verifica se notifica già inviata per questa visita con questi giorni
            const { data: existingLog } = await supabase
              .from('notification_logs')
              .select('id')
              .eq('reference_id', visit.id)
              .eq('notification_type', 'medical_visit')
              .eq('days_before_expiry', daysBeforeExpiry)
              .gte('notification_date', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
              .maybeSingle();

            if (existingLog) {
              console.log(`Notification already sent for visit ${visit.id} with ${daysBeforeExpiry} days`);
              continue;
            }

            const visitTypeLabels: Record<string, string> = {
              'preventiva': 'Visita Preventiva',
              'periodica': 'Visita Periodica',
              'cambio_mansione': 'Cambio Mansione',
              'richiesta_lavoratore': 'Su Richiesta del Lavoratore',
              'fine_rapporto': 'Fine Rapporto'
            };
            const visitTypeLabel = visitTypeLabels[visit.visit_type] || visit.visit_type;

            const message = `Promemoria: ${visitTypeLabel} programmata per ${employee?.full_name} tra ${daysBeforeExpiry} giorni (${visit.scheduled_date}).`;

            // Invia email tramite edge function send-email
            try {
              const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  to: company.email,
                  subject: `Promemoria Visita Medica - ${employee?.full_name}`,
                  html: `
                    <h2>Promemoria Visita Medica</h2>
                    <p>${message}</p>
                    <hr>
                    <p><strong>Dettagli:</strong></p>
                    <ul>
                      <li>Dipendente: ${employee?.full_name}</li>
                      <li>Tipo visita: ${visitTypeLabel}</li>
                      <li>Data programmata: ${new Date(visit.scheduled_date).toLocaleDateString('it-IT')}</li>
                      <li>Giorni rimanenti: ${daysBeforeExpiry}</li>
                    </ul>
                  `,
                  companyId: company.id,
                  templateType: 'notification',
                }),
              });

              const emailResult = await emailResponse.json();
              const emailSuccess = emailResponse.ok;

              // Log notifica
              await supabase.from('notification_logs').insert({
                company_id: company.id,
                notification_type: 'medical_visit',
                employee_id: visit.employee_id,
                reference_id: visit.id,
                days_before_expiry: daysBeforeExpiry,
                email_sent: emailSuccess,
                email_recipient: company.email,
                email_status: emailSuccess ? 'sent' : 'failed',
                email_error: emailSuccess ? null : JSON.stringify(emailResult),
                message_content: message,
              });

              if (emailSuccess) {
                totalNotificationsSent++;
                console.log(`Email sent for visit ${visit.id}`);
              } else {
                console.error(`Failed to send email for visit ${visit.id}:`, emailResult);
              }
            } catch (emailError) {
              console.error(`Error sending email for visit ${visit.id}:`, emailError);
              
              await supabase.from('notification_logs').insert({
                company_id: company.id,
                notification_type: 'medical_visit',
                employee_id: visit.employee_id,
                reference_id: visit.id,
                days_before_expiry: daysBeforeExpiry,
                email_sent: false,
                email_recipient: company.email,
                email_status: 'failed',
                email_error: emailError instanceof Error ? emailError.message : String(emailError),
                message_content: message,
              });
            }
          }
        }
      }

      // Processa giudizi di idoneità
      if (judgmentSettings && judgmentSettings.days_before_expiry) {
        for (const daysBeforeExpiry of judgmentSettings.days_before_expiry) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + daysBeforeExpiry);

          const { data: expiringJudgments, error: judgmentsError } = await supabase
            .from('fitness_judgments')
            .select(`
              id,
              expiry_date,
              judgment_type,
              employee_id,
              employees!inner (id, full_name, email)
            `)
            .eq('company_id', company.id)
            .not('expiry_date', 'is', null)
            .eq('expiry_date', targetDate.toISOString().split('T')[0]);

          if (judgmentsError) {
            console.error(`Error fetching judgments for ${company.name}:`, judgmentsError);
            continue;
          }

          totalJudgmentsChecked += expiringJudgments?.length || 0;

          for (const judgment of expiringJudgments || []) {
            const employee = judgment.employees as any;

            // Verifica se notifica già inviata
            const { data: existingLog } = await supabase
              .from('notification_logs')
              .select('id')
              .eq('reference_id', judgment.id)
              .eq('notification_type', 'fitness_judgment')
              .eq('days_before_expiry', daysBeforeExpiry)
              .gte('notification_date', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
              .maybeSingle();

            if (existingLog) {
              console.log(`Notification already sent for judgment ${judgment.id}`);
              continue;
            }

            const message = `Attenzione: Giudizio di idoneità di ${employee?.full_name} in scadenza tra ${daysBeforeExpiry} giorni (${judgment.expiry_date}).`;

            try {
              const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  to: company.email,
                  subject: `Scadenza Giudizio di Idoneità - ${employee?.full_name}`,
                  html: `
                    <h2>Scadenza Giudizio di Idoneità</h2>
                    <p>${message}</p>
                    <hr>
                    <p><strong>Dettagli:</strong></p>
                    <ul>
                      <li>Dipendente: ${employee?.full_name}</li>
                      <li>Tipo giudizio: ${judgment.judgment_type}</li>
                      <li>Data scadenza: ${new Date(judgment.expiry_date).toLocaleDateString('it-IT')}</li>
                      <li>Giorni rimanenti: ${daysBeforeExpiry}</li>
                    </ul>
                  `,
                  companyId: company.id,
                  templateType: 'notification',
                }),
              });

              const emailResult = await emailResponse.json();
              const emailSuccess = emailResponse.ok;

              await supabase.from('notification_logs').insert({
                company_id: company.id,
                notification_type: 'fitness_judgment',
                employee_id: judgment.employee_id,
                reference_id: judgment.id,
                days_before_expiry: daysBeforeExpiry,
                email_sent: emailSuccess,
                email_recipient: company.email,
                email_status: emailSuccess ? 'sent' : 'failed',
                email_error: emailSuccess ? null : JSON.stringify(emailResult),
                message_content: message,
              });

              if (emailSuccess) {
                totalNotificationsSent++;
                console.log(`Email sent for judgment ${judgment.id}`);
              } else {
                console.error(`Failed to send email for judgment ${judgment.id}:`, emailResult);
              }
            } catch (emailError) {
              console.error(`Error sending email for judgment ${judgment.id}:`, emailError);
              
              await supabase.from('notification_logs').insert({
                company_id: company.id,
                notification_type: 'fitness_judgment',
                employee_id: judgment.employee_id,
                reference_id: judgment.id,
                days_before_expiry: daysBeforeExpiry,
                email_sent: false,
                email_recipient: company.email,
                email_status: 'failed',
                email_error: emailError instanceof Error ? emailError.message : String(emailError),
                message_content: message,
              });
            }
          }
        }
      }
    }

    console.log(`[check-medical-visit-expiry] Completed. Total notifications sent: ${totalNotificationsSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        companies_processed: companies?.length || 0,
        visits_checked: totalVisitsChecked,
        judgments_checked: totalJudgmentsChecked,
        notifications_sent: totalNotificationsSent,
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