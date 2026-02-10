import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  ArrowRight,
  ArrowLeft,
  FileDown,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import {
  runSimulation,
  compareSimulations,
  formatCurrency,
  type SimulatorInput,
  type SimulatorResult,
  type ComparisonResult,
} from "@/lib/simulatorCalculations";
import { generateSimulatorPdf } from "@/lib/simulatorPdfGenerator";
import {
  REGIONS_LIST,
  getMunicipalitiesByRegion,
  REGIONAL_TAX_RATES,
} from "@/lib/italianTaxRates";

const CHART_COLORS = [
  "hsl(0, 84%, 60%)",    // IRPEF - rosso
  "hsl(217, 83%, 51%)",  // INPS - blu
  "hsl(36, 100%, 50%)",  // Regionale - arancio
  "hsl(280, 60%, 50%)",  // Comunale - viola
  "hsl(142, 71%, 45%)",  // Netto - verde
];

const CONTRACT_TYPES = [
  { value: "indeterminato", label: "Tempo Indeterminato" },
  { value: "determinato", label: "Tempo Determinato" },
  { value: "apprendistato", label: "Apprendistato" },
];

const Simulator = () => {
  const { companyId } = useAuth();
  const { contracts: ccnlContracts, isLoading: ccnlLoading } = useCCNLContracts(
    companyId || undefined
  );

  const [activeStep, setActiveStep] = useState("step1");

  // Step 1
  const [inputType, setInputType] = useState<"ral" | "mensile">("ral");
  const [amount, setAmount] = useState<string>("30000");
  const [contractType, setContractType] = useState<string>("indeterminato");

  // Step 2
  const [selectedCcnlId, setSelectedCcnlId] = useState<string>("none");

  // Step 3
  const [region, setRegion] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [dependentsCount, setDependentsCount] = useState<string>("0");

  // Comparison
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [compCcnlId, setCompCcnlId] = useState<string>("none");
  const [compContractType, setCompContractType] = useState<string>("indeterminato");

  const municipalities = useMemo(
    () => (region ? getMunicipalitiesByRegion(region) : []),
    [region]
  );

  const selectedCcnl = useMemo(
    () => ccnlContracts?.find((c) => c.id === selectedCcnlId) || null,
    [ccnlContracts, selectedCcnlId]
  );

  const compCcnl = useMemo(
    () => ccnlContracts?.find((c) => c.id === compCcnlId) || null,
    [ccnlContracts, compCcnlId]
  );

  const buildInput = (
    ccnl: any | null,
    cType: string
  ): SimulatorInput => ({
    inputType,
    amount: parseFloat(amount) || 0,
    ccnlContract: ccnl
      ? {
          inps_rate: ccnl.inps_rate,
          inail_rate: ccnl.inail_rate,
          thirteenth_salary: ccnl.thirteenth_salary,
          fourteenth_salary: ccnl.fourteenth_salary,
          meal_voucher_amount: ccnl.meal_voucher_amount,
        }
      : undefined,
    contractType: cType as SimulatorInput["contractType"],
    region,
    municipality,
    dependentsCount: parseInt(dependentsCount) || 0,
  });

  const result: SimulatorResult | null = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0 || !region) return null;
    try {
      return runSimulation(buildInput(selectedCcnl, contractType));
    } catch {
      return null;
    }
  }, [amount, inputType, contractType, selectedCcnlId, region, municipality, dependentsCount]);

  const comparison: ComparisonResult | null = useMemo(() => {
    if (!comparisonEnabled || !result || !region) return null;
    try {
      return compareSimulations(
        buildInput(selectedCcnl, contractType),
        buildInput(compCcnl, compContractType)
      );
    } catch {
      return null;
    }
  }, [comparisonEnabled, result, compCcnlId, compContractType, selectedCcnl, contractType, region, municipality, dependentsCount, amount, inputType]);

  const pieData = result
    ? [
        { name: "IRPEF", value: result.breakdownPercentages.irpef },
        { name: "INPS", value: result.breakdownPercentages.inps },
        { name: "Add. Regionale", value: result.breakdownPercentages.regional },
        { name: "Add. Comunale", value: result.breakdownPercentages.municipal },
        { name: "Netto", value: result.breakdownPercentages.net },
      ]
    : [];

  const barData = result
    ? [
        {
          name: "Mensile",
          Lordo: result.grossSalary,
          Netto: result.netSalary,
          "Costo Azienda": result.totalCost,
        },
        {
          name: "Annuale",
          Lordo: result.annualGross,
          Netto: result.annualNet,
          "Costo Azienda": result.annualTotalCost,
        },
      ]
    : [];

  const handleReset = () => {
    setActiveStep("step1");
    setInputType("ral");
    setAmount("30000");
    setContractType("indeterminato");
    setSelectedCcnlId("none");
    setRegion("");
    setMunicipality("");
    setDependentsCount("0");
    setComparisonEnabled(false);
    setCompCcnlId("none");
    setCompContractType("indeterminato");
  };

  const handleExportPdf = () => {
    if (!result) return;
    generateSimulatorPdf(
      buildInput(selectedCcnl, contractType),
      result,
      comparison
    );
  };

  const canProceedStep1 = parseFloat(amount) > 0;
  const canProceedStep3 = !!region;

  const DeltaIndicator = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    if (value > 0) return <span className="text-green-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" />+{formatCurrency(value)}{suffix}</span>;
    if (value < 0) return <span className="text-destructive flex items-center gap-1"><TrendingDown className="h-3 w-3" />{formatCurrency(value)}{suffix}</span>;
    return <span className="text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" />{formatCurrency(0)}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Simulatore Costo Azienda</h1>
            <p className="text-sm text-muted-foreground">
              Calcola netto stimato, costo azienda e breakdown fiscale
            </p>
          </div>
        </div>

        <Tabs value={activeStep} onValueChange={setActiveStep}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="step1">1. Retribuzione</TabsTrigger>
            <TabsTrigger value="step2">2. CCNL</TabsTrigger>
            <TabsTrigger value="step3">3. Località</TabsTrigger>
            <TabsTrigger value="step4" disabled={!result}>4. Risultati</TabsTrigger>
          </TabsList>

          {/* STEP 1 */}
          <TabsContent value="step1">
            <Card>
              <CardHeader>
                <CardTitle>Retribuzione e Tipo Contratto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Tipo di importo</Label>
                  <RadioGroup value={inputType} onValueChange={(v) => setInputType(v as "ral" | "mensile")} className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ral" id="ral" />
                      <Label htmlFor="ral">RAL (Annuale)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="mensile" id="mensile" />
                      <Label htmlFor="mensile">Lordo Mensile</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>{inputType === "ral" ? "RAL Annuale (€)" : "Lordo Mensile (€)"}</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={inputType === "ral" ? "30000" : "2300"}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo Contratto</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveStep("step2")} disabled={!canProceedStep1}>
                    Avanti <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 2 */}
          <TabsContent value="step2">
            <Card>
              <CardHeader>
                <CardTitle>Contratto CCNL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>CCNL Applicato</Label>
                  <Select value={selectedCcnlId} onValueChange={setSelectedCcnlId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona CCNL..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessun CCNL specifico (valori standard)</SelectItem>
                      {ccnlContracts?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCcnl && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-muted-foreground">13ª mensilità:</span>{" "}
                          <Badge variant={selectedCcnl.thirteenth_salary ? "default" : "secondary"}>
                            {selectedCcnl.thirteenth_salary ? "Sì" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">14ª mensilità:</span>{" "}
                          <Badge variant={selectedCcnl.fourteenth_salary ? "default" : "secondary"}>
                            {selectedCcnl.fourteenth_salary ? "Sì" : "No"}
                          </Badge>
                        </div>
                        {selectedCcnl.inps_rate && (
                          <div>
                            <span className="text-muted-foreground">INPS:</span> {selectedCcnl.inps_rate}%
                          </div>
                        )}
                        {selectedCcnl.inail_rate && (
                          <div>
                            <span className="text-muted-foreground">INAIL:</span> {selectedCcnl.inail_rate}%
                          </div>
                        )}
                        {selectedCcnl.meal_voucher_amount && (
                          <div>
                            <span className="text-muted-foreground">Buoni pasto:</span>{" "}
                            {formatCurrency(selectedCcnl.meal_voucher_amount)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep("step1")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
                  </Button>
                  <Button onClick={() => setActiveStep("step3")}>
                    Avanti <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 3 */}
          <TabsContent value="step3">
            <Card>
              <CardHeader>
                <CardTitle>Localizzazione e Famiglia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Regione</Label>
                  <Select value={region} onValueChange={(v) => { setRegion(v); setMunicipality(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona regione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS_LIST.map((r) => (
                        <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {municipalities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Comune (capoluogo)</Label>
                    <Select value={municipality} onValueChange={setMunicipality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona comune..." />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Figli a carico</Label>
                  <Input
                    type="number"
                    value={dependentsCount}
                    onChange={(e) => setDependentsCount(e.target.value)}
                    min={0}
                    max={20}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep("step2")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
                  </Button>
                  <Button onClick={() => setActiveStep("step4")} disabled={!canProceedStep3}>
                    Calcola <Calculator className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STEP 4 - RISULTATI */}
          <TabsContent value="step4">
            {result && (
              <div className="space-y-6">
                {/* Cards riepilogo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Lordo Mensile</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(result.grossSalary)}</p>
                      <p className="text-xs text-muted-foreground mt-1">RAL: {formatCurrency(result.ral)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Netto Stimato</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(result.netSalary)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Annuale: {formatCurrency(result.annualNet)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Costo Azienda</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(result.totalCost)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Annuale: {formatCurrency(result.annualTotalCost)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Badge cuneo fiscale */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Cuneo Fiscale: {result.cuneoFiscalePercent.toFixed(1)}%
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {result.monthlyCount} mensilità
                  </Badge>
                </div>

                {/* Grafici */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Composizione Retribuzione</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Mensile vs Annuale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Legend />
                          <Bar dataKey="Lordo" fill="hsl(217, 83%, 51%)" />
                          <Bar dataKey="Netto" fill="hsl(142, 71%, 45%)" />
                          <Bar dataKey="Costo Azienda" fill="hsl(36, 100%, 50%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabella dettaglio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dettaglio Voci</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-muted-foreground">Voce</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">Mensile</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">Annuale</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b"><td className="py-2">Lordo</td><td className="text-right">{formatCurrency(result.grossSalary)}</td><td className="text-right">{formatCurrency(result.annualGross)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-destructive">INPS Dipendente</td><td className="text-right text-destructive">-{formatCurrency(result.inpsEmployee)}</td><td className="text-right text-destructive">-{formatCurrency(result.inpsEmployee * result.monthlyCount)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-destructive">IRPEF Netta</td><td className="text-right text-destructive">-{formatCurrency(result.irpefGross)}</td><td className="text-right text-destructive">-{formatCurrency(result.irpefGross * result.monthlyCount)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-destructive">Add. Regionale</td><td className="text-right text-destructive">-{formatCurrency(result.regionalTax)}</td><td className="text-right text-destructive">-{formatCurrency(result.regionalTax * result.monthlyCount)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-destructive">Add. Comunale</td><td className="text-right text-destructive">-{formatCurrency(result.municipalTax)}</td><td className="text-right text-destructive">-{formatCurrency(result.municipalTax * result.monthlyCount)}</td></tr>
                          <tr className="border-b bg-primary/5 font-semibold"><td className="py-2">Netto Stimato</td><td className="text-right">{formatCurrency(result.netSalary)}</td><td className="text-right">{formatCurrency(result.annualNet)}</td></tr>
                          <Separator className="my-1" />
                          <tr className="border-b"><td className="py-2 text-muted-foreground">INPS Datore</td><td className="text-right">{formatCurrency(result.inpsEmployer)}</td><td className="text-right">{formatCurrency(result.inpsEmployer * result.monthlyCount)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-muted-foreground">TFR</td><td className="text-right">{formatCurrency(result.tfr)}</td><td className="text-right">{formatCurrency(result.tfr * result.monthlyCount)}</td></tr>
                          <tr className="border-b"><td className="py-2 text-muted-foreground">INAIL Datore</td><td className="text-right">{formatCurrency(result.inailEmployer / result.monthlyCount)}</td><td className="text-right">{formatCurrency(result.inailEmployer)}</td></tr>
                          <tr className="bg-muted/50 font-semibold"><td className="py-2">Costo Totale Azienda</td><td className="text-right">{formatCurrency(result.totalCost)}</td><td className="text-right">{formatCurrency(result.annualTotalCost)}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Confronto */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Confronta con altro contratto</CardTitle>
                      <Switch checked={comparisonEnabled} onCheckedChange={setComparisonEnabled} />
                    </div>
                  </CardHeader>
                  {comparisonEnabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CCNL Contratto B</Label>
                          <Select value={compCcnlId} onValueChange={setCompCcnlId}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Valori standard</SelectItem>
                              {ccnlContracts?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo Contratto B</Label>
                          <Select value={compContractType} onValueChange={setCompContractType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTRACT_TYPES.map((ct) => (
                                <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {comparison && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium text-muted-foreground">Voce</th>
                                <th className="text-right py-2 font-medium text-muted-foreground">Contratto A</th>
                                <th className="text-right py-2 font-medium text-muted-foreground">Contratto B</th>
                                <th className="text-right py-2 font-medium text-muted-foreground">Delta</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2">Netto Mensile</td>
                                <td className="text-right">{formatCurrency(comparison.primary.netSalary)}</td>
                                <td className="text-right">{formatCurrency(comparison.secondary.netSalary)}</td>
                                <td className="text-right"><DeltaIndicator value={comparison.delta.monthlyNet} /></td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2">Netto Annuale</td>
                                <td className="text-right">{formatCurrency(comparison.primary.annualNet)}</td>
                                <td className="text-right">{formatCurrency(comparison.secondary.annualNet)}</td>
                                <td className="text-right"><DeltaIndicator value={comparison.delta.annualNet} /></td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2">Costo Azienda Annuale</td>
                                <td className="text-right">{formatCurrency(comparison.primary.annualTotalCost)}</td>
                                <td className="text-right">{formatCurrency(comparison.secondary.annualTotalCost)}</td>
                                <td className="text-right"><DeltaIndicator value={comparison.delta.annualTotalCost} /></td>
                              </tr>
                              <tr>
                                <td className="py-2">Cuneo Fiscale</td>
                                <td className="text-right">{comparison.primary.cuneoFiscalePercent.toFixed(1)}%</td>
                                <td className="text-right">{comparison.secondary.cuneoFiscalePercent.toFixed(1)}%</td>
                                <td className="text-right">
                                  <span className={comparison.delta.cuneoFiscale < 0 ? "text-green-600" : comparison.delta.cuneoFiscale > 0 ? "text-destructive" : "text-muted-foreground"}>
                                    {comparison.delta.cuneoFiscale > 0 ? "+" : ""}{comparison.delta.cuneoFiscale.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Azioni */}
                <div className="flex flex-wrap gap-3 justify-between">
                  <Button variant="outline" onClick={() => setActiveStep("step1")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Modifica parametri
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Nuova simulazione
                    </Button>
                    <Button onClick={handleExportPdf}>
                      <FileDown className="mr-2 h-4 w-4" /> Esporta PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Simulator;
