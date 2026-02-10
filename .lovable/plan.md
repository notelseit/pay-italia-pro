

## Piano: Simulatore di Costo Azienda

### Panoramica
Creare una pagina dedicata `/simulator` con un wizard a step che riutilizza il motore `payrollCalculations.ts` per calcolare in tempo reale netto stimato, costo azienda e breakdown fiscale/contributivo. Nessun salvataggio DB, solo calcolo client-side con export PDF.

---

### FASE 1: Funzione di simulazione dedicata

**Nuovo file: `src/lib/simulatorCalculations.ts`**

Funzione wrapper che estende `calculatePayroll` con logica specifica per la simulazione:
- Input: RAL (annuale) o lordo mensile, CCNL opzionale, tipo contratto, regione/comune, figli a carico
- Converte RAL in lordo mensile dividendo per numero mensilita (13 o 14 in base al CCNL)
- Calcola addizionali regionali/comunali con aliquote personalizzate per regione (tabella statica con le 20 regioni italiane + aliquote medie comunali)
- Output esteso rispetto a `PayrollResult`: include INAIL datore, costo azienda annuale, breakdown percentuali, cuneo fiscale
- Supporto confronto tra due configurazioni (restituisce delta per ogni voce)

Interfacce principali:
```
SimulatorInput {
  inputType: 'ral' | 'mensile'
  amount: number
  ccnlContract?: CCNLContractData
  contractType: 'indeterminato' | 'determinato' | 'apprendistato'
  region: string
  municipality: string
  dependentsCount: number
}

SimulatorResult extends PayrollResult {
  annualGross, annualNet, annualTotalCost
  inailEmployer, cuneo fiscale %
  breakdownPercentages: { irpef%, inps%, regional%, municipal% }
}
```

---

### FASE 2: Tabelle aliquote regionali/comunali

**Nuovo file: `src/lib/italianTaxRates.ts`**

Tabella statica (no DB) con:
- 20 regioni italiane + aliquote addizionale regionale 2025 (da 1.23% Lombardia a 3.33% Lazio per scaglioni alti)
- Aliquote comunali medie per i capoluoghi principali
- Funzioni helper: `getRegionalRate(region, income)` e `getMunicipalRate(municipality)`

---

### FASE 3: Generatore PDF simulazione

**Nuovo file: `src/lib/simulatorPdfGenerator.ts`**

PDF dedicato (non riutilizza il PDF cedolino perche la struttura e diversa):
- Header: "Simulazione Costo Azienda - PayHub"
- Sezione input (RAL, CCNL, contratto, regione)
- Tabella breakdown mensile e annuale
- Grafico placeholder (nota: i grafici Recharts non si esportano nativamente in jsPDF, si usa una tabella visiva con barre ASCII o percentuali)
- Se confronto attivo: tabella comparativa con delta
- Footer: "Documento generato a scopo informativo - non costituisce busta paga"

---

### FASE 4: Pagina Wizard a Step

**Nuovo file: `src/pages/Simulator.tsx`**

Wizard con 4 step usando Tabs di Shadcn:

**Step 1 - Retribuzione**
- Toggle RAL / Lordo mensile (RadioGroup)
- Campo importo (Input numerico con formattazione EUR)
- Select tipo contratto (indeterminato, determinato, apprendistato)

**Step 2 - Contratto CCNL**
- Select CCNL dalla lista caricata da DB (riutilizza `useCCNLContracts`)
- Preview: 13a/14a, buoni pasto, aliquote INPS/INAIL del CCNL selezionato
- Opzione "Nessun CCNL specifico" che usa valori standard

**Step 3 - Localizzazione e Famiglia**
- Select Regione (20 regioni)
- Select Comune (capoluoghi principali della regione selezionata)
- Input numero figli a carico

**Step 4 - Risultati**
- Card riepilogo: Lordo mensile, Netto stimato, Costo azienda
- Grafico a torta (Recharts PieChart) breakdown: IRPEF, INPS dipendente, Addizionali, Netto
- Grafico a barre (Recharts BarChart) per confronto mensile vs annuale
- Tabella dettagliata con tutte le voci
- Toggle "Confronta con altro contratto" che aggiunge una seconda colonna
- Pulsanti: "Esporta PDF", "Nuova simulazione"

---

### FASE 5: Routing e Navigazione

**Modifica `src/App.tsx`**: aggiungere route `/simulator`
- Accessibile a: superadmin, admin, admin_sub_azienda, hr_manager

**Modifica `src/components/Navbar.tsx`**: aggiungere voce "Simulatore Costo" nel menu, sotto la sezione Dipendenti o come voce autonoma con icona Calculator

---

### FASE 6: Confronto tra contratti (opzionale integrato)

Nello Step 4, un toggle "Attiva confronto" mostra:
- Un secondo set di input ridotto (solo CCNL + tipo contratto)
- I risultati affiancati in due colonne
- Delta evidenziato in verde (risparmio) o rosso (costo aggiuntivo)

---

### Riepilogo file

| File | Azione |
|------|--------|
| `src/lib/simulatorCalculations.ts` | Nuovo - funzione di simulazione |
| `src/lib/italianTaxRates.ts` | Nuovo - aliquote regionali/comunali |
| `src/lib/simulatorPdfGenerator.ts` | Nuovo - generatore PDF simulazione |
| `src/pages/Simulator.tsx` | Nuovo - pagina wizard |
| `src/App.tsx` | Modifica - aggiunta route |
| `src/components/Navbar.tsx` | Modifica - voce menu |

Nessuna migrazione DB necessaria. Nessuna edge function. Tutto client-side.

