import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateF24 } from "@/lib/complianceGenerators";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const F24 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [month, setMonth] = useState("");
  const [paymentType, setPaymentType] = useState("Mensilità corrente");

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

  const handleGenerateF24 = async () => {
    if (!month) {
      toast.error("Seleziona il mese di riferimento");
      return;
    }

    const company = await fetchCompanyData();
    if (!company) return;

    const [year, monthNum] = month.split("-");
    const { data: payrollRecords } = await supabase
      .from("payroll_records")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .eq("month", parseInt(monthNum))
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

    await generateF24(month, paymentType, mappedRecords, company);
    toast.success("Modello F24 generato con successo");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/compliance")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ad Adempimenti Fiscali
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 text-foreground">Modello F24</h1>
          <p className="text-muted-foreground">
            Modello di pagamento unificato - Agenzia delle Entrate
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Dati del Contribuente */}
          <Card>
            <CardHeader>
              <CardTitle>Dati del Contribuente</CardTitle>
              <CardDescription>
                I dati aziendali verranno compilati automaticamente dal sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                ✓ Codice Fiscale / P.IVA<br />
                ✓ Denominazione<br />
                ✓ Domicilio fiscale
              </div>
            </CardContent>
          </Card>

          {/* Periodo di Riferimento */}
          <Card>
            <CardHeader>
              <CardTitle>Periodo di Riferimento</CardTitle>
              <CardDescription>
                Seleziona il mese per cui generare il modello F24
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mese di Riferimento</Label>
                <Input 
                  id="month" 
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-type">Tipo Versamento</Label>
                <Input 
                  id="payment-type" 
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  placeholder="Es: Mensilità corrente, Saldo, Acconto"
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sezioni del Modello */}
          <Card>
            <CardHeader>
              <CardTitle>Sezioni del Modello F24</CardTitle>
              <CardDescription>
                Il modello includerà automaticamente le seguenti sezioni
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-primary/5 p-3 rounded-md">
                <h4 className="font-semibold text-sm mb-1">Imposte Dirette - IVA - Ritenute alla Fonte</h4>
                <p className="text-xs text-muted-foreground">
                  • Codice tributo 1001: IRPEF su redditi da lavoro dipendente
                </p>
              </div>
              
              <div className="bg-secondary/10 p-3 rounded-md">
                <h4 className="font-semibold text-sm mb-1">Sezione INPS</h4>
                <p className="text-xs text-muted-foreground">
                  • Causale M001: Contributi previdenziali dipendenti
                </p>
              </div>

              <div className="bg-accent/10 p-3 rounded-md">
                <h4 className="font-semibold text-sm mb-1">Calcolo Automatico</h4>
                <p className="text-xs text-muted-foreground">
                  • Totali debiti/crediti<br />
                  • Saldo finale da versare
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Note Importanti */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-orange-900">Note Importanti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-orange-800">
              <p>
                ⚠️ Il modello F24 deve essere presentato esclusivamente in via telematica tramite:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Home banking del proprio istituto di credito</li>
                <li>Servizi Entratel o Fisconline dell'Agenzia delle Entrate</li>
                <li>Intermediari abilitati</li>
              </ul>
              <p className="mt-3">
                📅 Scadenza: entro il 16 del mese successivo al periodo di riferimento
              </p>
            </CardContent>
          </Card>

          {/* Genera Modello */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleGenerateF24} 
                variant="hero"
                size="lg"
                className="w-full"
              >
                Genera Modello F24
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default F24;
