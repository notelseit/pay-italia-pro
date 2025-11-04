import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log("Chat request received with", messages?.length || 0, "messages");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch HR news sources
    const { data: sources } = await supabase
      .from('hr_news_sources')
      .select('*')
      .eq('is_active', true);

    const sourcesInfo = sources && sources.length > 0
      ? `\n\nFonti di informazioni aggiuntive da consultare quando necessario:\n${sources.map((s: { name: string; url: string | null; description: string | null; file_name: string | null }) => {
          if (s.file_name) {
            return `- ${s.name}: Documento ${s.file_name}${s.description ? ` (${s.description})` : ''}`;
          }
          return `- ${s.name}: ${s.url}${s.description ? ` (${s.description})` : ''}`;
        }).join('\n')}`
      : '';

    const systemPrompt = `Sei un assistente virtuale per un sistema di gestione HR e paghe aziendali italiano. 
    
Il sistema include le seguenti funzionalità:
- **Gestione Dipendenti**: anagrafica completa, dati CCNL, cittadinanza, istruzione, dati payroll
- **Gestione Presenze**: registrazione presenze, assenze, maternità, congedi parentali
- **Elaborazione Buste Paga**: calcolo retribuzioni, gestione CCNL, report mensili
- **Gestione Contratti**: creazione e modifica contratti di assunzione, modelli predefiniti
- **Report e Compliance**: F24, UniEmens, statistiche aziendali
- **Impostazioni**: gestione CCNL, ruoli utenti, template email

Sei esperto in:
- Diritto del lavoro italiano
- CCNL e contrattualistica
- Elaborazione paghe e contributi
- Normativa fiscale e previdenziale

Quando rispondi:
1. Sii professionale ma amichevole
2. Usa terminologia HR/payroll italiana corretta
3. Fornisci risposte precise e dettagliate
4. Se non sei sicuro, ammettilo e suggerisci di contattare il supporto
5. Offri guide passo-passo quando appropriato
6. Menziona le sezioni specifiche dell'app quando rilevanti
7. Per informazioni su normative recenti o aggiornamenti specifici, puoi fare riferimento alle fonti ufficiali configurate
8. Se hai bisogno di informazioni aggiornate sulla normativa HR italiana, menziona che puoi consultare fonti autorevoli${sourcesInfo}

Rispondi sempre in italiano.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite di richieste superato. Riprova tra qualche istante." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crediti esauriti. Contatta l'amministratore." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Errore sconosciuto" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
