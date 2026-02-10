import { supabase } from "@/integrations/supabase/client";

/**
 * Tipi di eventi di dominio tracciati dal sistema.
 * Complementare all'audit log: l'audit registra "chi ha fatto cosa",
 * gli eventi di dominio registrano "cosa è successo" in formato strutturato.
 */
export type DomainEventType =
  | "presence_validated"
  | "payroll_created"
  | "payroll_confirmed"
  | "payroll_paid"
  | "payroll_sent";

export type DomainEntityType = "payroll" | "presence";

export interface EmitEventParams {
  eventType: DomainEventType;
  entityType: DomainEntityType;
  entityId: string;
  companyId: string;
  payload?: Record<string, unknown>;
}

/**
 * Emette un evento di dominio nella tabella `domain_events`.
 * Fire-and-forget: non blocca il flusso principale e gestisce gli errori silenziosamente.
 * Recupera automaticamente lo user_id dall'utente autenticato corrente.
 */
export async function emitEvent(params: EmitEventParams): Promise<void> {
  try {
    const { eventType, entityType, entityId, companyId, payload } = params;

    const { data: { user } } = await supabase.auth.getUser();

    supabase
      .from("domain_events")
      .insert([{
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        company_id: companyId,
        user_id: user?.id ?? null,
        payload: (payload ?? {}) as unknown as Record<string, never>,
      }])
      .then(({ error }) => {
        if (error) {
          console.error("Failed to emit domain event:", error);
        }
      });
  } catch (error) {
    console.error("Failed to initiate domain event:", error);
  }
}
