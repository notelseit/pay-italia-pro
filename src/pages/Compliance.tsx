import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  generateUNIEMENS,
  generateModello770,
  generateCertificazioneUnica,
  generateAutoliquidazioneINAIL,
} from "@/lib/complianceGenerators";

const Compliance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uniemensMonth, setUniemensMonth] = useState("");
  const [uniemensCode, setUniemensCode] = useState("");
  const [m770Year, setM770Year] = useState("");
  const [m770Simplified, setM770Simplified] = useState(false);
  const [cuYear, setCuYear] = useState("");
  const [inailYear, setInailYear] = useState("");
  const [inailCode, setInailCode] = useState("");
  const [inailRetrib, setInailRetrib] = useState("");

  const fetchCompanyData = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user?.id)
      .single();

    if (!profile?.company_id) {
      toast.error("Dati azienda non trovati");
      return null;
    }

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    return company;
  };

  const handleGenerateUNIEMENS = async () => {
    if (!uniemensMonth || !uniemensCode) {
      toast.error("Compila tutti i campi");
      return;
    }

    const company = await fetchCompanyData();
    if (!company) return;

    const [year, month] = uniemensMonth.split("-");
    const { data: payrollRecords } = await supabase
      .from("payroll_records")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .eq("month", parseInt(month))
      .eq("year", parseInt(year));

    if (!payrollRecords || payrollRecords.length === 0) {
      toast.error("Nessun cedolino trovato per il periodo selezionato");
      return;
    }

    const mappedRecords = payrollRecords.map((r: any) => ({
      employee_full_name: r.employees?.full_name || "N/A",
      gross_total: r.gross_total,
      net_salary: r.net_salary,
      irpef_tax: r.irpef_tax,
      inps_contribution: r.inps_contribution,
    }));

    generateUNIEMENS(uniemensMonth, uniemensCode, mappedRecords, company);
    toast.success("UNIEMENS generato con successo");
  };

  const handleGenerateM770 = async () => {
    if (!m770Year) {
      toast.error("Inserisci l'anno di riferimento");
      return;
    }

    const company = await fetchCompanyData();
    if (!company) return;

    const { data: payrollRecords } = await supabase
      .from("payroll_records")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .eq("year", parseInt(m770Year));

    if (!payrollRecords || payrollRecords.length === 0) {
      toast.error("Nessun cedolino trovato per l'anno selezionato");
      return;
    }

    const mappedRecords = payrollRecords.map((r: any) => ({
      employee_full_name: r.employees?.full_name || "N/A",
      gross_total: r.gross_total,
      net_salary: r.net_salary,
      irpef_tax: r.irpef_tax,
      inps_contribution: r.inps_contribution,
    }));

    generateModello770(parseInt(m770Year), m770Simplified, mappedRecords, company);
    toast.success("Modello 770 generato con successo");
  };

  const handleGenerateCU = async () => {
    if (!cuYear) {
      toast.error("Inserisci l'anno di riferimento");
      return;
    }

    const company = await fetchCompanyData();
    if (!company) return;

    const { data: payrollRecords } = await supabase
      .from("payroll_records")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .eq("year", parseInt(cuYear));

    if (!payrollRecords || payrollRecords.length === 0) {
      toast.error("Nessun cedolino trovato per l'anno selezionato");
      return;
    }

    const mappedRecords = payrollRecords.map((r: any) => ({
      employee_full_name: r.employees?.full_name || "N/A",
      gross_total: r.gross_total,
      net_salary: r.net_salary,
      irpef_tax: r.irpef_tax,
      inps_contribution: r.inps_contribution,
    }));

    generateCertificazioneUnica(parseInt(cuYear), mappedRecords, company);
    toast.success("Certificazione Unica generata con successo");
  };

  const handleGenerateINAIL = async () => {
    if (!inailYear || !inailCode || !inailRetrib) {
      toast.error("Compila tutti i campi");
      return;
    }

    const company = await fetchCompanyData();
    if (!company) return;

    generateAutoliquidazioneINAIL(
      parseInt(inailYear),
      inailCode,
      parseFloat(inailRetrib),
      company
    );
    toast.success("Autoliquidazione INAIL generata con successo");
  };

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
                <Input 
                  id="uniemens-month" 
                  type="month" 
                  value={uniemensMonth}
                  onChange={(e) => setUniemensMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniemens-code">Codice Azienda INPS</Label>
                <Input 
                  id="uniemens-code" 
                  placeholder="Inserisci il codice azienda"
                  value={uniemensCode}
                  onChange={(e) => setUniemensCode(e.target.value)}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleGenerateUNIEMENS}>Genera UNIEMENS</Button>
              </div>
            </CardContent>
          </Card>

          {/* F24 */}
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle>Modello F24</CardTitle>
              <CardDescription>
                Versamento unificato imposte e contributi - Agenzia delle Entrate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-md space-y-2">
                <p className="text-sm text-foreground">
                  Il modello F24 è utilizzato per il versamento unificato di:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Imposte dirette e IVA</li>
                  <li>• Ritenute alla fonte (IRPEF)</li>
                  <li>• Contributi INPS</li>
                  <li>• Tributi regionali e locali</li>
                </ul>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button 
                  variant="hero" 
                  onClick={() => navigate("/compliance/f24")}
                  className="w-full"
                >
                  Compila Modello F24
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
                <Input 
                  id="m770-year" 
                  type="number" 
                  placeholder="2024"
                  value={m770Year}
                  onChange={(e) => setM770Year(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="m770-simplify">Modello Semplificato</Label>
                  <p className="text-sm text-muted-foreground">
                    Per aziende con meno di 20 dipendenti
                  </p>
                </div>
                <Switch 
                  id="m770-simplify"
                  checked={m770Simplified}
                  onCheckedChange={setM770Simplified}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleGenerateM770}>Genera Modello 770</Button>
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
                <Input 
                  id="cu-year" 
                  type="number" 
                  placeholder="2024"
                  value={cuYear}
                  onChange={(e) => setCuYear(e.target.value)}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleGenerateCU}>Genera CU</Button>
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
                  <Input 
                    id="inail-year" 
                    type="number" 
                    placeholder="2024"
                    value={inailYear}
                    onChange={(e) => setInailYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inail-code">Codice Ditta INAIL</Label>
                  <Input 
                    id="inail-code" 
                    placeholder="Inserisci codice ditta"
                    value={inailCode}
                    onChange={(e) => setInailCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inail-retrib">Retribuzioni Imponibili Totali</Label>
                <Input 
                  id="inail-retrib" 
                  type="number" 
                  placeholder="0.00"
                  value={inailRetrib}
                  onChange={(e) => setInailRetrib(e.target.value)}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Button variant="hero" onClick={handleGenerateINAIL}>Genera Autoliquidazione</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Compliance;
