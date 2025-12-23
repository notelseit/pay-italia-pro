# PayHub - Documentazione Sviluppo Sistema

## Prompt Iniziale

> "Crea un sistema gestionale HR italiano completo con funzionalità di payroll, gestione dipendenti, sorveglianza sanitaria, contratti CCNL, presenze, e compliance normativa. Il sistema deve supportare multi-tenancy per diverse aziende con ruoli utente differenziati."

---

## 1. Panoramica del Sistema

**Nome**: PayHub - Sistema Gestionale HR  
**Stack Tecnologico**: 
- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- UI Components: Shadcn/UI, Radix UI
- State Management: TanStack React Query
- Backend: Lovable Cloud (Supabase)
- Database: PostgreSQL
- Edge Functions: Deno

**Architettura**: Multi-tenant con isolamento dati per azienda tramite Row Level Security (RLS)

---

## 2. Moduli Implementati

### 2.1 Gestione Aziende

**File**: `src/pages/Companies.tsx`

**Funzionalità**:
- CRUD completo aziende
- Dati anagrafici: nome, P.IVA, indirizzo completo (via, CAP, città, provincia, paese)
- Dati previdenziali: matricola INPS, posizione INAIL, voce tariffa INAIL
- Contatti: email, telefono
- Struttura gerarchica con `parent_company_id`
- Associazione CCNL di default
- Validazione P.IVA italiana (11 cifre)

**Edge Functions correlate**:
- `create-company`: Creazione azienda con admin associato
- `delete-company`: Eliminazione azienda con cleanup dati

---

### 2.2 Gestione Dipendenti

**File**: 
- `src/pages/Employees.tsx`
- `src/components/employees/EmployeeDialog.tsx`
- `src/components/employees/tabs/*.tsx`

**Funzionalità**:

#### Tab Dati Base (`BasicInfoTab.tsx`)
- Nome e cognome
- Email e telefono
- Data di nascita
- Codice fiscale (validazione formato italiano)
- Tipo contratto (indeterminato, determinato, part-time, consulente)
- Data assunzione
- Ore lavorative settimanali

#### Tab CCNL (`CCNLTab.tsx`)
- Associazione contratto CCNL
- Stipendio base
- Tipo dipendente
- Categoria pagamento

#### Tab Cittadinanza (`CitizenshipTab.tsx`)
- Nazionalità
- Stato civile
- Carta d'identità (comune, provincia, date rilascio/scadenza)
- Passaporto (numero, comune, provincia, date)
- Visto (numero, date, URL documento)
- Permesso di soggiorno
- Questura di riferimento

#### Tab Istruzione (`EducationTab.tsx`)
- Titoli di studio multipli
- Nome titolo, tipo, data conseguimento
- Voto/valutazione
- Upload documento

#### Tab Payroll (`PayrollTab.tsx`)
- IBAN (validazione formato italiano IT + 25 caratteri)
- Posizione INPS
- Posizione INAIL
- Fondo pensione
- Numero familiari a carico
- Detrazioni fiscali

**Validazioni** (`src/lib/validationSchemas.ts`):
```typescript
// Codice Fiscale Italiano
/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i

// IBAN Italiano
/^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/i

// Telefono Italiano
/^(\+39)?[\s]?[0-9]{6,12}$/
```

---

### 2.3 Gestione Contratti di Lavoro

**File**:
- `src/pages/Contract.tsx`
- `src/components/contracts/ContractDialog.tsx`
- `src/components/contracts/ContractFormDialog.tsx`

**Funzionalità**:
- Creazione contratti individuali
- Template contratti riutilizzabili
- Campi: nome contratto, tipo, mansione, descrizione
- Date inizio/fine
- Stipendio base e ore settimanali
- Periodo di prova e preavviso
- Luogo di lavoro
- Benefits e clausole aggiuntive

---

### 2.4 Gestione CCNL

**File**:
- `src/components/settings/CCNLManagement.tsx`
- `src/components/settings/ccnl/CCNLFormDialog.tsx`
- `src/components/settings/ccnl/ArrayFieldManager.tsx`
- `src/hooks/useCCNLContracts.tsx`

**Funzionalità**:
- CRUD contratti collettivi nazionali
- Configurazione dettagliata:
  - **Scaglioni salariali**: tabella per livello/categoria
  - **Regole straordinario**: maggiorazioni %, limiti ore
  - **Ferie e malattia**: giorni annuali, regole carenza
  - **Periodi di prova**: per categoria professionale
  - **Entità contrattuali**: enti bilaterali, fondi
  - **Permessi**: tipologie e ore/giorni
  - **Contributi aggiuntivi**: altri oneri
- Flag tredicesima/quattordicesima
- Buoni pasto (importo)
- Ore lavoro settimanali standard

---

### 2.5 Gestione Presenze

**File**:
- `src/pages/Presence.tsx`
- `src/components/presence/PresenceDialog.tsx`
- `src/components/presence/tabs/*.tsx`
- `src/hooks/usePresence.tsx`

**Funzionalità**:

#### Tab Presenze Base (`BasicPresenceTab.tsx`)
- Giorni lavorati
- Giorni ferie
- Giorni malattia
- Altre assenze
- Ore straordinario
- Esclusione weekend

#### Tab Maternità (`MaternityTab.tsx`)
- Giorni maternità obbligatoria
- Codice MA1 (checkbox)

#### Tab Congedo Parentale (`ParentalLeaveTab.tsx`)
- Giorni congedo PG4 (30% retribuzione)
- Giorni congedo PG5 (senza retribuzione)

#### Tab Altri Dati (`OtherDataTab.tsx`)
- Ore notturne/festive
- Indennità
- Trattenute
- Integrazione salariale
- Importo ente bilaterale

**Workflow**:
1. Creazione record mensile per dipendente
2. Compilazione dati presenze
3. Validazione (opzionale)
4. Utilizzo per calcolo cedolino

---

### 2.6 Payroll (Cedolini)

**File**:
- `src/pages/Payroll.tsx`
- `src/components/payroll/PayrollDialog.tsx`
- `src/components/payroll/PayrollDetailDialog.tsx`
- `src/components/payroll/PayrollEditDialog.tsx`
- `src/components/payroll/PayrollSettingsDialog.tsx`
- `src/hooks/usePayroll.tsx`
- `src/hooks/usePayrollSettings.tsx`
- `src/lib/payrollCalculations.ts`
- `src/lib/pdfGenerator.ts`

**Calcoli Automatici** (`payrollCalculations.ts`):

```typescript
// Contributi INPS dipendente (default 9.19%)
inpsContribution = grossSalary * inpsEmployeeRate

// Imponibile fiscale
taxableIncome = grossSalary - inpsContribution

// IRPEF con scaglioni
irpef = calculateIRPEF(taxableIncome, brackets)
// Default brackets:
// 0-28.000€: 23%
// 28.000-50.000€: 35%
// oltre 50.000€: 43%

// Detrazioni lavoro dipendente
workDeduction = getWorkDeduction(annualIncome)

// Detrazioni familiari a carico
familyDeduction = dependentsCount * deductionPerChild

// Addizionali regionali e comunali
regionalTax = taxableIncome * regionalRate
municipalTax = taxableIncome * municipalRate

// Netto
netSalary = grossSalary - inps - irpef + deductions - additionalTaxes
```

**Stati Cedolino**:
1. `bozza` - In lavorazione
2. `generato` - Calcolato, pronto per conferma
3. `confermato` - Approvato
4. `inviato` - Inviato al dipendente

**Impostazioni Payroll** (per azienda):
- Scaglioni IRPEF configurabili
- Aliquote INPS dipendente/datore
- Aliquota TFR
- Aliquota INAIL
- Addizionali regionali/comunali
- Detrazioni per figlio a carico
- Detrazioni lavoro dipendente per scaglione

**Generazione PDF**:
- Layout cedolino professionale
- Dati azienda e dipendente
- Dettaglio voci retributive
- Calcoli contributi e imposte
- Netto in busta

**Invio Email**:
- Template personalizzabile
- Allegato PDF cedolino
- Tracking invio

**Audit Logging**:
- `payroll_created`
- `payroll_updated`
- `payroll_confirmed`
- `payroll_sent`
- `payroll_deleted`

---

### 2.7 Sorveglianza Sanitaria

**File**:
- `src/pages/HealthSurveillance.tsx`
- `src/components/health-surveillance/*.tsx`

#### 2.7.1 Cartelle Sanitarie

**File**: `MedicalRecordDialog.tsx`, `MedicalRecordViewDialog.tsx`, `MedicalRecordListDialog.tsx`

**Campi**:
- Dipendente associato
- Protocollo sanitario
- Data apertura/chiusura
- Stato (aperta, chiusa, sospesa)
- **Anamnesi lavorativa**: storia professionale
- **Anamnesi personale**: stile di vita, abitudini
- **Anamnesi familiare**: patologie familiari
- **Patologia remota**: malattie pregresse
- **Patologia recente**: condizioni attuali
- **Profilo di rischio**: JSON con rischi specifici
- Note

**Generazione PDF**: `src/lib/medicalRecordPdfGenerator.ts`

#### 2.7.2 Visite Mediche

**File**: `MedicalVisitDialog.tsx`, `MedicalVisitViewDialog.tsx`, `MedicalVisitListDialog.tsx`, `MedicalVisitCalendar.tsx`

**Tipi Visita**:
- Preventiva (pre-assunzione)
- Periodica
- Su richiesta del lavoratore
- Per cambio mansione
- Al rientro da malattia
- Alla cessazione

**Campi**:
- Dipendente
- Cartella sanitaria collegata
- Data programmata / completata
- Tipo visita
- Medico competente
- Stato (programmata, completata, cancellata, non presentato)
- **Esame obiettivo**: risultati visita
- **Organi bersaglio**: organi esaminati
- **Accertamenti aggiuntivi**: JSON array (esami sangue, ECG, spirometria, ecc.)
- Note

**Calendario**: Vista mensile delle visite programmate

#### 2.7.3 Giudizi di Idoneità

**File**: `FitnessJudgmentDialog.tsx`

**Tipi Giudizio**:
- `idoneo` - Idoneo alla mansione
- `idoneo_con_prescrizioni` - Idoneo con prescrizioni
- `idoneo_con_limitazioni` - Idoneo con limitazioni
- `temporaneamente_non_idoneo` - Temporaneamente non idoneo
- `non_idoneo` - Non idoneo permanente

**Campi**:
- Visita collegata
- Data giudizio
- Data scadenza
- Tipo giudizio
- Prescrizioni
- Limitazioni
- Note
- Documento allegato

**Funzione "Rinnova"**:
- Crea nuovo giudizio con dati precompilati dal precedente
- Mantiene prescrizioni e limitazioni
- Aggiorna date

#### 2.7.4 Protocolli Sanitari

**File**: `ProtocolManagementDialog.tsx`, `JobRoleProtocolDialog.tsx`

**Campi Protocollo**:
- Nome protocollo
- Descrizione
- Riferimento normativo
- Valutazione rischio
- Mappatura Allegato 3B (JSON)
- Stato attivo/inattivo

**Associazione Mansioni**:
- Collegamento protocollo ↔ mansione
- Una mansione può avere più protocolli

#### 2.7.5 Gestione Rischi DVR

**File**: `DVRRiskManagement.tsx`

**Campi**:
- Codice rischio
- Nome rischio
- Categoria (fisico, chimico, biologico, ergonomico, psicosociale)
- Descrizione
- Livello severità (basso, medio, alto, molto alto)
- Protocolli suggeriti (JSON array)
- Stato attivo

#### 2.7.6 Vaccinazioni

**Tabella**: `vaccinations`

**Campi**:
- Dipendente
- Cartella sanitaria (opzionale)
- Nome vaccino
- Data somministrazione
- Data scadenza
- Numero lotto
- Note

#### 2.7.7 Documenti Medici

**File**: `MedicalDocumentsDialog.tsx`

**Tipi Documento**:
- Referti
- Certificati
- Esami diagnostici
- Giudizi
- Altri

**Upload**: Storage Supabase con RLS

#### 2.7.8 Firme Digitali

**File**: `DigitalSignatureDialog.tsx`

**Campi**:
- Documento/giudizio firmato
- Firma (canvas signature)
- Hash firma (integrità)
- Data/ora firma
- Firmatario
- IP address
- User agent
- Validità

#### 2.7.9 Sistema Notifiche

**File**: `NotificationSettingsDialog.tsx`, `NotificationLogsDialog.tsx`, `NotificationTestButton.tsx`

**Configurazione**:
- Tipi notifica (scadenza visite, scadenza giudizi, ecc.)
- Giorni preavviso configurabili (es. 30, 15, 7 giorni)
- Attivazione/disattivazione per tipo

**Edge Function**: `check-medical-visit-expiry`
- Esecuzione schedulata
- Controllo scadenze
- Invio email notifica
- Logging in `notification_logs`

#### 2.7.10 Conferma Visite

**File**: (sistema automatico)

**Edge Functions**:
- `send-visit-confirmation`: Invia email con link conferma
- `confirm-visit`: Gestisce click su link conferma

**Workflow**:
1. Programmazione visita
2. Invio email dipendente con token univoco
3. Click link conferma
4. Aggiornamento stato `visit_confirmations`

#### 2.7.11 Checklist Visite

**File**: `VisitChecklistDialog.tsx`

**Funzionalità**:
- Lista items da completare pre-visita
- Tracking completamento
- Reminder automatici

---

### 2.8 Modello F24

**File**: `src/pages/F24.tsx`

**Funzionalità**:
- Calcolo versamenti fiscali
- Riepilogo contributi da versare
- Generazione modello

---

### 2.9 Documenti Aziendali

**File**: `src/pages/Documents.tsx`

**Funzionalità**:
- Upload documenti
- Categorizzazione (contratti, policy, procedure, altro)
- Download e visualizzazione
- Tracking upload (chi, quando)

---

### 2.10 Report

**File**: 
- `src/pages/Reports.tsx`
- `src/hooks/useReports.tsx`
- `src/lib/reportGenerators.ts`

**Report Disponibili**:
- Elenco dipendenti
- Riepilogo presenze
- Costi del personale
- Scadenze sorveglianza sanitaria
- Contratti in scadenza

**Formati Export**: PDF, CSV

---

### 2.11 Compliance

**File**:
- `src/pages/Compliance.tsx`
- `src/lib/complianceGenerators.ts`

**Funzionalità**:
- Tracking adempimenti normativi
- Scadenzario
- Generazione documentazione

---

## 3. Funzionalità Trasversali

### 3.1 Autenticazione e Autorizzazione

**File**:
- `src/pages/Login.tsx`
- `src/pages/ResetPassword.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/hooks/useAuth.tsx`
- `src/lib/auth.ts`

**Flusso Login**:
1. Email + Password
2. Validazione password forte
3. Autenticazione Supabase
4. Caricamento ruolo utente
5. Redirect dashboard

**Validazione Password** (`validationSchemas.ts`):
```typescript
strongPasswordSchema = z.string()
  .min(8, "Almeno 8 caratteri")
  .regex(/[A-Z]/, "Almeno una maiuscola")
  .regex(/[a-z]/, "Almeno una minuscola")
  .regex(/[0-9]/, "Almeno un numero")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Almeno un carattere speciale")
```

**Reset Password**:
- Richiesta via email
- Link con token
- Nuova password con validazione

### 3.2 Sistema Ruoli

**Tabella**: `user_roles`

**Ruoli Disponibili**:
| Ruolo | Descrizione | Permessi |
|-------|-------------|----------|
| `superadmin` | Amministratore piattaforma | Accesso totale, tutte le aziende |
| `admin` | Amministratore azienda | Gestione completa azienda propria |
| `admin_sub_azienda` | Admin sotto-azienda | Gestione azienda figlia |
| `hr_manager` | Responsabile HR | Gestione dipendenti, payroll, presenze |
| `employee` | Dipendente | Solo visualizzazione propri dati |

**Funzioni Helper SQL**:
```sql
-- Verifica se utente è superadmin
is_superadmin(_user_id uuid) RETURNS boolean

-- Verifica ruolo specifico in azienda
has_role_in_company(_user_id uuid, _company_id uuid, _role user_role) RETURNS boolean

-- Ottiene company_id dell'utente
get_user_company(_user_id uuid) RETURNS uuid
```

### 3.3 Gestione Utenti

**File**: `src/components/settings/UserRolesManagement.tsx`

**Edge Functions**:
- `create-user`: Crea utente + profilo + ruolo
- `update-user`: Aggiorna dati utente
- `delete-user`: Elimina utente (soft delete profilo)

**Funzionalità**:
- Lista utenti azienda
- Creazione nuovo utente con ruolo
- Modifica ruolo
- Reset password
- Eliminazione utente

### 3.4 Gestione Sessioni

**File**: `src/components/settings/SessionManagement.tsx`

**Edge Function**: `session-manager`

**Funzionalità**:
- Visualizzazione sessioni attive
- Dettagli: dispositivo, IP, location, ultimo accesso
- Revoca sessione remota
- Cleanup sessioni scadute

**Tabella**: `user_sessions`
- `session_token`
- `refresh_token_hash`
- `expires_at`
- `device_info` (JSON)
- `location_info` (JSON)
- `is_active`
- `revoked_at`, `revoked_reason`

### 3.5 Sistema Email

**File**:
- `src/components/settings/EmailSettingsManagement.tsx`
- `src/components/settings/EmailTemplates.tsx`
- `src/hooks/useEmailSettings.tsx`
- `src/hooks/useEmailTemplates.tsx`

**Edge Function**: `send-email`

**Configurazione SMTP** (solo superadmin):
- Host, porta, sicurezza
- Utente SMTP
- Email e nome mittente
- Flag SMTP custom

**Template Email**:
| Tipo | Uso |
|------|-----|
| `welcome` | Benvenuto nuovo utente |
| `reset_password` | Reset password |
| `payroll_delivery` | Invio cedolino |
| `notification` | Notifiche generiche |
| `general_communication` | Comunicazioni |

**Variabili Template**:
- `{{employee_name}}`
- `{{company_name}}`
- `{{date}}`
- `{{link}}`
- ecc.

### 3.6 Chatbot AI

**File**: `src/components/Chatbot.tsx`

**Edge Function**: `chat`

**Funzionalità**:
- Assistente virtuale integrato
- Risposte su normativa HR
- Supporto operativo

### 3.7 Dashboard

**File**: 
- `src/pages/Dashboard.tsx`
- `src/hooks/useDashboard.tsx`

**Widget**:
- Conteggio dipendenti attivi
- Cedolini del mese
- Visite in scadenza
- Contratti in scadenza
- Grafici andamento

### 3.8 SuperAdmin Panel

**File**: `src/pages/SuperAdmin.tsx`

**Tab**:
- **HR Sources** (`HRSourcesTab.tsx`): Gestione fonti normative
- **Logs** (`LogsTab.tsx`): Visualizzazione log piattaforma

**Edge Function**: `impersonate-admin`
- Login come admin di un'azienda
- Solo per superadmin
- Audit trail

### 3.9 Sincronizzazione FTP

**Edge Function**: `sync-to-ftp`

**Funzionalità**:
- Export dati verso consulenti del lavoro
- Formati compatibili software paghe
- Logging upload in `ftp_upload_logs`

---

## 4. Sicurezza Implementata

### 4.1 Row Level Security (RLS)

**Statistiche**:
- 33 tabelle con RLS abilitata
- 89 policy totali

**Pattern Comuni**:
```sql
-- Utenti vedono solo dati propria azienda
USING (company_id = get_user_company(auth.uid()))

-- Admin/HR possono gestire
USING (
  has_role_in_company(auth.uid(), company_id, 'admin') OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager')
)

-- Superadmin accesso totale
USING (is_superadmin(auth.uid()))
```

### 4.2 Audit Logging

**Tabella**: `audit_logs`

**Campi**:
- `user_id`, `user_email`
- `company_id`
- `action` (tipo operazione)
- `entity_type` (user, role, payroll, employee, company)
- `entity_id`
- `old_value`, `new_value` (JSON)
- `ip_address`, `user_agent`
- `created_at`

**Azioni Tracciate**:
- `user_created`
- `user_deleted`
- `user_updated`
- `role_changed`
- `payroll_created`
- `payroll_updated`
- `payroll_confirmed`
- `payroll_sent`
- `payroll_deleted`
- `company_created`
- `company_updated`
- `company_deleted`
- `employee_created`
- `employee_updated`
- `employee_deleted`

**Utility Client**: `src/lib/auditLogger.ts`
```typescript
logAuditEvent({
  action: "payroll_created",
  entityType: "payroll",
  entityId: payrollId,
  newValue: payrollData
});

sanitizeForAudit(data) // Rimuove campi sensibili
```

**Edge Function**: `audit-log/index.ts`
- Inserimento sicuro log
- Cattura IP e user agent
- RLS: solo service role può inserire

### 4.3 Rate Limiting

**File**: `supabase/functions/_shared/rate-limiter.ts`

**Implementazione**:
- Limite richieste per IP
- Finestra temporale configurabile
- Applicato su edge functions critiche

### 4.4 Validazione Input

**File**: `src/lib/validationSchemas.ts`

**Schema Disponibili**:
```typescript
// Password forte
strongPasswordSchema

// Codice fiscale italiano
italianTaxCodeSchema
italianTaxCodeRequiredSchema

// IBAN italiano
italianIbanSchema
italianIbanRequiredSchema

// Telefono italiano
italianPhoneSchema

// Email
emailSchema
optionalEmailSchema

// Nomi
fullNameSchema
companyNameSchema

// P.IVA italiana
italianVatSchema

// Form completi
loginFormSchema
registerFormSchema
createCompanySchema
editCompanySchema
createUserSchema
updateUserPasswordSchema
employeeBasicInfoSchema
```

### 4.5 Access Logging

**Tabella**: `platform_access_logs`

**Hook**: `src/hooks/useAccessLogger.tsx`

**Campi**:
- `user_id`, `user_name`
- `company_id`, `company_name`
- `ip_address`
- `user_agent`
- `accessed_at`

---

## 5. Schema Database

### 5.1 Tabelle Principali (33)

| Tabella | Descrizione | RLS |
|---------|-------------|-----|
| `companies` | Aziende | ✓ |
| `profiles` | Profili utente | ✓ |
| `user_roles` | Ruoli utenti | ✓ |
| `user_sessions` | Sessioni attive | ✓ |
| `employees` | Dipendenti | ✓ |
| `employment_contracts` | Contratti lavoro | ✓ |
| `ccnl_contracts` | Contratti CCNL | ✓ |
| `presence_records` | Presenze mensili | ✓ |
| `payroll_records` | Cedolini | ✓ |
| `payroll_settings` | Impostazioni payroll | ✓ |
| `medical_records` | Cartelle sanitarie | ✓ |
| `medical_visits` | Visite mediche | ✓ |
| `medical_protocols` | Protocolli sanitari | ✓ |
| `medical_documents` | Documenti medici | ✓ |
| `medical_convocations` | Convocazioni visite | ✓ |
| `fitness_judgments` | Giudizi idoneità | ✓ |
| `job_role_protocols` | Protocolli per mansione | ✓ |
| `vaccinations` | Vaccinazioni | ✓ |
| `dvr_risks` | Rischi DVR | ✓ |
| `digital_signatures` | Firme digitali | ✓ |
| `visit_checklists` | Checklist visite | ✓ |
| `visit_confirmations` | Conferme visite | ✓ |
| `notification_settings` | Impostazioni notifiche | ✓ |
| `notification_logs` | Log notifiche | ✓ |
| `documents` | Documenti generici | ✓ |
| `education_records` | Titoli studio | ✓ |
| `email_settings` | Impostazioni email | ✓ |
| `email_templates` | Template email | ✓ |
| `email_logs` | Log email | ✓ |
| `audit_logs` | Log audit | ✓ |
| `platform_access_logs` | Log accessi | ✓ |
| `ftp_upload_logs` | Log upload FTP | ✓ |
| `hr_news_sources` | Fonti HR | ✓ |

### 5.2 Enum Types

```sql
-- Tipi contratto
contract_type: 'indeterminato' | 'determinato' | 'part_time' | 'consulente'

-- Ruoli utente
user_role: 'admin' | 'hr_manager' | 'employee' | 'superadmin' | 'admin_sub_azienda'

-- Stato cedolino
payroll_status: 'bozza' | 'generato' | 'inviato' | 'confermato'

-- Tipi assenza
absence_type: 'ferie' | 'malattia' | 'permesso' | 'congedo_parentale'

-- Tipi template email
email_template_type: 'reset_password' | 'payroll_delivery' | 'general_communication' | 'welcome' | 'notification'
```

### 5.3 Funzioni Database

```sql
-- Cleanup sessioni scadute
cleanup_expired_sessions() RETURNS number

-- Crea azienda per utente
create_company_for_user(_company_email, _company_name, _user_id) RETURNS uuid

-- Ottiene azienda utente
get_user_company(_user_id) RETURNS uuid

-- Verifica ruolo in azienda
has_role_in_company(_company_id, _role, _user_id) RETURNS boolean

-- Verifica superadmin
is_superadmin(_user_id) RETURNS boolean

-- Aggiorna attività sessione
update_session_activity(p_session_token) RETURNS boolean
```

---

## 6. Edge Functions (14)

| Funzione | Descrizione | JWT |
|----------|-------------|-----|
| `audit-log` | Registrazione eventi audit | ✓ |
| `chat` | Chatbot AI | ✓ |
| `check-medical-visit-expiry` | Controllo scadenze visite | ✗ |
| `confirm-visit` | Conferma visita medica | ✗ |
| `create-company` | Creazione azienda + admin | ✓ |
| `create-user` | Creazione utente | ✓ |
| `delete-company` | Eliminazione azienda | ✓ |
| `delete-user` | Eliminazione utente | ✓ |
| `impersonate-admin` | Impersonificazione superadmin | ✓ |
| `send-email` | Invio email SMTP | ✓ |
| `send-visit-confirmation` | Email conferma visita | ✓ |
| `session-manager` | Gestione sessioni | ✓ |
| `sync-to-ftp` | Sincronizzazione FTP | ✓ |
| `update-user` | Aggiornamento utente | ✓ |

---

## 7. Librerie Utility

| File | Descrizione |
|------|-------------|
| `src/lib/auditLogger.ts` | Logging audit client-side |
| `src/lib/payrollCalculations.ts` | Calcoli cedolino |
| `src/lib/pdfGenerator.ts` | Generazione PDF cedolini |
| `src/lib/medicalRecordPdfGenerator.ts` | PDF cartella sanitaria |
| `src/lib/reportGenerators.ts` | Generazione report |
| `src/lib/complianceGenerators.ts` | Report compliance |
| `src/lib/csvUtils.ts` | Export/import CSV |
| `src/lib/documentUpload.ts` | Upload documenti |
| `src/lib/validationSchemas.ts` | Schemi validazione Zod |
| `src/lib/auth.ts` | Utility autenticazione |
| `src/lib/utils.ts` | Utility generiche (cn, formatters) |

---

## 8. Hooks Custom

| File | Descrizione |
|------|-------------|
| `useAuth.tsx` | Gestione autenticazione |
| `useCCNLContracts.tsx` | CRUD contratti CCNL |
| `useContracts.tsx` | CRUD contratti lavoro |
| `useDashboard.tsx` | Dati dashboard |
| `useEmailSettings.tsx` | Impostazioni email |
| `useEmailTemplates.tsx` | Template email |
| `useEmployees.tsx` | CRUD dipendenti |
| `usePayroll.tsx` | CRUD cedolini |
| `usePayrollSettings.tsx` | Impostazioni payroll |
| `usePresence.tsx` | CRUD presenze |
| `useReports.tsx` | Generazione report |
| `useAccessLogger.tsx` | Logging accessi |
| `use-mobile.tsx` | Rilevamento mobile |
| `use-toast.ts` | Sistema notifiche toast |

---

## 9. Componenti UI

### 9.1 Shadcn/UI Components (40+)

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, ToggleGroup, Tooltip

### 9.2 Layout Components

- `Navbar.tsx` - Navigazione principale
- `ProtectedRoute.tsx` - Route autenticate

---

## 10. Cronologia Modifiche Principali

### Fase 1: Setup Iniziale
- Configurazione progetto React + Vite + TypeScript
- Integrazione Tailwind CSS e Shadcn/UI
- Setup Supabase (Lovable Cloud)
- Struttura base routing

### Fase 2: Gestione Aziende e Utenti
- Tabelle `companies`, `profiles`, `user_roles`
- Sistema autenticazione
- CRUD aziende
- Gestione ruoli

### Fase 3: Gestione Dipendenti
- Tabella `employees` con campi completi
- Dialog multi-tab
- Validazioni italiane (CF, IBAN)
- Upload documenti

### Fase 4: CCNL e Contratti
- Tabelle `ccnl_contracts`, `employment_contracts`
- Configurazione dettagliata CCNL
- Template contratti

### Fase 5: Presenze e Payroll
- Tabelle `presence_records`, `payroll_records`, `payroll_settings`
- Calcoli automatici cedolino
- Generazione PDF
- Invio email

### Fase 6: Sorveglianza Sanitaria
- 10+ tabelle dedicate
- Gestione completa cartelle sanitarie
- Visite mediche con calendario
- Giudizi idoneità
- Protocolli e rischi DVR
- Sistema notifiche scadenze
- Firme digitali

### Fase 7: Sicurezza
- Implementazione RLS completa (89 policy)
- Audit logging
- Rate limiting
- Validazione input avanzata
- Access logging
- Gestione sessioni

### Fase 8: Funzionalità Avanzate
- Chatbot AI
- Sincronizzazione FTP
- Sistema email completo
- Report e compliance
- SuperAdmin panel

---

## 11. Configurazione Ambiente

### 11.1 Variabili Ambiente (.env)
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

### 11.2 Supabase Config (supabase/config.toml)
- Project ID
- Edge functions con configurazione JWT
- Rate limiting

---

## 12. Note Tecniche

### 12.1 Performance
- React Query per caching e gestione stato server
- Lazy loading componenti
- Ottimizzazione query con select specifici

### 12.2 Accessibilità
- Componenti Radix UI accessibili
- ARIA labels
- Navigazione keyboard

### 12.3 Responsive
- Design mobile-first
- Hook `use-mobile` per adattamento
- Componenti responsive (Sheet mobile, Dialog desktop)

### 12.4 Internazionalizzazione
- Testi in italiano
- Formattazione date/numeri italiana
- Validazioni formato italiano

---

*Documento generato automaticamente - Ultimo aggiornamento: Dicembre 2024*
