
## Piano: Generare README.md completo

Creerò il file `README.md` nella root del progetto con documentazione completa di tutte le funzionalità di PayHub, strutturato in modo professionale e leggibile.

### Struttura del README

1. **Header e Badge** - Nome progetto, descrizione, stack tecnologico
2. **Indice** - Navigazione rapida alle sezioni
3. **Panoramica** - Descrizione sistema e architettura
4. **Stack Tecnologico** - Elenco tecnologie utilizzate
5. **Funzionalità Principali** - Tutti i moduli con descrizioni dettagliate:
   - Gestione Aziende (CRUD, dati anagrafici, P.IVA, INPS/INAIL)
   - Gestione Dipendenti (5 tab: dati base, CCNL, cittadinanza, istruzione, payroll)
   - Contratti di Lavoro (template, tipi contratto, benefits)
   - CCNL (scaglioni salariali, straordinari, ferie, contributi)
   - Presenze (giorni lavorati, ferie, malattia, maternità, congedo parentale)
   - Payroll/Cedolini (calcoli IRPEF/INPS automatici, PDF, invio email, 4 stati)
   - Sorveglianza Sanitaria (cartelle, visite, giudizi idoneità, protocolli, DVR, vaccinazioni, firme digitali, notifiche, checklist)
   - F24 (versamenti fiscali)
   - Documenti (upload, categorizzazione)
   - Report (dipendenti, presenze, costi, scadenze - export PDF/CSV)
   - Compliance (adempimenti normativi)
6. **Funzionalità Trasversali**
   - Autenticazione (login, reset password, validazione password forte)
   - Sistema Ruoli (5 ruoli: superadmin, admin, admin_sub_azienda, hr_manager, employee)
   - Gestione Sessioni (max 5 sessioni, revoca remota)
   - Sistema Email (SMTP, template personalizzabili, 5 tipi template)
   - Chatbot AI (Google Gemini, fonti HR configurabili)
   - Dashboard (widget conteggi, grafici)
   - SuperAdmin Panel (fonti HR, logs, impersonificazione)
   - Sincronizzazione FTP
7. **Sicurezza**
   - RLS (89 policy, 33 tabelle)
   - Audit Logging (16+ azioni tracciate)
   - Rate Limiting
   - Validazione Input (Zod schemas)
   - Access Logging
8. **Database** - 33 tabelle con descrizioni, enum types, funzioni DB
9. **Backend Functions** - 14 edge functions con descrizioni
10. **Librerie e Hooks** - 11 librerie utility, 14 hooks custom
11. **Componenti UI** - 40+ componenti Shadcn/UI
12. **Setup e Installazione** - Istruzioni per sviluppo locale
13. **Configurazione** - Variabili ambiente, secrets necessari

### Dettagli tecnici
- Il file verra creato come `README.md` nella root del progetto (sostituisce il README esistente generico di Lovable)
- Testo in italiano coerente con il progetto
- Tabelle markdown per database, edge functions, hooks
- Sezioni con link interni per navigazione rapida
