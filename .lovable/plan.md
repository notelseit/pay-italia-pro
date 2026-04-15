

## Piano: Login Full-Page con Pannelli Animati

### Panoramica
Sostituire la pagina login attuale (Card centrata con toggle) con un layout full-page a due pannelli scorrevoli, ispirato al componente fornito. Pannello sinistro/destro si animano per passare tra Sign In e Sign Up.

### File da modificare/creare

**1. `src/components/ui/auth-switch.tsx`** — Riscrivere completamente
- Componente full-page con due pannelli (sign-in / sign-up) e overlay animato
- CSS inline via `<style>` tag per le animazioni di sliding (::before pseudo-element, transitions)
- Responsive: layout verticale sotto 870px
- Icone social con Lucide (Facebook, Twitter/X, Google, LinkedIn placeholder via SVG)
- Props: callback `onSignIn`, `onSignUp` per collegare la logica auth esistente
- Testi in italiano ("Accedi", "Registrati", "Nuovo qui?", "Già registrato?")

**2. `src/pages/Login.tsx`** — Aggiornare
- Rimuovere Card/CardHeader/AuthSwitch toggle attuale
- Usare il nuovo componente full-page come layout principale
- Mantenere tutta la logica esistente: `handleLogin`, `handleRegister`, `handleForgotPassword`, validazione Zod, useAuth, redirect se loggato
- Integrare i form dentro il componente (i campi input restano gli stessi: email, password, fullName, companyName, confirmPassword)
- Mantenere il dialog "Password dimenticata"
- Logo PayHub nell'header

### Adattamenti dal codice fornito
- Convertire CSS raw in Tailwind dove possibile, mantenere `<style>` solo per animazioni complesse (::before, transitions)
- Sostituire emoji (📧🔒👤) con icone Lucide (`Mail`, `Lock`, `User`)
- Usare i colori del design system (primary HSL 217 83% 51%) invece di hardcoded `#5995fd`
- Aggiungere i campi mancanti per la registrazione PayHub (Nome Azienda, Conferma Password)
- Social icons: solo visual per ora (non funzionali), usando Lucide

### Nessuna nuova dipendenza

