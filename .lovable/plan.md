

## Piano: Aggiungere Sidebar Verticale (mantenendo la Navbar)

### Panoramica
Aggiungere una sidebar verticale sul lato sinistro delle pagine protette, **senza rimuovere** la Navbar orizzontale esistente. La sidebar duplica/espande la navigazione con icone e sotto-menu.

### File da creare

**1. `src/components/AppSidebar.tsx`** (nuovo)
- Usa i componenti shadcn `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` già presenti
- Collapsibile a icone (`collapsible="icon"`)
- Voci di navigazione con icone Lucide:
  - Dashboard (`LayoutDashboard`)
  - Dipendenti (`Users`) → sotto-voci: Elenco, Presenze, Cedolini, Contratti
  - Compliance (`Shield`) → sotto-voci: Adempimenti Fiscali, Sorveglianza Sanitaria
  - Documenti (`FileText`)
  - Report (`BarChart3`)
  - Simulatore (`Calculator`)
  - Aziende (`Building2`) — solo superadmin/admin
  - Impostazioni (`Settings`) — solo admin
  - SuperAdmin (`ShieldCheck`) — solo superadmin
- Visibilità voci basata su `hasRole()` (stessa logica della Navbar)
- Highlight route attiva via `useLocation`
- Pulsante logout in fondo

**2. `src/components/AppLayout.tsx`** (nuovo)
- Wrappa `SidebarProvider` + `AppSidebar` + contenuto
- Mantiene la `Navbar` in alto dentro il contenuto principale
- Layout: sidebar a sinistra, a destra colonna con Navbar + contenuto pagina
- `SidebarTrigger` nell'header per toggle

**3. `src/App.tsx`** (aggiornare)
- Wrappare tutte le route protette con `AppLayout` invece di renderle direttamente
- Landing, Login, ResetPassword restano senza layout

### Struttura layout risultante
```text
┌──────────┬──────────────────────────────┐
│          │  Navbar orizzontale (top)     │
│ Sidebar  ├──────────────────────────────┤
│ (icons)  │                              │
│          │  Contenuto pagina            │
│          │                              │
└──────────┴──────────────────────────────┘
```

### File NON modificati
- `src/components/Navbar.tsx` — resta invariato
- Pagine individuali — restano invariate (continuano a importare e usare `<Navbar />`)

### Dipendenze
Nessuna nuova — usa shadcn Sidebar (`src/components/ui/sidebar.tsx`) + Lucide icons già presenti.

