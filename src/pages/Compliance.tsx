import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const Compliance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Adempimenti Fiscali</h1>
          <p className="text-muted-foreground">Gestisci i documenti e gli adempimenti fiscali obbligatori</p>
        </div>

        <div className="space-y-6">
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
        </div>
      </main>
    </div>
  );
};

export default Compliance;
