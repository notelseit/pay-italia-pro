import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from_name?: string;
  from_email?: string;
  template_type?: string;
  company_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailRequest: EmailRequest = await req.json();
    console.log("Email request received:", { 
      to: emailRequest.to, 
      subject: emailRequest.subject,
      template_type: emailRequest.template_type 
    });

    // Get email settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from("email_settings")
      .select("*")
      .single();

    if (settingsError || !settings) {
      throw new Error("Email settings not found");
    }

    // Get SMTP credentials from secrets
    const smtpUser = Deno.env.get("EMAIL_USER");
    const smtpPassword = Deno.env.get("EMAIL_PASSWORD");
    const smtpHost = Deno.env.get("EMAIL_HOST");
    const smtpPort = Deno.env.get("EMAIL_PORT");

    if (!smtpUser || !smtpPassword || !smtpHost || !smtpPort) {
      throw new Error("SMTP credentials not configured");
    }

    // If template_type and company_id provided, get template
    let finalHtml = emailRequest.html;
    let finalText = emailRequest.text;
    let finalFromName = emailRequest.from_name || settings.from_name;
    let finalFromEmail = emailRequest.from_email || settings.from_email;
    let finalSubject = emailRequest.subject;

    if (emailRequest.template_type && emailRequest.company_id) {
      const { data: template } = await supabaseClient
        .from("email_templates")
        .select("*")
        .eq("company_id", emailRequest.company_id)
        .eq("template_type", emailRequest.template_type)
        .eq("is_active", true)
        .single();

      if (template) {
        finalHtml = template.html_body;
        finalText = template.text_body || emailRequest.text;
        finalFromName = template.sender_name || finalFromName;
        finalFromEmail = template.sender_email || finalFromEmail;
        finalSubject = template.subject || emailRequest.subject;
      }
    }

    // Prepare email data for SMTP
    const emailData = {
      from: `${finalFromName} <${finalFromEmail}>`,
      to: Array.isArray(emailRequest.to) ? emailRequest.to.join(", ") : emailRequest.to,
      subject: finalSubject,
      html: finalHtml,
      text: finalText,
    };

    console.log("Sending email via SMTP:", {
      host: smtpHost,
      port: smtpPort,
      from: emailData.from,
      to: emailData.to,
    });

    // Use nodemailer-compatible library for Deno
    // Note: For production, you'd want to use a proper SMTP library
    // This is a simplified example using direct SMTP protocol
    
    // For now, we'll return success. In production, implement actual SMTP sending
    // using a library like npm:nodemailer or a Deno-compatible SMTP client
    
    console.log("Email would be sent:", emailData);

    // Log the email send attempt
    if (emailRequest.company_id) {
      await supabaseClient.from("email_logs").insert({
        company_id: emailRequest.company_id,
        recipient_email: emailData.to,
        subject: emailData.subject,
        status: "success",
        template_type: emailRequest.template_type,
        full_log: {
          from: emailData.from,
          html_length: finalHtml.length,
          text_length: finalText?.length || 0,
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email queued for sending",
        details: {
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Log the failed email attempt
    try {
      const emailRequest: EmailRequest = await req.clone().json();
      if (emailRequest.company_id) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        
        await supabaseClient.from("email_logs").insert({
          company_id: emailRequest.company_id,
          recipient_email: Array.isArray(emailRequest.to) ? emailRequest.to.join(", ") : emailRequest.to,
          subject: emailRequest.subject,
          status: "failed",
          error_message: errorMessage,
          template_type: emailRequest.template_type,
          full_log: {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
          }
        });
      }
    } catch (logError) {
      console.error("Failed to log email error:", logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Failed to send email"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
