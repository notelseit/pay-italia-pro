
## Piano: Calendario Mensile Presenze con Gestione Giornaliera

### Panoramica

Sostituire il sistema attuale di inserimento numerico (Giorni Lavorativi, Ferie, Malattia come campi numerici) con un **calendario mensile interattivo** dove ogni giorno del mese puo essere impostato con un tipo specifico (Lavorativo, Ferie, Malattia, Permesso, Festivo, Non Lavorativo). I totali vengono calcolati automaticamente dal calendario. Le tab aggiuntive (Maternita, Altro) e il flusso di validazione restano invariati.

---

### FASE 1: Database - Nuova tabella `presence_daily`

Creare una tabella che memorizza lo stato di ogni singolo giorno:

```text
presence_daily
  - id: uuid (PK)
  - presence_record_id: uuid (FK -> presence_records.id, ON DELETE CASCADE)
  - day_date: date NOT NULL
  - day_type: text NOT NULL (default 'working')
     Valori: 'working', 'vacation', 'sick', 'leave', 'holiday', 'non_working'
  - overtime_hours: numeric DEFAULT 0
  - night_holiday_hours: numeric DEFAULT 0
  - notes: text
  - created_at: timestamptz DEFAULT now()
```

- Indice unico su `(presence_record_id, day_date)` per evitare duplicati
- RLS: stesse policy di `presence_records` (accesso per company via join)

Aggiungere anche una colonna `daily_data` di tipo `jsonb` nella tabella `presence_records` esistente come campo di cache/fallback per i dati giornalieri, cosi i totali possono essere ricalcolati anche senza join.

**Nota**: la tabella `presence_records` mantiene i campi di riepilogo (`working_days`, `vacation_days`, ecc.) che vengono **aggiornati automaticamente** dal frontend quando si salva il calendario. Questo garantisce retrocompatibilita con la tabella riepilogo, export CSV e payroll.

---

### FASE 2: Componente Calendario Mensile

**Nuovo file: `src/components/presence/PresenceCalendar.tsx`**

Componente calendario che mostra una griglia mensile con:

1. **Header**: giorni della settimana (Lun - Dom)
2. **Griglia**: una cella per ogni giorno del mese, posizionata correttamente rispetto al giorno della settimana
3. **Colori per tipo giorno**:
   - Verde: Lavorativo
   - Blu: Ferie
   - Rosso: Malattia
   - Arancione: Permesso
   - Grigio: Festivo
   - Grigio chiaro: Non lavorativo (sabato/domenica)
4. **Click su giorno**: apre un popover o cicla tra i tipi con click singolo
5. **Selezione multipla**: possibilita di selezionare piu giorni e assegnare lo stesso tipo
6. **Auto-inizializzazione**: sabato e domenica vengono pre-impostati come "non_working", i giorni festivi italiani come "holiday", il resto come "working"
7. **Riepilogo automatico** sotto il calendario: conteggio giorni per tipo e ore straordinarie totali

**Nuovo file: `src/components/presence/DayCell.tsx`**

Componente per la singola cella del calendario:
- Mostra numero giorno
- Sfondo colorato in base al tipo
- Icona piccola per tipo (opzionale)
- Click per cambiare tipo (dropdown o cycle)
- Campo ore straordinarie (visibile su hover/click per giorni lavorativi)

---

### FASE 3: Integrazione nel Dialog

**Modifica: `src/components/presence/PresenceDialog.tsx`**

- Aggiungere una nuova tab "Calendario" come **prima tab** (o sostituire "Dati Base")
- La tab Calendario contiene il componente `PresenceCalendar`
- Quando l'utente salva, i dati giornalieri vengono:
  1. Salvati nella tabella `presence_daily`
  2. I totali vengono calcolati e scritti in `presence_records` (working_days, vacation_days, sick_days, other_absences, overtime_hours, night_holiday_hours)
- Le tab "Maternita Obb.", "Maternita Fac." e "Altro" restano invariate

**Modifica: `src/components/presence/tabs/BasicPresenceTab.tsx`**

Sostituire i campi numerici manuali con il componente `PresenceCalendar`. Il select Dipendente resta in cima. Sotto, il calendario. Sotto ancora, il riepilogo automatico calcolato (read-only). Mantenere il toggle "Sabato e Domenica" che ora pre-imposta tutti i sabati/domeniche come non_working o working.

---

### FASE 4: Festivi Italiani

**Nuovo file: `src/lib/italianHolidays.ts`**

Utility che restituisce i giorni festivi italiani per un dato anno:
- 1 Gennaio (Capodanno)
- 6 Gennaio (Epifania)
- Pasquetta (calcolo dinamico)
- 25 Aprile (Liberazione)
- 1 Maggio (Festa del Lavoro)
- 2 Giugno (Repubblica)
- 15 Agosto (Ferragosto)
- 1 Novembre (Tutti i Santi)
- 8 Dicembre (Immacolata)
- 25 Dicembre (Natale)
- 26 Dicembre (Santo Stefano)
- Patrono locale (configurabile)

---

### FASE 5: Hook aggiornato

**Modifica: `src/hooks/usePresence.tsx`**

Aggiungere:
- `saveDailyPresence` mutation: salva/aggiorna i dati giornalieri in `presence_daily` via upsert
- `fetchDailyPresence` query: carica i dati giornalieri per un `presence_record_id`
- Logica di calcolo totali dai dati giornalieri prima del salvataggio in `presence_records`

---

### FASE 6: Pagina Presenze aggiornata

**Modifica: `src/pages/Presence.tsx`**

- Generare il selettore mese/anno in modo dinamico (non hardcoded 2024-2025)
- La tabella riepilogo resta invariata (legge i totali da `presence_records`)
- Il dialog di modifica ora mostra il calendario

---

### Riepilogo file

| File | Azione |
|------|--------|
| Migration SQL | Nuovo - tabella `presence_daily` + indici + RLS |
| `src/lib/italianHolidays.ts` | Nuovo - utility festivi italiani |
| `src/components/presence/PresenceCalendar.tsx` | Nuovo - componente calendario mensile |
| `src/components/presence/DayCell.tsx` | Nuovo - componente cella giorno |
| `src/components/presence/tabs/BasicPresenceTab.tsx` | Modifica - sostituire campi numerici con calendario |
| `src/components/presence/PresenceDialog.tsx` | Modifica - integrare calendario e logica salvataggio |
| `src/hooks/usePresence.tsx` | Modifica - aggiungere CRUD giornaliero + calcolo totali |
| `src/pages/Presence.tsx` | Modifica - selettore mesi dinamico |

### Flusso utente

1. Admin apre Gestione Presenze, seleziona mese/anno
2. Clicca "Nuova Registrazione" o "Modifica" su un dipendente
3. Nel dialog vede il **calendario del mese** con i giorni pre-compilati (lun-ven = lavorativo, sab-dom = non lavorativo, festivi = festivo)
4. Clicca sui singoli giorni per cambiare tipo (Ferie, Malattia, Permesso, ecc.)
5. Per i giorni lavorativi puo inserire ore straordinarie e notturne/festive
6. Il riepilogo in basso si aggiorna in tempo reale
7. Salva: i dati giornalieri vanno in `presence_daily`, i totali calcolati in `presence_records`
8. La tabella riepilogo nella pagina principale mostra i totali come prima
