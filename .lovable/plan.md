

## Piano: Sostituire "Unilabgroup" con "Notelseit"

Sostituire tutte le occorrenze del brand "Unilabgroup" / "UNILAB GROUP" con "Notelseit" / "NOTELSEIT" nei seguenti file:

### Modifiche

| File | Riga | Da | A |
|------|------|----|---|
| `src/pages/Login.tsx` | 149 | `PayHub by Unilabgroup` | `PayHub by Notelseit` |
| `src/pages/Landing.tsx` | 50 | `PayHub by Unilabgroup` | `PayHub by Notelseit` |
| `src/pages/Landing.tsx` | 64 | `by Unilabgroup` | `by Notelseit` |
| `src/pages/Landing.tsx` | 133 | `PayHub by UNILAB GROUP S.R.L.S.` + P.IVA | `PayHub by NOTELSEIT S.R.L.S.` (aggiornare ragione sociale; P.IVA e indirizzo restano invariati salvo indicazione diversa) |
| `src/components/Navbar.tsx` | 95 | `PayHub by UnilabGroup` | `PayHub by Notelseit` |
| `src/lib/simulatorPdfGenerator.ts` | 32 | `PayHub by UnilabGroup` | `PayHub by Notelseit` |

**Nota**: La migrazione SQL (riga 51-57) contiene email `crm@unilabgroup.it` nelle impostazioni email iniziali. Queste sono dati seed nel database già eseguiti e non vengono modificate dalla migrazione. Se serve aggiornare anche le email nel DB, sarà necessaria una nuova migrazione.

