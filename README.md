# 🇮🇹 PayHub — Sistema HR & Payroll Italia

**Piattaforma integrata per la gestione delle Risorse Umane, Payroll e Sorveglianza Sanitaria conforme alla normativa italiana.**

> Stack: React · TypeScript · Vite · Tailwind CSS · Shadcn/UI · Supabase · Zod · jsPDF · Recharts

---

## 📑 Indice

- [Panoramica](#panoramica)
- [Stack Tecnologico](#stack-tecnologico)
- [Funzionalità Principali](#funzionalità-principali)
  - [Gestione Aziende](#1-gestione-aziende)
  - [Gestione Dipendenti](#2-gestione-dipendenti)
  - [Contratti di Lavoro](#3-contratti-di-lavoro)
  - [CCNL](#4-ccnl---contratti-collettivi-nazionali)
  - [Presenze](#5-presenze)
  - [Payroll / Cedolini](#6-payroll--cedolini)
  - [Sorveglianza Sanitaria](#7-sorveglianza-sanitaria)
  - [F24](#8-f24---versamenti-fiscali)
  - [Documenti](#9-documenti)
  - [Report](#10-report)
  - [Compliance](#11-compliance)
- [Funzionalità Trasversali](#funzionalità-trasversali)
- [Sicurezza](#sicurezza)
- [Database](#database)
- [Backend Functions](#backend-functions)
- [Librerie e Hooks](#librerie-e-hooks)
- [Componenti UI](#componenti-ui)
- [Setup e Installazione](#setup-e-installazione)
- [Configurazione](#configurazione)

---

## Panoramica

PayHub è un sistema gestionale HR multi-tenant progettato per aziende italiane. Supporta l'intero ciclo di vita del dipendente: dall'assunzione al payroll, dalla sorveglianza sanitaria alla compliance normativa.

### Architettura

```
┌─────────────────────────────────────────────┐
│              Frontend (React/Vite)           │
│  Pages · Components · Hooks · Lib           │
├─────────────────────────────────────────────┤
│            Supabase (Backend)               │
│  Auth · Database (PostgreSQL) · Storage     │
│  Edge Functions · RLS · Realtime            │
└─────────────────────────────────────────────┘
```

- **Multi-tenant**: ogni azienda vede solo i propri dati tramite RLS
- **Role-based**: 5 ruoli con permessi granulari
- **Conforme**: normativa italiana (IRPEF 2025, INPS, D.Lgs. 81/08)

---

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn/UI, class-variance-authority |
| State Management | TanStack React Query v5 |
| Routing | React Router DOM v6 |
| Form | React Hook Form + Zod |
| Grafici | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| AI | Google Gemini (via Supabase Edge Functions) |
| Email | SMTP custom / Resend API |

---

## Funzionalità Principali

### 1. Gestione Aziende

**Pagina**: `Companies.tsx`

- CRUD completo aziende
- Dati anagrafici: nome, email, telefono, indirizzo completo (via, CAP, città, provincia, paese)
- Partita IVA con validazione (11 cifre)
- Matricola INPS e Posizione INAIL
- Voce INAIL
- Supporto **sub-aziende** (parent_company_id)
- Associazione CCNL predefinito
- Creazione automatica admin alla creazione azienda
- Audit logging su creazione/modifica/eliminazione

### 2. Gestione Dipendenti

**Pagina**: `Employees.tsx` — **5 tab organizzative**

#### Tab 1: Dati Base (`BasicInfoTab`)
- Nome, cognome, nome completo
- Codice fiscale (validazione formato italiano: `RSSMRA85M01H501U`)
- Email, telefono (validazione formato italiano `+39`)
- Data di nascita
- Indirizzo: città, CAP, provincia, paese
- IBAN (validazione formato italiano 27 caratteri: `IT60X0542811101000000123456`)
- Stato civile
- Tipo dipendente, categoria pagamento
- Data assunzione, tipo contratto
- Stipendio base, ore lavorative
- Figli a carico, detrazioni fiscali
- Posizione INPS/INAIL, fondo pensione
- CV (upload file)

#### Tab 2: CCNL (`CCNLTab`)
- Associazione contratto CCNL al dipendente
- Visualizzazione dettagli contratto applicato

#### Tab 3: Cittadinanza (`CitizenshipTab`)
- Nazionalità
- Carta d'identità: comune rilascio, provincia, data rilascio, scadenza
- Passaporto: numero, comune rilascio, provincia, data rilascio, scadenza
- Visto: numero, data rilascio, scadenza, documento allegato
- Permesso di soggiorno
- Commissariato di riferimento

#### Tab 4: Istruzione (`EducationTab`)
- Titoli di studio multipli
- Per ogni titolo: nome, tipo, data, voto, documento allegato

#### Tab 5: Payroll (`PayrollTab`)
- Riepilogo dati retributivi
- Stipendio base, ore, detrazioni
- Figli a carico

### 3. Contratti di Lavoro

**Pagina**: `Contract.tsx`

- Gestione contratti individuali di lavoro
- Supporto **template** riutilizzabili (`is_template`)
- Campi: nome contratto, tipo, mansione, descrizione mansione
- Data inizio/fine, periodo di prova, preavviso
- Stipendio base, ore lavorative
- Sede di lavoro
- Benefits e clausole aggiuntive
- Associazione a dipendente specifico
- Stato attivo/inattivo

### 4. CCNL — Contratti Collettivi Nazionali

**Pagina**: `Settings.tsx` → `CCNLManagement`

- Gestione completa contratti CCNL per azienda
- **Retribuzione**: stipendio base, tabella salariale (JSON), scaglioni
- **Contributi**: aliquota INPS personalizzata, aliquota INAIL
- **Mensilità**: 13ª e 14ª mensilità (configurabili)
- **Ferie e permessi**: giorni ferie, giorni malattia, permessi (JSON)
- **Straordinari**: regole straordinari (JSON con maggiorazioni)
- **Contratti**: part-time consentito, tempo determinato consentito
- **Periodi di prova**: giorni prova, periodi di prova (JSON)
- **Preavviso**: giorni di preavviso
- **Buoni pasto**: abilitazione e importo
- **Enti bilaterali**: entità contrattuali (JSON)
- **Altri contributi**: contributi aggiuntivi (JSON)
- **Note** e **descrizione**

### 5. Presenze

**Pagina**: `Presence.tsx` — **4 tab**

#### Tab Base (`BasicPresenceTab`)
- Giorni lavorati, ore straordinario
- Giorni ferie, giorni malattia
- Ore notturne/festive
- Escludi weekend
- Indennità e trattenute

#### Tab Maternità (`MaternityTab`)
- Giorni maternità obbligatoria
- Codice MA1

#### Tab Congedo Parentale (`ParentalLeaveTab`)
- Giorni congedo parentale PG4
- Giorni congedo parentale PG5

#### Tab Altri Dati (`OtherDataTab`)
- Altre assenze
- Integrazione salariale
- Importo ente bilaterale

- **Validazione**: presenze validabili da utente autorizzato con timestamp
- **Filtro**: per dipendente, mese e anno

### 6. Payroll / Cedolini

**Pagina**: `Payroll.tsx`

#### Calcoli automatici conformi 2025
- **IRPEF**: 3 scaglioni (23% fino a 28k, 35% 28-50k, 43% oltre 50k)
- **INPS dipendente**: 9.19% (personalizzabile da CCNL)
- **INPS datore**: 30.08%
- **TFR**: 6.91%
- **INAIL**: 1.5% medio (personalizzabile)
- **Addizionale regionale**: 1.23%
- **Addizionale comunale**: 0.8%
- **Detrazioni lavoro dipendente**: formula progressiva per reddito
- **Detrazioni familiari**: €950 per figlio a carico
- Supporto 13ª e 14ª mensilità dal CCNL

#### Workflow a 4 stati
| Stato | Descrizione |
|-------|-------------|
| `draft` | Bozza — modificabile |
| `confirmed` | Confermato — non modificabile |
| `sent` | Inviato al dipendente via email |
| `paid` | Pagato |

#### Funzionalità
- Generazione cedolino singolo o **massiva** (tutti i dipendenti)
- Generazione PDF cedolino con dettaglio completo
- Invio email cedolino al dipendente
- Modifica cedolino (solo in stato draft)
- Visualizzazione dettaglio con breakdown completo
- Impostazioni payroll personalizzabili per azienda (`PayrollSettingsDialog`)
- Audit logging su tutte le operazioni payroll

### 7. Sorveglianza Sanitaria

**Pagina**: `HealthSurveillance.tsx` — Conforme D.Lgs. 81/08

#### 7.1 Cartelle Sanitarie (`MedicalRecordDialog`)
- Apertura/chiusura cartella sanitaria per dipendente
- Anamnesi familiare, personale, lavorativa
- Patologia remota e recente
- Profilo di rischio (JSON)
- Associazione protocollo sanitario
- **Generazione PDF** completo della cartella (`medicalRecordPdfGenerator`)

#### 7.2 Visite Mediche (`MedicalVisitDialog`)
- Tipi: preventiva, periodica, cambio mansione, richiesta lavoratore, fine rapporto
- Programmazione con data, medico, tipo visita
- Esame obiettivo, organi bersaglio
- Accertamenti aggiuntivi (JSON)
- Stati: programmata, completata, annullata
- **Calendario interattivo** (`MedicalVisitCalendar`) con color-coding per prossimità scadenza
- **Lista visite** con filtri (`MedicalVisitListDialog`)

#### 7.3 Giudizi di Idoneità (`FitnessJudgmentDialog`)
- Tipi: idoneo, idoneo con prescrizioni, idoneo con limitazioni, non idoneo temporaneo, non idoneo permanente
- Data giudizio e scadenza
- Prescrizioni e limitazioni testuali
- Documento allegato

#### 7.4 Protocolli Sanitari (`ProtocolManagementDialog`)
- Definizione protocolli per azienda
- Nome, descrizione, normativa di riferimento
- Valutazione del rischio
- Mappatura Allegato 3B (JSON)
- Stato attivo/inattivo

#### 7.5 Associazione Mansione-Protocollo (`JobRoleProtocolDialog`)
- Mapping automatico: mansione → protocollo sanitario
- Suggerimento protocolli basato su rischi DVR

#### 7.6 DVR — Gestione Rischi (`DVRRiskManagement`)
- Documento Valutazione Rischi digitale
- Codice rischio, nome, categoria, descrizione
- Livello di gravità
- Protocolli suggeriti (JSON)
- Stato attivo/inattivo

#### 7.7 Documenti Sanitari (`MedicalDocumentsDialog`)
- Upload e archiviazione documenti medici
- Tipi: referti, certificati, esami
- Associazione a cartella sanitaria e/o visita
- Metadati: nome file, dimensione, MIME type

#### 7.8 Firme Digitali (`DigitalSignatureDialog`)
- Firma digitale su documenti e giudizi
- Hash SHA-256 crittografico
- Timestamp, IP address, user agent
- Validazione firma

#### 7.9 Notifiche Automatiche
- **Impostazioni** (`NotificationSettingsDialog`): configurazione giorni prima della scadenza
- **Logs** (`NotificationLogsDialog`): storico notifiche inviate
- **Test** (`NotificationTestButton`): invio notifica di test
- **Controllo scadenze** automatico via edge function (`check-medical-visit-expiry`)
- **Conferma visita** via email con link unico (`confirm-visit`, `send-visit-confirmation`)

#### 7.10 Checklist Pre-Visita (`VisitChecklistDialog`)
- Items predefiniti e personalizzabili
- Tracking completamento

### 8. F24 — Versamenti Fiscali

**Pagina**: `F24.tsx`

- Gestione versamenti fiscali F24
- Interfaccia per registrazione e tracking

### 9. Documenti

**Pagina**: `Documents.tsx`

- Upload documenti aziendali
- Categorizzazione per tipo
- Metadati: nome file, percorso, dimensione, MIME type
- Associazione a azienda
- Tracking utente che ha caricato

### 10. Report

**Pagina**: `Reports.tsx`

- **Report Dipendenti**: elenco completo con dati anagrafici
- **Report Presenze**: riepilogo mensile presenze
- **Report Costi**: analisi costi del personale
- **Report Scadenze**: documenti e visite in scadenza
- **Export**: PDF e CSV
- Generatori dedicati (`reportGenerators.ts`, `csvUtils.ts`)

### 11. Compliance

**Pagina**: `Compliance.tsx`

- Adempimenti normativi obbligatori
- Generazione documenti compliance (`complianceGenerators.ts`)
- Tracking scadenze e adempimenti

---

## Funzionalità Trasversali

### Autenticazione

- **Login** (`Login.tsx`) con email e password
- **Registrazione** con creazione automatica azienda
- **Reset password** (`ResetPassword.tsx`) via email
- **Validazione password forte**: min 8 caratteri, maiuscola, minuscola, numero, carattere speciale
- **Sessione**: gestione automatica con Supabase Auth
- **Route protette** (`ProtectedRoute.tsx`) per ruolo

### Sistema Ruoli (5 livelli)

| Ruolo | Permessi |
|-------|----------|
| `superadmin` | Accesso completo al sistema, crea admin, vede tutte le aziende |
| `admin` | Gestisce una azienda, crea sub-aziende e utenti |
| `admin_sub_azienda` | Gestisce una singola sub-azienda |
| `hr_manager` | Accesso HR a livello aziendale, no impostazioni |
| `employee` | Solo dashboard e menu dipendente |

- Ruoli salvati in tabella separata `user_roles` (sicurezza anti-escalation)
- Funzione `has_role()` SECURITY DEFINER per check RLS senza ricorsione

### Gestione Sessioni (`SessionManagement`)

- Massimo **5 sessioni contemporanee** per utente
- Visualizzazione sessioni attive
- **Revoca remota** di sessioni
- Edge function dedicata (`session-manager`)

### Sistema Email

- **Impostazioni SMTP** (`EmailSettingsManagement`): host, porta, utente, sicurezza
- **Template personalizzabili** (`EmailTemplates`) — 5 tipi:
  - `payslip` — Invio cedolino
  - `visit_notification` — Notifica visita medica
  - `visit_confirmation` — Conferma visita
  - `welcome` — Benvenuto nuovo utente
  - `generic` — Generico
- **Log email** con stato invio, errori, dettagli
- Edge function `send-email` per invio via SMTP/Resend

### Chatbot AI (`Chatbot.tsx`)

- Integrato con **Google Gemini**
- Fonti HR configurabili dal SuperAdmin (`HRSourcesTab`)
- Upload documenti come fonti di conoscenza
- Risposte contestualizzate su normativa HR italiana

### Dashboard (`Dashboard.tsx`)

- Widget conteggi: dipendenti attivi, cedolini del mese, visite programmate
- Grafici interattivi (Recharts)
- Hook dedicato (`useDashboard`)

### SuperAdmin Panel (`SuperAdmin.tsx`)

- **Fonti HR** (`HRSourcesTab`): gestione fonti per chatbot AI
- **Logs** (`LogsTab`): visualizzazione audit logs e access logs
- **Impersonificazione**: accesso come altro admin (`impersonate-admin`)
- **Gestione utenti**: creazione/eliminazione utenti di sistema

### Sincronizzazione FTP

- Edge function `sync-to-ftp` per upload documenti su server FTP
- Log upload (`ftp_upload_logs`): stato, errori, dimensione file

---

## Sicurezza

### Row Level Security (RLS)

- **89 policy** su **33 tabelle**
- Ogni tabella ha RLS abilitato
- Policy basate su `auth.uid()` e `company_id`
- Funzione `has_role()` SECURITY DEFINER per evitare ricorsione
- Isolamento dati completo tra aziende (multi-tenancy)

### Audit Logging

- **16+ azioni tracciate**: `user_created`, `user_deleted`, `user_updated`, `role_changed`, `payroll_created`, `payroll_updated`, `payroll_confirmed`, `payroll_sent`, `payroll_deleted`, `company_created`, `company_updated`, `company_deleted`, `employee_created`, `employee_updated`, `employee_deleted`
- Cattura: user_id, user_email, company_id, entity_type, entity_id, old_value, new_value, IP, user_agent, timestamp
- Sanitizzazione dati sensibili (password, token → `[REDACTED]`)
- Fire-and-forget (non blocca l'operazione principale)

### Rate Limiting

- 10 richieste/minuto per operazioni utente
- 20 richieste/minuto per chat AI
- Implementato in `_shared/rate-limiter.ts`

### Validazione Input (Zod)

- Password forte: `strongPasswordSchema`
- Codice fiscale: `italianTaxCodeSchema` (formato `RSSMRA85M01H501U`)
- IBAN italiano: `italianIbanSchema` (27 caratteri, formato `IT...`)
- Telefono italiano: `italianPhoneSchema` (opzionale `+39`, 6-12 cifre)
- Partita IVA: `italianVatSchema` (11 cifre)
- Email con messaggi italiani
- Schema form login, registrazione, creazione azienda, creazione utente
- Validazione parametri payroll

### Access Logging

- Tabella `platform_access_logs`
- Traccia: user_id, user_name, company_id, company_name, IP, user_agent, timestamp
- Hook `useAccessLogger` per logging automatico

---

## Database

### Tabelle (33)

| Tabella | Descrizione |
|---------|-------------|
| `profiles` | Profili utente (company_id, full_name) |
| `user_roles` | Ruoli utente (user_id, role) |
| `companies` | Aziende (anagrafica, P.IVA, INPS, INAIL) |
| `employees` | Dipendenti (anagrafica completa, 50+ campi) |
| `education_records` | Titoli di studio dipendenti |
| `employment_contracts` | Contratti individuali di lavoro |
| `ccnl_contracts` | Contratti collettivi nazionali |
| `presence_records` | Presenze mensili |
| `payroll_records` | Cedolini (lordo, INPS, IRPEF, netto, stato) |
| `payroll_settings` | Impostazioni payroll per azienda |
| `medical_records` | Cartelle sanitarie |
| `medical_visits` | Visite mediche programmate/completate |
| `medical_protocols` | Protocolli sanitari |
| `medical_documents` | Documenti sanitari |
| `medical_convocations` | Convocazioni visite mediche |
| `fitness_judgments` | Giudizi di idoneità |
| `job_role_protocols` | Associazione mansione-protocollo |
| `dvr_risks` | Rischi DVR |
| `digital_signatures` | Firme digitali |
| `notification_settings` | Impostazioni notifiche |
| `notification_logs` | Log notifiche inviate |
| `documents` | Documenti aziendali |
| `email_settings` | Impostazioni SMTP |
| `email_templates` | Template email |
| `email_logs` | Log email inviate |
| `audit_logs` | Audit trail operazioni |
| `platform_access_logs` | Log accessi piattaforma |
| `ftp_upload_logs` | Log upload FTP |
| `hr_news_sources` | Fonti HR per chatbot |

### Enum Types

| Enum | Valori |
|------|--------|
| `app_role` | `superadmin`, `admin`, `admin_sub_azienda`, `hr_manager`, `employee` |
| `contract_type` | `full_time`, `part_time`, `apprenticeship`, `internship`, `temporary`, `project`, `seasonal` |
| `payroll_status` | `draft`, `confirmed`, `sent`, `paid` |
| `email_template_type` | `payslip`, `visit_notification`, `visit_confirmation`, `welcome`, `generic` |

### Funzioni Database

| Funzione | Tipo | Descrizione |
|----------|------|-------------|
| `has_role(uuid, app_role)` | SECURITY DEFINER | Check ruolo utente senza ricorsione RLS |
| `create_company_for_user(uuid, text, text)` | SECURITY DEFINER | Crea azienda + profilo + ruolo admin |
| `is_superadmin(uuid)` | SECURITY DEFINER | Verifica se utente è superadmin |

---

## Backend Functions

### Edge Functions (14)

| Funzione | JWT | Descrizione |
|----------|-----|-------------|
| `audit-log` | ✅ | Registra evento audit trail |
| `chat` | ❌ | Chatbot AI con Google Gemini |
| `check-medical-visit-expiry` | ❌ | Controlla scadenze visite (CRON) |
| `confirm-visit` | ❌ | Conferma visita da link email |
| `create-company` | ✅ | Crea azienda + admin + ruolo |
| `create-user` | ✅ | Crea utente con ruolo |
| `delete-company` | ✅ | Elimina azienda |
| `delete-user` | ✅ | Elimina utente |
| `impersonate-admin` | ✅ | Impersonificazione admin (superadmin) |
| `send-email` | ✅ | Invio email via SMTP/Resend |
| `send-visit-confirmation` | ✅ | Invia email conferma visita |
| `session-manager` | ✅ | Gestione sessioni (max 5) |
| `sync-to-ftp` | ✅ | Sincronizzazione file su FTP |
| `update-user` | ✅ | Aggiorna dati utente |

### Shared Modules

- `_shared/rate-limiter.ts` — Rate limiting per edge functions

---

## Librerie e Hooks

### Librerie Utility (`src/lib/`)

| File | Descrizione |
|------|-------------|
| `auth.ts` | Servizio autenticazione (signUp, signIn, signOut, getCurrentUser) |
| `payrollCalculations.ts` | Calcoli IRPEF/INPS/TFR conformi 2025 |
| `validationSchemas.ts` | Schemi Zod per validazione input |
| `auditLogger.ts` | Logger audit trail con sanitizzazione |
| `pdfGenerator.ts` | Generazione PDF cedolini |
| `medicalRecordPdfGenerator.ts` | Generazione PDF cartelle sanitarie |
| `reportGenerators.ts` | Generatori report (dipendenti, presenze, costi) |
| `complianceGenerators.ts` | Generatori documenti compliance |
| `csvUtils.ts` | Export dati in formato CSV |
| `documentUpload.ts` | Utility upload documenti |
| `utils.ts` | Utility generiche (cn, formatDate, ecc.) |

### Custom Hooks (`src/hooks/`)

| Hook | Descrizione |
|------|-------------|
| `useAuth` | Stato autenticazione, ruoli, company_id |
| `useEmployees` | CRUD dipendenti con React Query |
| `usePayroll` | CRUD cedolini, generazione, invio email |
| `usePayrollSettings` | Impostazioni payroll per azienda |
| `usePresence` | CRUD presenze mensili |
| `useContracts` | CRUD contratti di lavoro |
| `useCCNLContracts` | CRUD contratti CCNL |
| `useDashboard` | Dati dashboard (conteggi, grafici) |
| `useReports` | Generazione e export report |
| `useEmailSettings` | Impostazioni SMTP |
| `useEmailTemplates` | Gestione template email |
| `useAccessLogger` | Logging accessi piattaforma |
| `use-mobile` | Responsive detection |
| `use-toast` | Notifiche toast |

---

## Componenti UI

### Componenti Applicativi

| Componente | Descrizione |
|------------|-------------|
| `Navbar` | Barra navigazione con menu ruolo-based |
| `Chatbot` | Interfaccia chatbot AI |
| `ProtectedRoute` | Wrapper route con controllo ruoli |

### Componenti Shadcn/UI (40+)

Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toaster, Toggle, ToggleGroup, Tooltip

---

## Setup e Installazione

### Prerequisiti

- Node.js 18+ e npm
- Account Lovable (per backend Cloud)

### Installazione locale

```bash
# 1. Clona il repository
git clone <URL_REPOSITORY>

# 2. Entra nella directory
cd payhub

# 3. Installa le dipendenze
npm install

# 4. Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

---

## Configurazione

### Variabili d'Ambiente (`.env`)

```env
VITE_SUPABASE_URL=<url_supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key>
VITE_SUPABASE_PROJECT_ID=<project_id>
```

> ⚠️ Il file `.env` è generato automaticamente da Lovable Cloud. Non modificare manualmente.

### Secrets (Edge Functions)

| Secret | Utilizzo |
|--------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Operazioni admin (auto-configurato) |
| `CRON_SECRET` | Autenticazione job schedulati |
| `RESEND_API_KEY` | Invio email via Resend |
| `GEMINI_API_KEY` | Chatbot AI Google Gemini |
| `SMTP_HOST` | Server SMTP personalizzato |
| `SMTP_PORT` | Porta SMTP |
| `SMTP_USER` | Utente SMTP |
| `SMTP_PASSWORD` | Password SMTP |
| `FTP_HOST` | Server FTP per sincronizzazione |
| `FTP_USERNAME` | Utente FTP |
| `FTP_PASSWORD` | Password FTP |
| `FTP_PORT` | Porta FTP |

---

## Licenza

Progetto proprietario. Tutti i diritti riservati.

---

*Generato il 2026-02-10 — PayHub v1.0*
