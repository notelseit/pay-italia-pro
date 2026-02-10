

## Piano: Sistema di Versionamento Immutabile per CCNL, Payroll Settings e Contratti

### Panoramica

Implementare un sistema di versionamento immutabile che garantisce la tracciabilita legale di ogni modifica a CCNL, Payroll Settings e Contratti di lavoro. Ogni salvataggio crea una nuova versione non modificabile; i cedolini referenziano la versione specifica usata al momento del calcolo.

---

### FASE 1: Database - Nuove tabelle e vincoli

Creare 3 tabelle di versionamento con struttura uniforme:

**Tabella `ccnl_versions`**
- `id` (uuid, PK)
- `ccnl_id` (uuid, FK -> ccnl_contracts.id)
- `company_id` (uuid, FK -> companies.id)
- `version_number` (integer, auto-incrementato per ccnl_id)
- `data_json` (jsonb, snapshot completo del contratto CCNL)
- `change_summary` (text, descrizione breve della modifica)
- `is_active` (boolean, default false)
- `created_at` (timestamptz, default now())
- `created_by` (uuid, utente che ha creato la versione)

**Tabella `payroll_settings_versions`**
- Stessa struttura con `payroll_settings_id` come parent_id

**Tabella `contract_versions`**
- Stessa struttura con `contract_id` come parent_id (FK -> employment_contracts.id)

**Colonna aggiuntiva su `payroll_records`**
- `payroll_settings_version_id` (uuid, nullable, FK -> payroll_settings_versions.id)
- `ccnl_version_id` (uuid, nullable, FK -> ccnl_versions.id)

**Funzione DB per auto-incremento version_number**
- Trigger che calcola `MAX(version_number) + 1` per lo stesso parent_id

**Funzione DB per gestione `is_active`**
- Quando una versione viene inserita con `is_active = true`, le precedenti per lo stesso parent_id vengono disattivate

---

### FASE 2: RLS Policies (Immutabilita garantita)

Per ciascuna delle 3 tabelle:

1. **SELECT**: utenti della stessa company_id + superadmin
2. **INSERT**: admin, hr_manager della stessa company_id + superadmin
3. **UPDATE**: NESSUNO (nessuna policy UPDATE = immutabilita)
4. **DELETE**: NESSUNO (nessuna policy DELETE = immutabilita)

L'unica eccezione sara un trigger di database per la gestione del flag `is_active` (eseguito con SECURITY DEFINER), mai dall'utente direttamente.

---

### FASE 3: Logica di versioning integrata negli hook esistenti

**Modifiche a `useCCNLContracts.tsx`**
- Il `updateContract` attuale invece di fare UPDATE diretto, creera una nuova versione:
  1. Inserisce in `ccnl_versions` il JSON completo dei dati modificati
  2. Aggiorna `ccnl_contracts` con i nuovi valori (la tabella master rimane il "riferimento corrente")
- Nuovo metodo `getVersionHistory(ccnlId)` per recuperare tutte le versioni

**Modifiche a `usePayrollSettings.tsx`**
- Il `updateSettings` creera una versione prima di aggiornare
- Nuovo metodo `getVersionHistory(settingsId)`

**Modifiche a `useContracts.tsx`**
- Il `updateContract` creera una versione prima di aggiornare
- Nuovo metodo `getVersionHistory(contractId)`

**Nuovo hook `useVersionHistory.tsx`**
- Hook generico per gestire la cronologia versioni di qualsiasi entita
- Parametri: `entityType` ('ccnl' | 'payroll_settings' | 'contract'), `entityId`
- Restituisce: `versions`, `activeVersion`, `isLoading`

**Modifiche a `usePayroll.tsx`**
- `createPayrollRecord` salvera anche `payroll_settings_version_id` e `ccnl_version_id` nel cedolino, collegando il cedolino alla versione esatta dei parametri usati per il calcolo

---

### FASE 4: Componenti UI

**Nuovo componente `VersionHistoryDialog.tsx`**
- Dialog modale con lista delle versioni in ordine cronologico (piu recente in alto)
- Ogni versione mostra:
  - Numero versione e badge "Attiva" (verde) per la corrente
  - Data creazione e autore
  - Riepilogo modifiche (change_summary)
  - Pulsante "Visualizza dettagli" che apre un pannello read-only con i dati JSON formattati
- Le versioni storiche sono in sola lettura (nessun pulsante di modifica)
- Pulsante "Ripristina come nuova versione" che crea una copia come nuova versione attiva

**Nuovo componente `VersionBadge.tsx`**
- Badge compatto da inserire nelle UI esistenti (es. "v3 - attiva")
- Cliccabile per aprire il VersionHistoryDialog

**Modifiche a `PayrollSettingsDialog.tsx`**
- Aggiungere un VersionBadge nell'header
- Il salvataggio crea una nuova versione (con campo "Descrizione modifica" obbligatorio)

**Modifiche a `CCNLFormDialog.tsx`**
- Aggiungere un VersionBadge nell'header quando si modifica un contratto esistente
- Il salvataggio di modifiche crea una nuova versione

**Modifiche a `ContractFormDialog.tsx`**
- Aggiungere un VersionBadge nell'header in modalita editing
- Il salvataggio di modifiche crea una nuova versione

**Modifiche a `PayrollDetailDialog.tsx`**
- Mostrare la versione dei parametri usata per il calcolo del cedolino
- Link per visualizzare i dettagli della versione

---

### FASE 5: Flusso operativo finale

```text
Utente modifica Payroll Settings
         |
         v
Frontend chiede "Descrizione modifica"
         |
         v
INSERT in payroll_settings_versions (version N+1, is_active=true)
         |
         v
Trigger DB: disattiva versioni precedenti (is_active=false)
         |
         v
UPDATE payroll_settings con nuovi valori
         |
         v
Prossimo cedolino generato -> salva payroll_settings_version_id = versione attiva
```

---

### Riepilogo file da creare/modificare

| Tipo | File | Azione |
|------|------|--------|
| SQL Migration | migration.sql | 3 tabelle, trigger, 2 colonne su payroll_records, 6 RLS policies |
| Hook | `src/hooks/useVersionHistory.tsx` | Nuovo |
| Componente | `src/components/versioning/VersionHistoryDialog.tsx` | Nuovo |
| Componente | `src/components/versioning/VersionBadge.tsx` | Nuovo |
| Componente | `src/components/versioning/VersionDetailView.tsx` | Nuovo |
| Hook | `src/hooks/useCCNLContracts.tsx` | Modifica (aggiungere creazione versione) |
| Hook | `src/hooks/usePayrollSettings.tsx` | Modifica (aggiungere creazione versione) |
| Hook | `src/hooks/useContracts.tsx` | Modifica (aggiungere creazione versione) |
| Hook | `src/hooks/usePayroll.tsx` | Modifica (salvare version_id nel cedolino) |
| Componente | `src/components/payroll/PayrollSettingsDialog.tsx` | Modifica (VersionBadge + campo descrizione) |
| Componente | `src/components/settings/ccnl/CCNLFormDialog.tsx` | Modifica (VersionBadge) |
| Componente | `src/components/contracts/ContractFormDialog.tsx` | Modifica (VersionBadge) |
| Componente | `src/components/payroll/PayrollDetailDialog.tsx` | Modifica (mostrare versione usata) |

