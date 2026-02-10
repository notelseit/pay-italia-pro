

## Piano: Timeline Sanitaria Unificata per Dipendente

### Panoramica
Creare una timeline cronologica che aggrega tutti gli eventi sanitari di un dipendente (cartelle, visite, giudizi, documenti, scadenze future) in un'unica vista filtrata e navigabile.

---

### FASE 1: Funzione RPC nel Database

Creare una funzione PostgreSQL `get_medical_timeline` che esegue una UNION ALL sulle 4 tabelle sanitarie, restituendo un formato uniforme:

```sql
CREATE FUNCTION get_medical_timeline(p_employee_id uuid, p_company_id uuid)
RETURNS TABLE (
  id uuid,
  event_type text,        -- 'record_opened', 'visit_scheduled', 'visit_completed', 'judgment', 'document', 'expiry'
  event_date timestamptz,
  title text,
  description text,
  status text,
  metadata jsonb,
  is_future boolean
)
```

La funzione aggrega:
- `medical_records` -> evento "Apertura cartella sanitaria" (opened_at) e "Chiusura cartella" (closed_at)
- `medical_visits` -> evento per ogni visita (scheduled/completed), con tipo visita nel titolo
- `fitness_judgments` -> evento giudizio + evento scadenza futura (expiry_date)
- `medical_documents` -> evento documento caricato con tipo e nome file

Ordinamento: `event_date DESC`, con eventi futuri (scadenze) evidenziati separatamente.

Sicurezza: la funzione usa `SECURITY DEFINER` con controllo RLS interno (verifica company_id dell'utente).

---

### FASE 2: Hook React

**Nuovo file: `src/hooks/useMedicalTimeline.tsx`**

Hook che:
- Chiama la funzione RPC `get_medical_timeline` via `supabase.rpc()`
- Accetta filtri: `employeeId`, `eventTypes[]`, `dateFrom`, `dateTo`
- Applica filtraggio client-side per tipo evento e periodo
- Restituisce `events`, `futureEvents`, `isLoading`
- Usa React Query con chiave `['medical-timeline', employeeId, filters]`

---

### FASE 3: Componenti UI

**Nuovo file: `src/components/health-surveillance/MedicalTimeline.tsx`**

Componente principale che include:

1. **Barra filtri** in alto:
   - Select multiplo tipo evento (Cartelle, Visite, Giudizi, Documenti, Scadenze)
   - Date picker per periodo (da/a)
   - Pulsante "Reset filtri"

2. **Sezione Scadenze Future** (se presenti):
   - Card con sfondo giallo/warning
   - Lista scadenze ordinate per data piu vicina

3. **Timeline cronologica**:
   - Linea verticale con pallini colorati per tipo:
     - Verde: Cartella sanitaria aperta
     - Blu: Visita medica
     - Viola: Giudizio di idoneita
     - Arancione: Documento caricato
     - Rosso: Scadenza
   - Ogni nodo mostra: data, titolo, descrizione breve, badge tipo
   - Espandibile per dettagli aggiuntivi (metadata JSON formattato)

**Nuovo file: `src/components/health-surveillance/TimelineEvent.tsx`**

Componente singolo evento con:
- Icona e colore in base al tipo
- Badge con label tipo evento
- Formattazione data in italiano
- Sezione dettagli espandibile

---

### FASE 4: Integrazione nella pagina

**Nuovo file: `src/components/health-surveillance/MedicalTimelineDialog.tsx`**

Dialog modale che:
- Riceve `employeeId` e `companyId`
- Mostra nome dipendente nell'header
- Contiene il componente `MedicalTimeline`

**Modifica: `src/pages/HealthSurveillance.tsx`**

Aggiungere:
- Pulsante "Timeline Sanitaria" nelle Azioni Rapide (con icona Clock/History)
- Select dipendente per aprire la timeline
- Integrazione nei punti dove si visualizzano i dipendenti (es. click su cartella -> apri timeline)

---

### Riepilogo file

| File | Azione |
|------|--------|
| Migration SQL | Nuovo - funzione RPC `get_medical_timeline` |
| `src/hooks/useMedicalTimeline.tsx` | Nuovo - hook React |
| `src/components/health-surveillance/MedicalTimeline.tsx` | Nuovo - componente timeline |
| `src/components/health-surveillance/TimelineEvent.tsx` | Nuovo - componente singolo evento |
| `src/components/health-surveillance/MedicalTimelineDialog.tsx` | Nuovo - dialog wrapper |
| `src/pages/HealthSurveillance.tsx` | Modifica - aggiunta pulsante e dialog |

