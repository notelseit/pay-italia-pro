

## Piano: Ruolo "Medical Officer" con Accesso Esclusivo ai Dati Sanitari

### Panoramica

Aggiungere il nuovo ruolo `medical_officer` all'enum `user_role`, concedendogli accesso esclusivo alle tabelle sanitarie (medical_records, medical_visits, fitness_judgments, medical_documents, medical_protocols, vaccinations, medical_convocations, visit_checklists) e alla lista dipendenti (sola lettura). Nessun accesso a payroll, presenze, dati fiscali, contratti, impostazioni o compliance.

---

### FASE 1: Database - Enum e RLS

**Migrazione SQL**

1. **Aggiungere valore enum**:
   ```sql
   ALTER TYPE user_role ADD VALUE 'medical_officer';
   ```

2. **Aggiornare RLS sulle tabelle sanitarie** (8 tabelle):
   Per ciascuna delle seguenti tabelle, aggiornare le policy "Admins and HR can manage..." per includere `'medical_officer'` nella lista dei ruoli autorizzati:
   - `medical_records` (SELECT + ALL)
   - `medical_visits` (SELECT + ALL)
   - `fitness_judgments` (SELECT + ALL)
   - `medical_documents` (SELECT + ALL)
   - `medical_protocols` (SELECT + manage)
   - `vaccinations` (SELECT + ALL)
   - `medical_convocations` (SELECT + ALL)
   - `visit_checklists` (SELECT + ALL)

   Le policy FOR ALL esistenti gia verificano `role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')`. Si esegue DROP + RECREATE per aggiungere `'medical_officer'` a ciascuna.

3. **Aggiungere SELECT su `employees`** per medical_officer:
   Il medical_officer deve poter vedere la lista dipendenti (necessaria per selezionare un dipendente nella sorveglianza sanitaria), ma in sola lettura:
   ```sql
   CREATE POLICY "Medical officer can view employees"
     ON public.employees FOR SELECT
     USING (has_role_in_company(auth.uid(), company_id, 'medical_officer'::user_role));
   ```

4. **Aggiornare `has_role_in_company`**: nessuna modifica necessaria, la funzione e gia generica e funziona con qualsiasi valore dell'enum.

---

### FASE 2: Frontend - Routing e Navigazione

**Modifica `src/App.tsx`**

Aggiungere `'medical_officer'` alle route a cui deve avere accesso:
- `/dashboard` - si (vista limitata)
- `/health-surveillance` - si
- `/employees` - si (sola lettura)

Non aggiungere a: `/payroll`, `/presence`, `/contract`, `/compliance`, `/reports`, `/documents`, `/settings`, `/simulator`, `/companies`.

**Modifica `src/components/Navbar.tsx`**

- Mostrare nel menu solo le voci accessibili al medical_officer:
  - Dashboard
  - Sorveglianza Sanitaria (come voce diretta, non dentro il dropdown Compliance)
  - Elenco Dipendenti (sola lettura, dentro un dropdown o come voce singola)
- Nascondere: Dipendenti (dropdown completo con presenze/cedolini/contratti), Compliance, Documenti, Report, Simulatore, Gestione Aziende, Impostazioni

Logica: aggiungere un check `hasRole('medical_officer')` e creare un menu dedicato quando l'utente ha solo quel ruolo.

**Modifica `src/pages/HealthSurveillance.tsx`**

Il medical_officer avra accesso completo alle funzionalita sanitarie (azioni rapide, gestione protocolli, giudizi, timeline, ecc.). Aggiornare la condizione `isEmployee` per escludere medical_officer:
```typescript
const isEmployee = hasRole('employee') && !hasRole('admin') && !hasRole('hr_manager') && !hasRole('medical_officer');
```

**Modifica `src/pages/Dashboard.tsx`**

Per il medical_officer, mostrare una dashboard ridotta con sole statistiche sanitarie (cartelle attive, visite in scadenza) invece delle statistiche HR/payroll. Aggiungere un blocco condizionale che verifichi il ruolo e mostri le card appropriate.

**Modifica `src/pages/Employees.tsx`**

Il medical_officer potra solo visualizzare la lista dipendenti senza poter aggiungere, modificare o eliminare. Nascondere i pulsanti di azione quando il ruolo e medical_officer.

---

### FASE 3: Aggiornamento hook useAuth

Nessuna modifica strutturale necessaria. Il ruolo `medical_officer` viene gia gestito dal sistema esistente (tabella `user_roles`, funzione `has_role_in_company`, hook `useAuth` con `hasRole()`).

---

### FASE 4: Gestione assegnazione ruolo

**Modifica `src/components/settings/UserRolesManagement.tsx`**

Aggiungere `medical_officer` alla lista dei ruoli selezionabili quando un admin assegna ruoli agli utenti, con etichetta "Medico Competente" e descrizione appropriata.

**Modifica `src/components/superadmin/HRSourcesTab.tsx`** (se gestisce ruoli)

Aggiungere il nuovo ruolo alla lista disponibile.

---

### Riepilogo file

| File | Azione |
|------|--------|
| Migration SQL | Nuovo - ALTER TYPE + aggiornamento 8+ RLS policies + nuova policy employees |
| `src/App.tsx` | Modifica - aggiungere 'medical_officer' a 3 route |
| `src/components/Navbar.tsx` | Modifica - menu dedicato per medical_officer |
| `src/pages/HealthSurveillance.tsx` | Modifica - includere medical_officer nelle azioni |
| `src/pages/Dashboard.tsx` | Modifica - dashboard sanitaria per medical_officer |
| `src/pages/Employees.tsx` | Modifica - sola lettura per medical_officer |
| `src/components/settings/UserRolesManagement.tsx` | Modifica - aggiungere ruolo alla selezione |

### Nota sulla sicurezza

Il medical_officer NON avra policy RLS su: `payroll_records`, `payroll_settings`, `presence`, `employment_contracts`, `ccnl_contracts`, `companies` (gestione), `f24_*`, `tax_*`. L'isolamento e garantito a livello database: anche se l'utente tentasse di accedere via API, le RLS bloccano qualsiasi lettura/scrittura su dati non sanitari.

