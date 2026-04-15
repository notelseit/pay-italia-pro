

## Piano: Creare AuthSwitch e Aggiornare Login

### Panoramica
Creare un componente `AuthSwitch` animato in `/components/ui/auth-switch.tsx` che sostituisce i Tabs attuali nella pagina Login con un toggle switch stilizzato per passare tra Login e Registrazione.

### Componente AuthSwitch

Creare `src/components/ui/auth-switch.tsx`:
- Toggle pill/switch animato con due opzioni: "Accedi" e "Registrati"
- Stato controllato via props (`mode: 'login' | 'register'`, `onModeChange`)
- Animazione sliding con `transition-all` Tailwind
- Stile coerente con il design system (colori primary, border-radius, shadow)
- Nessuna dipendenza esterna aggiuntiva (usa solo `cn`, `useState`, Tailwind)

### Aggiornamento Login.tsx

1. Sostituire `Tabs`/`TabsList`/`TabsTrigger` con `AuthSwitch`
2. Usare stato locale `mode` per mostrare/nascondere i form login e register
3. Correggere il bug HTML esistente: doppio tag `<h1>` annidato alla riga 149
4. Ripristinare `grid-cols-2` (attualmente `grid-cols-1`, il tab Registrati non è visibile)

### Dipendenze
Nessuna nuova — usa solo `cn` da `@/lib/utils` e Tailwind CSS.

### File modificati
- `src/components/ui/auth-switch.tsx` (nuovo)
- `src/pages/Login.tsx` (aggiornato)

