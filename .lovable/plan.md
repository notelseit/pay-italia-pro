

## Piano: Presentazione Completa con Tutte le Pagine

### Panoramica
Espandere la presentazione v3 aggiungendo slide per TUTTE le pagine mancanti dell'applicazione. La v3 copre 7 sezioni; mancano 6 pagine.

### Pagine gia presenti (v3)
Landing, Login, Dashboard, Dipendenti, Payroll, Presenze, Sorveglianza Sanitaria (descrittiva), Report/Compliance (descrittiva), Adempimenti Fiscali (descrittiva)

### Pagine da aggiungere

| # | Pagina | Route | Descrizione slide |
|---|--------|-------|-------------------|
| 1 | Contratti | /contract | Gestione contratti di lavoro e CCNL |
| 2 | Documenti | /documents | Archivio documentale aziendale |
| 3 | Gestione Aziende | /companies | Multi-tenant, gestione sedi e filiali |
| 4 | Simulatore | /simulator | Simulazione costi del lavoro |
| 5 | Impostazioni | /settings | Configurazione sistema, ruoli, email |
| 6 | Super Admin | /superadmin | Pannello amministrazione globale |

### Approccio
1. Catturare screenshot via Puppeteer per le 6 pagine mancanti (richiede login attivo)
2. Rigenerare la presentazione completa con tutte le 15+ slide
3. Mantenere lo stesso stile grafico della v3 (palette Notelseit, layout consistente)
4. QA visiva su tutte le slide

### Struttura finale (circa 18 slide)
1. Titolo
2. Profilo Aziendale
3. Panoramica Piattaforma (screenshot landing)
4. Funzionalita Principali
5. Interfaccia Utente (screenshot login + features)
6. Dashboard HR (screenshot)
7. Gestione Dipendenti (screenshot)
8. Payroll & Cedolini (screenshot)
9. Presenze & Calendario (screenshot)
10. Contratti di Lavoro (screenshot)
11. Documenti (screenshot)
12. Gestione Aziende (screenshot)
13. Simulatore Costi (screenshot)
14. Sorveglianza Sanitaria (descrittiva)
15. Report e Compliance (descrittiva)
16. Adempimenti Fiscali (descrittiva)
17. Impostazioni e Super Admin (screenshot/descrittiva)
18. Tech Stack & Sicurezza
19. Contatti e CTA

### Output
- `PayHub_Notelseit_Presentazione_v4.pptx` in `/mnt/documents/`

### Prerequisito
Login attivo nel preview per catturare le pagine interne.

