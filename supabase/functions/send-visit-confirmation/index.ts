import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const confirmationUrl = `${supabaseUrl.replace('https://cmuexgntkizquulskuzd.supabase.co', 'https://pay-italia-pro.lovable.app')}/functions/v1/confirm-visit?token=${confirmationToken}`;

    // Prepare email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
...
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sorveglianza Sanitaria <onboarding@resend.dev>",
        to: [visit.employees.email],
        subject: `Conferma Visita Medica - ${visitDate}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send confirmation email:", emailResult);
      throw new Error("Failed to send confirmation email");
    }

    // Update confirmation record
    await supabase
      .from("visit_confirmations")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("confirmation_token", confirmationToken);

    console.log("Confirmation email sent:", emailResult.id);

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
