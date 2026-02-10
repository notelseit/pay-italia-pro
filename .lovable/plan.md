

## Piano: Sistema Eventi di Dominio per Payroll e Presenze

### Panoramica

Creare una tabella `domain_events` e una utility TypeScript `emitEvent()` per tracciare eventi di dominio critici (presence_validated, payroll_created, payroll_confirmed, payroll_paid, payroll_sent). Questo sistema e complementare all'audit log esistente: l'audit log registra "chi ha fatto cosa", gli eventi di dominio registrano "cosa e successo nel sistema" in formato strutturato, pronto per webhook futuri e ricostruzione stato.

---

### FASE 1: Database

**Migrazione SQL**

1. **Creare tabella `domain_events`**:

```
domain_events
  - id: uuid (PK, default gen_random_uuid())
  - event_type: text NOT NULL (es. 'payroll_created', 'presence_validated')
  - entity_type: text NOT NULL (es. 'payroll', 'presence')
  - entity_id: uuid NOT NULL
  - payload: jsonb DEFAULT '{}'
  - company_id: uuid NOT NULL (FK -> companies)
  - user_id: uuid (chi ha scatenato l'evento)
  - created_at: timestamptz DEFAULT now()
```

2. **Indici**:
   - `idx_domain_events_company_created` su `(company_id, created_at DESC)` per query per azienda
   - `idx_domain_events_entity` su `(entity_type, entity_id)` per lookup per entita
   - `idx_domain_events_type` su `(event_type)` per filtraggio per tipo

3. **RLS Policies**:
   - Superadmin: SELECT su tutti gli eventi
   - Admin/HR/Medical Officer: SELECT solo eventi della propria company_id
   - INSERT: consentito a utenti autenticati (la utility controlla i permessi a monte)
   - Nessun UPDATE o DELETE (gli eventi sono immutabili)

4. **Abilitare Realtime** (opzionale, per webhook futuri):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_events;
   ```

---

### FASE 2: Utility TypeScript

**Nuovo file: `src/lib/domainEvents.ts`**

Funzione centralizzata `emitEvent()`:

```
DomainEventType =
  | 'presence_validated'
  | 'payroll_created'
  | 'payroll_confirmed'
  | 'payroll_paid'
  | 'payroll_sent'

EmitEventParams {
  eventType: DomainEventType
  entityType: 'payroll' | 'presence'
  entityId: string
  companyId: string
  payload?: Record<string, unknown>
}
```

- Fire-and-forget (come l'audit logger): inserisce direttamente nella tabella `domain_events` via Supabase client senza bloccare il flusso principale
- Recupera automaticamente lo `user_id` dall'utente autenticato corrente
- Gestione errori silenziosa (console.error, mai throw)
- Tipizzazione stretta per event_type e entity_type

---

### FASE 3: Integrazione nei flussi esistenti

**Modifica: `src/hooks/usePayroll.tsx`**

Aggiungere chiamate `emitEvent()` accanto alle chiamate `logAuditEvent()` esistenti (i due sistemi coesistono):

- `createPayrollRecord.onSuccess` -> `emitEvent({ eventType: 'payroll_created', ... })`
- `confirmPayroll.onSuccess` -> `emitEvent({ eventType: 'payroll_confirmed', ... })`
- `sendPayroll.onSuccess` -> `emitEvent({ eventType: 'payroll_sent', ... })`

Payload tipico: `{ month, year, employee_id, net_salary, gross_total }`

**Modifica: `src/hooks/usePresence.tsx`**

Aggiungere chiamata `emitEvent()` in:

- `validatePresence.onSuccess` -> `emitEvent({ eventType: 'presence_validated', entityType: 'presence', ... })`

Payload tipico: `{ month, year, employee_id, working_days, validated_at }`

Nota: `payroll_paid` viene predisposto come tipo evento ma non integrato immediatamente perche non esiste ancora un flusso "pagamento effettivo" nel sistema. Sara disponibile per integrazioni future.

---

### Riepilogo file

| File | Azione |
|------|--------|
| Migration SQL | Nuovo - tabella `domain_events` + indici + RLS |
| `src/lib/domainEvents.ts` | Nuovo - utility `emitEvent()` |
| `src/hooks/usePayroll.tsx` | Modifica - aggiungere `emitEvent()` in 3 mutation |
| `src/hooks/usePresence.tsx` | Modifica - aggiungere `emitEvent()` in validatePresence |

### Differenze rispetto all'Audit Log

| Aspetto | Audit Log | Domain Events |
|---------|-----------|---------------|
| Scopo | Chi ha fatto cosa | Cosa e successo nel sistema |
| Storage | Edge function -> audit_logs | Insert diretto -> domain_events |
| Mutabilita | Immutabile | Immutabile |
| Payload | old_value / new_value | payload strutturato per evento |
| Uso futuro | Compliance, indagini | Webhook, event sourcing, replay |

Nessuna edge function necessaria. Insert diretto via Supabase client.

