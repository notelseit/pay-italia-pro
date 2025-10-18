import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Building2, Users, Bell, Shield, FileText, FileCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("company");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Impostazioni</h1>
          <p className="text-muted-foreground">Configura il tuo account e le preferenze aziendali</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  <Button 
                    variant={activeSection === "company" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveSection("company")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Dati Azienda
                  </Button>
                  <Button 
                    variant={activeSection === "fiscal" ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveSection("fiscal")}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    Adempimenti Fiscali
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Users className="mr-2 h-4 w-4" />
                    Utenti e Ruoli
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifiche
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <Shield className="mr-2 h-4 w-4" />
                    Sicurezza
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Documenti
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeSection === "company" && (
              <>
                {/* Company Information */}
                <Card>
              <CardHeader>
                <CardTitle>Informazioni Azienda</CardTitle>
                <CardDescription>
                  Dati anagrafici e informazioni fiscali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Ragione Sociale</Label>
                    <Input id="company-name" defaultValue="Azienda Demo S.r.l." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">Partita IVA</Label>
                    <Input id="vat" defaultValue="IT12345678901" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Indirizzo Sede Legale</Label>
                  <Input id="address" defaultValue="Via Roma 123, 20100 Milano" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input id="phone" defaultValue="+39 02 12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Aziendale</Label>
                    <Input id="email" type="email" defaultValue="info@aziendademo.it" />
                  </div>
                </div>

                <Separator className="my-4" />

                <Button variant="hero">Salva Modifiche</Button>
              </CardContent>
            </Card>

            {/* Work Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configurazione Lavoro</CardTitle>
                <CardDescription>
                  Orari e parametri contrattuali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work-hours">Ore Lavorative Settimanali</Label>
                    <Input id="work-hours" type="number" defaultValue="40" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work-days">Giorni Lavorativi Mensili</Label>
                    <Input id="work-days" type="number" defaultValue="22" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="overtime">Calcolo Straordinari</Label>
                      <p className="text-sm text-muted-foreground">
                        Abilita il calcolo automatico delle ore straordinarie
                      </p>
                    </div>
                    <Switch id="overtime" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-payroll">Generazione Automatica Cedolini</Label>
                      <p className="text-sm text-muted-foreground">
                        Genera cedolini automaticamente a fine mese
                      </p>
                    </div>
                    <Switch id="auto-payroll" />
                  </div>
                </div>

                <Separator className="my-4" />

                <Button variant="hero">Salva Configurazione</Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Preferenze Notifiche</CardTitle>
                <CardDescription>
                  Gestisci le notifiche email e in-app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-payroll">Cedolini Generati</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifica quando i cedolini sono pronti
                    </p>
                  </div>
                  <Switch id="notif-payroll" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-deadlines">Scadenze Fiscali</Label>
                    <p className="text-sm text-muted-foreground">
                      Promemoria per pagamenti INPS e IRPEF
                    </p>
                  </div>
                  <Switch id="notif-deadlines" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-compliance">Alert Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Avvisi per documenti in scadenza
                    </p>
                  </div>
                  <Switch id="notif-compliance" defaultChecked />
                </div>

                <Separator className="my-4" />

                <Button variant="hero">Salva Preferenze</Button>
              </CardContent>
            </Card>
              </>
            )}

            {activeSection === "fiscal" && (
              <>
                {/* UNIEMENS */}
                <Card>
                  <CardHeader>
                    <CardTitle>UNIEMENS</CardTitle>
                    <CardDescription>
                      Denuncia mensile delle retribuzioni e contributi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="uniemens-month">Mese di Riferimento</Label>
                      <Input id="uniemens-month" type="month" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uniemens-code">Codice Azienda INPS</Label>
                      <Input id="uniemens-code" placeholder="Inserisci il codice azienda" />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="hero">Genera UNIEMENS</Button>
                      <Button variant="outline">Scarica Ultimo File</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* F24 */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modello F24</CardTitle>
                    <CardDescription>
                      Versamento unificato imposte e contributi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="f24-month">Mese di Riferimento</Label>
                        <Input id="f24-month" type="month" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="f24-type">Tipo Versamento</Label>
                        <Input id="f24-type" placeholder="INPS / IRPEF / Altro" />
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="hero">Genera F24</Button>
                      <Button variant="outline">Scarica Ultimi Modelli</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Modello 770 */}
                <Card>
                  <CardHeader>
                    <CardTitle>Modello 770</CardTitle>
                    <CardDescription>
                      Dichiarazione annuale sostituti d'imposta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="m770-year">Anno di Riferimento</Label>
                      <Input id="m770-year" type="number" placeholder="2024" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="m770-simplify">Modello Semplificato</Label>
                        <p className="text-sm text-muted-foreground">
                          Per aziende con meno di 20 dipendenti
                        </p>
                      </div>
                      <Switch id="m770-simplify" />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="hero">Genera Modello 770</Button>
                      <Button variant="outline">Verifica Dati</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificazione Unica */}
                <Card>
                  <CardHeader>
                    <CardTitle>Certificazione Unica (CU)</CardTitle>
                    <CardDescription>
                      Certificazione dei redditi di lavoro dipendente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cu-year">Anno di Riferimento</Label>
                      <Input id="cu-year" type="number" placeholder="2024" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="cu-all">Genera per Tutti i Dipendenti</Label>
                        <p className="text-sm text-muted-foreground">
                          Crea CU per tutti i dipendenti attivi
                        </p>
                      </div>
                      <Switch id="cu-all" defaultChecked />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="hero">Genera CU</Button>
                      <Button variant="outline">Invia ai Dipendenti</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Autoliquidazione INAIL */}
                <Card>
                  <CardHeader>
                    <CardTitle>Autoliquidazione INAIL</CardTitle>
                    <CardDescription>
                      Premio assicurativo contro infortuni sul lavoro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inail-year">Anno di Riferimento</Label>
                        <Input id="inail-year" type="number" placeholder="2024" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inail-code">Codice Ditta INAIL</Label>
                        <Input id="inail-code" placeholder="Inserisci codice ditta" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inail-retrib">Retribuzioni Imponibili Totali</Label>
                      <Input id="inail-retrib" type="number" placeholder="0.00" />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="hero">Genera Autoliquidazione</Button>
                      <Button variant="outline">Calcola Premio</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
