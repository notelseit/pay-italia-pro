

## Piano: Aggiungere Slide con Screenshot Pagine Interne

### Panoramica
Espandere la presentazione esistente aggiungendo 4 nuove slide con screenshot delle pagine interne dell'app: Dashboard, Dipendenti (Employees), Payroll e Presenze (Presence). Ogni slide mostrera uno screenshot con titolo e breve descrizione della funzionalita.

### Fasi

**1. Cattura Screenshot (Browser)**
- Navigare alle pagine `/dashboard`, `/employees`, `/payroll`, `/presence`
- Catturare screenshot ad alta risoluzione di ciascuna
- Nota: richiede login attivo nel preview

**2. Rigenerare Presentazione**
- Riutilizzare lo script pptxgenjs esistente
- Aggiungere 4 nuove slide dopo la slide 5 (UI attuale)
- Ogni slide: titolo + screenshot + didascalia descrittiva
- Layout: immagine grande centrata con titolo sopra

**3. Slide Aggiuntive**

| # | Titolo | Pagina | Descrizione |
|---|--------|--------|-------------|
| 6 | Dashboard HR | /dashboard | Panoramica KPI, scadenze e azioni rapide |
| 7 | Gestione Dipendenti | /employees | Anagrafica, contratti e documenti |
| 8 | Payroll & Cedolini | /payroll | Elaborazione stipendi e contributi |
| 9 | Presenze & Calendario | /presence | Calendario mensile interattivo |

Le slide esistenti 6-8 (Moduli, Tech Stack, CTA) slittano a 10-12.

**4. QA Visiva**
- Conversione PDF + immagini
- Verifica layout, testo e screenshot integrati

### Output
- File `PayHub_Notelseit_Presentazione_v2.pptx` in `/mnt/documents/`

### Prerequisito
L'utente deve essere loggato nel preview per catturare le pagine interne. Se non loggato, verra richiesto di farlo prima.

