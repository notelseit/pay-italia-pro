import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePayrollSettings } from "@/hooks/usePayrollSettings";
import { Plus, Trash2, Save } from "lucide-react";

interface PayrollSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function PayrollSettingsDialog({ open, onOpenChange, companyId }: PayrollSettingsDialogProps) {
  const { settings, isLoading, updateSettings } = usePayrollSettings(companyId);
  
  const [irpefBrackets, setIrpefBrackets] = useState(settings?.irpef_brackets || []);
  const [inpsEmployeeRate, setInpsEmployeeRate] = useState(settings?.inps_employee_rate || 0);
  const [inpsEmployerRate, setInpsEmployerRate] = useState(settings?.inps_employer_rate || 0);
  const [tfrRate, setTfrRate] = useState(settings?.tfr_rate || 0);
  const [inailRate, setInailRate] = useState(settings?.inail_rate || 0);
  const [regionalTaxRate, setRegionalTaxRate] = useState(settings?.regional_tax_rate || 0);
  const [municipalTaxRate, setMunicipalTaxRate] = useState(settings?.municipal_tax_rate || 0);
  const [workDeductions, setWorkDeductions] = useState(settings?.work_deductions || []);
  const [deductionPerChild, setDeductionPerChild] = useState(settings?.deduction_per_child || 0);

  useEffect(() => {
    if (settings) {
      setIrpefBrackets(settings.irpef_brackets);
      setInpsEmployeeRate(settings.inps_employee_rate);
      setInpsEmployerRate(settings.inps_employer_rate);
      setTfrRate(settings.tfr_rate);
      setInailRate(settings.inail_rate);
      setRegionalTaxRate(settings.regional_tax_rate);
      setMunicipalTaxRate(settings.municipal_tax_rate);
      setWorkDeductions(settings.work_deductions);
      setDeductionPerChild(settings.deduction_per_child);
    }
  }, [settings]);

  const handleSaveIRPEF = () => {
    updateSettings.mutate({ irpef_brackets: irpefBrackets });
  };

  const handleSaveINPS = () => {
    updateSettings.mutate({ 
      inps_employee_rate: inpsEmployeeRate,
      inps_employer_rate: inpsEmployerRate,
    });
  };

  const handleSaveTFR = () => {
    updateSettings.mutate({ tfr_rate: tfrRate });
  };

  const handleSaveINAIL = () => {
    updateSettings.mutate({ inail_rate: inailRate });
  };

  const handleSaveAddizionali = () => {
    updateSettings.mutate({ 
      regional_tax_rate: regionalTaxRate,
      municipal_tax_rate: municipalTaxRate,
    });
  };

  const handleSaveDetrazioni = () => {
    updateSettings.mutate({ 
      work_deductions: workDeductions,
      deduction_per_child: deductionPerChild,
    });
  };

  const addIRPEFBracket = () => {
    setIrpefBrackets([...irpefBrackets, { min: 0, max: null, rate: 0 }]);
  };

  const removeIRPEFBracket = (index: number) => {
    setIrpefBrackets(irpefBrackets.filter((_, i) => i !== index));
  };

  const updateIRPEFBracket = (index: number, field: string, value: any) => {
    const updated = [...irpefBrackets];
    updated[index] = { ...updated[index], [field]: value };
    setIrpefBrackets(updated);
  };

  const addWorkDeduction = () => {
    setWorkDeductions([...workDeductions, { max_income: 0, deduction: 0 }]);
  };

  const removeWorkDeduction = (index: number) => {
    setWorkDeductions(workDeductions.filter((_, i) => i !== index));
  };

  const updateWorkDeduction = (index: number, field: string, value: number) => {
    const updated = [...workDeductions];
    updated[index] = { ...updated[index], [field]: value };
    setWorkDeductions(updated);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurazione Parametri Cedolini</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="irpef" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="irpef">IRPEF</TabsTrigger>
            <TabsTrigger value="inps">INPS</TabsTrigger>
            <TabsTrigger value="detrazioni">Detrazioni</TabsTrigger>
            <TabsTrigger value="addizionali">Addizionali</TabsTrigger>
            <TabsTrigger value="tfr">TFR/INAIL</TabsTrigger>
          </TabsList>

          <TabsContent value="irpef" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scaglioni IRPEF</CardTitle>
                <CardDescription>Configura gli scaglioni per il calcolo dell'IRPEF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {irpefBrackets.map((bracket, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Da (€)</Label>
                      <Input
                        type="number"
                        value={bracket.min}
                        onChange={(e) => updateIRPEFBracket(index, "min", Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>A (€)</Label>
                      <Input
                        type="number"
                        value={bracket.max || ""}
                        placeholder="Infinito"
                        onChange={(e) => updateIRPEFBracket(index, "max", e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Aliquota (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(bracket.rate * 100).toFixed(2)}
                        onChange={(e) => updateIRPEFBracket(index, "rate", Number(e.target.value) / 100)}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeIRPEFBracket(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={addIRPEFBracket} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Scaglione
                  </Button>
                  <Button onClick={handleSaveIRPEF}>
                    <Save className="mr-2 h-4 w-4" />
                    Salva
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contributi INPS</CardTitle>
                <CardDescription>Configura le aliquote INPS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Aliquota INPS Dipendente (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(inpsEmployeeRate * 100).toFixed(2)}
                    onChange={(e) => setInpsEmployeeRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(inpsEmployeeRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <Label>Aliquota INPS Datore di Lavoro (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(inpsEmployerRate * 100).toFixed(2)}
                    onChange={(e) => setInpsEmployerRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(inpsEmployerRate * 100).toFixed(2)}%
                  </p>
                </div>
                <Button onClick={handleSaveINPS}>
                  <Save className="mr-2 h-4 w-4" />
                  Salva
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detrazioni" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detrazioni Fiscali</CardTitle>
                <CardDescription>Configura le detrazioni per lavoro dipendente e familiari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Detrazioni Lavoro Dipendente</h4>
                  {workDeductions.map((deduction, index) => (
                    <div key={index} className="flex gap-4 items-end mb-3">
                      <div className="flex-1">
                        <Label>Reddito Massimo (€)</Label>
                        <Input
                          type="number"
                          value={deduction.max_income}
                          onChange={(e) => updateWorkDeduction(index, "max_income", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Detrazione (€)</Label>
                        <Input
                          type="number"
                          value={deduction.deduction}
                          onChange={(e) => updateWorkDeduction(index, "deduction", Number(e.target.value))}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeWorkDeduction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addWorkDeduction} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Soglia
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Label>Detrazione per Figlio a Carico (€)</Label>
                  <Input
                    type="number"
                    value={deductionPerChild}
                    onChange={(e) => setDeductionPerChild(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: €{deductionPerChild}
                  </p>
                </div>
                
                <Button onClick={handleSaveDetrazioni}>
                  <Save className="mr-2 h-4 w-4" />
                  Salva
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addizionali" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Addizionali Regionali e Comunali</CardTitle>
                <CardDescription>Configura le aliquote delle addizionali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Addizionale Regionale (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(regionalTaxRate * 100).toFixed(2)}
                    onChange={(e) => setRegionalTaxRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(regionalTaxRate * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <Label>Addizionale Comunale (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(municipalTaxRate * 100).toFixed(2)}
                    onChange={(e) => setMunicipalTaxRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(municipalTaxRate * 100).toFixed(2)}%
                  </p>
                </div>
                <Button onClick={handleSaveAddizionali}>
                  <Save className="mr-2 h-4 w-4" />
                  Salva
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tfr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>TFR e INAIL</CardTitle>
                <CardDescription>Configura le aliquote TFR e INAIL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Aliquota TFR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(tfrRate * 100).toFixed(2)}
                    onChange={(e) => setTfrRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(tfrRate * 100).toFixed(2)}%
                  </p>
                </div>
                <Button onClick={handleSaveTFR}>
                  <Save className="mr-2 h-4 w-4" />
                  Salva TFR
                </Button>

                <div className="pt-4 border-t">
                  <Label>Aliquota INAIL (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(inailRate * 100).toFixed(2)}
                    onChange={(e) => setInailRate(Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Attualmente: {(inailRate * 100).toFixed(2)}%
                  </p>
                </div>
                <Button onClick={handleSaveINAIL}>
                  <Save className="mr-2 h-4 w-4" />
                  Salva INAIL
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
