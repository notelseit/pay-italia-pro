import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  visitId: string;
  companyId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visitId, companyId }: ConfirmationRequest = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get visit details with employee info
    const { data: visit, error: visitError } = await supabase
      .from("medical_visits")
      .select(`
        *,
        employees (
          full_name,
          email
        ),
        companies!medical_visits_company_id_fkey (
          name,
          email
        )
      `)
      .eq("id", visitId)
      .single();

    if (visitError || !visit) {
      throw new Error("Visita non trovata");
    }

    // Create or get confirmation record
    const { data: existingConfirmation } = await supabase
      .from("visit_confirmations")
      .select("*")
      .eq("visit_id", visitId)
      .maybeSingle();

    let confirmationToken;
    
    if (existingConfirmation) {
      confirmationToken = existingConfirmation.confirmation_token;
    } else {
      const { data: newConfirmation, error: confirmError } = await supabase
        .from("visit_confirmations")
        .insert({
          visit_id: visitId,
          company_id: companyId,
          employee_id: visit.employee_id,
        })
        .select()
        .single();

      if (confirmError) throw confirmError;
      confirmationToken = newConfirmation.confirmation_token;
    }

    // Format date
    const visitDate = new Date(visit.scheduled_date).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const visitTypes: Record<string, string> = {
      preventiva: "Preventiva",
      periodica: "Periodica",
      cambio_mansione: "Cambio Mansione",
      richiesta_lavoratore: "Su Richiesta del Lavoratore",
      fine_rapporto: "Fine Rapporto",
    };

    const confirmationUrl = `${supabaseUrl.replace('/rest/v1', '')}/confirm-visit?token=${confirmationToken}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Sorveglianza Sanitaria <onboarding@resend.dev>",
      to: [visit.employees.email],
      subject: `Conferma Visita Medica - ${visitDate}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #428bca; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
              .button { display: inline-block; background: #428bca; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #428bca; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Conferma Visita Medica</h1>
              </div>
              <div class="content">
                <p>Gentile <strong>${visit.employees.full_name}</strong>,</p>
                
                <p>è stata programmata una visita medica. Di seguito i dettagli:</p>
                
                <div class="info-box">
                  <p><strong>Tipo Visita:</strong> ${visitTypes[visit.visit_type] || visit.visit_type}</p>
                  <p><strong>Data:</strong> ${visitDate}</p>
                  ${visit.doctor_name ? `<p><strong>Medico:</strong> ${visit.doctor_name}</p>` : ''}
                  ${visit.notes ? `<p><strong>Note:</strong> ${visit.notes}</p>` : ''}
                </div>
                
                <p>Per confermare la tua presenza, clicca sul pulsante qui sotto:</p>
                
                <div style="text-align: center;">
                  <a href="${confirmationUrl}" class="button">Conferma Presenza</a>
                </div>
                
                <p style="font-size: 12px; color: #666;">
                  Se non puoi visualizzare il pulsante, copia e incolla questo link nel tuo browser:<br>
                  <a href="${confirmationUrl}">${confirmationUrl}</a>
                </p>
                
                <p>Ti ricordiamo di presentarti con:</p>
                <ul>
                  <li>Documento di identità valido</li>
                  <li>Eventuali referti medici recenti</li>
                  <li>Questionario anamnestico compilato (se fornito)</li>
                </ul>
                
                <p>Per qualsiasi informazione, contattaci all'indirizzo: ${visit.companies.email}</p>
                
                <p>Cordiali saluti,<br><strong>${visit.companies.name}</strong></p>
              </div>
              <div class="footer">
                <p>Questa è una email automatica, si prega di non rispondere.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Update confirmation record
    await supabase
      .from("visit_confirmations")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("confirmation_token", confirmationToken);

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email di conferma inviata",
        confirmationToken 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
