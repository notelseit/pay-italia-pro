import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Errore Conferma</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
              .error { color: #d32f2f; font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">⚠️</div>
              <h1>Token Mancante</h1>
              <p>Il link di conferma non è valido. Verifica di aver utilizzato il link completo ricevuto via email.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find confirmation by token
    const { data: confirmation, error: findError } = await supabase
      .from("visit_confirmations")
      .select(`
        *,
        medical_visits!inner(
          scheduled_date,
          visit_type
        ),
        employees!inner(
          full_name
        )
      `)
      .eq("confirmation_token", token)
      .maybeSingle();

    if (findError || !confirmation) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Conferma Non Trovata</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
              .error { color: #d32f2f; font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌</div>
              <h1>Conferma Non Trovata</h1>
              <p>Il link di conferma non è valido o è già stato utilizzato. Contatta l'ufficio risorse umane per assistenza.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Check if already confirmed
    if (confirmation.status === "confirmed") {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Già Confermato</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
              .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
              .icon { color: #ff9800; font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">ℹ️</div>
              <h1>Presenza Già Confermata</h1>
              <p>Hai già confermato la tua presenza per questa visita medica.</p>
              <p><strong>${confirmation.employees.full_name}</strong></p>
              <p>Data visita: ${new Date(confirmation.medical_visits.scheduled_date).toLocaleDateString("it-IT")}</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Update confirmation status
    const { error: updateError } = await supabase
      .from("visit_confirmations")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("confirmation_token", token);

    if (updateError) throw updateError;

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Conferma Avvenuta</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            .success { color: #4caf50; font-size: 64px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; margin: 10px 0; }
            .info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Conferma Avvenuta con Successo!</h1>
            <p><strong>${confirmation.employees.full_name}</strong></p>
            
            <div class="info-box">
              <p><strong>Data visita:</strong><br>${new Date(confirmation.medical_visits.scheduled_date).toLocaleDateString("it-IT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
            
            <p>La tua presenza è stata confermata. Riceverai un promemoria prima della visita.</p>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">
              Puoi chiudere questa pagina.
            </p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error confirming visit:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Errore</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            .error { color: #d32f2f; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌</div>
            <h1>Errore</h1>
            <p>Si è verificato un errore durante la conferma. Riprova più tardi o contatta l'ufficio risorse umane.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  }
};

serve(handler);
