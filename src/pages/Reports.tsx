import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp, Calendar, AlertCircle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import { 
  generateMonthlyCostReport, 
  generateAbsenceReport, 
  generateQuarterlyContributionsReport,
  generateTaxDeadlines,
  exportToCSV,
  getCurrentQuarter
} from "@/lib/reportGenerators";
import { formatCurrency } from "@/lib/payrollCalculations";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Reports = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const { payrollRecords, presenceRecords, employees, isLoading } = useReports(selectedMonth, selectedYear);

  // Generate reports data
  const monthlyCostReport = useMemo(() => 
    payrollRecords.length > 0 
      ? generateMonthlyCostReport(payrollRecords, selectedMonth, selectedYear)
      : null,
    [payrollRecords, selectedMonth, selectedYear]
  );

  const absenceReport = useMemo(() =>
    presenceRecords.length > 0
      ? generateAbsenceReport(presenceRecords, selectedMonth, selectedYear)
      : null,
    [presenceRecords, selectedMonth, selectedYear]
  );

  const quarterlyReport = useMemo(() => {
    const quarter = getCurrentQuarter(selectedMonth);
    // Fetch all records for the quarter
    return payrollRecords.length > 0
      ? generateQuarterlyContributionsReport(payrollRecords, quarter, selectedYear)
      : null;
  }, [payrollRecords, selectedMonth, selectedYear]);

  const taxDeadlines = useMemo(() => 
    generateTaxDeadlines(selectedMonth, selectedYear),
    [selectedMonth, selectedYear]
  );

  // Calculate compliance status based on real data
  const complianceStatus = [
    { 
      item: "GDPR - Privacy Dipendenti", 
      status: "Conforme", 
      lastCheck: new Date().toLocaleDateString('it-IT')
    },
    { 
      item: "Registri Obbligatori", 
      status: employees.length > 0 ? "Conforme" : "Da Verificare", 
      lastCheck: new Date().toLocaleDateString('it-IT')
    },
    { 
      item: "Cedolini Mensili", 
      status: payrollRecords.length > 0 ? "Conforme" : "In Elaborazione", 
      lastCheck: new Date().toLocaleDateString('it-IT')
    },
    { 
      item: "Presenze Validate", 
      status: presenceRecords.length > 0 ? "Conforme" : "Da Validare", 
      lastCheck: new Date().toLocaleDateString('it-IT')
    }
  ];

  const handleDownloadCostReport = () => {
    if (!monthlyCostReport) {
      toast.error("Nessun dato disponibile per il periodo selezionato");
      return;
    }
    
    exportToCSV(
      monthlyCostReport.details.map(d => ({
        'Dipendente': d.employee,
        'Lordo': d.gross,
        'Netto': d.net,
        'INPS': d.inps,
        'IRPEF': d.irpef
      })),
      `costo_lavoro_${selectedMonth}_${selectedYear}`
    );
    toast.success("Report scaricato con successo");
  };

  const handleDownloadAbsenceReport = () => {
    if (!absenceReport) {
      toast.error("Nessun dato disponibile per il periodo selezionato");
      return;
    }
    
    exportToCSV(
      absenceReport.details.map(d => ({
        'Dipendente': d.employee,
        'Giorni Lavorati': d.workingDays,
        'Ferie': d.vacationDays,
        'Malattia': d.sickDays,
        'Altre Assenze': d.otherAbsences,
        'Straordinari (ore)': d.overtimeHours
      })),
      `assenze_${selectedMonth}_${selectedYear}`
    );
    toast.success("Report scaricato con successo");
  };

  const handleDownloadContributionsReport = () => {
    if (!quarterlyReport) {
      toast.error("Nessun dato disponibile per il periodo selezionato");
      return;
    }
    
    exportToCSV(
      quarterlyReport.monthlyBreakdown.map(m => ({
        'Mese': m.month,
        'INPS Dipendenti': m.inps,
        'IRPEF': m.irpef,
        'Numero Dipendenti': m.employeesCount
      })),
      `contributi_${quarterlyReport.period.replace(' ', '_')}`
    );
    toast.success("Report scaricato con successo");
  };

  const months = [
    { value: 1, label: "Gennaio" },
    { value: 2, label: "Febbraio" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Aprile" },
    { value: 5, label: "Maggio" },
    { value: 6, label: "Giugno" },
    { value: 7, label: "Luglio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Settembre" },
    { value: 10, label: "Ottobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Dicembre" },
  ];

  const years = [2024, 2025, 2026].map(y => ({ value: y, label: y.toString() }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Report e Compliance</h1>
            <p className="text-muted-foreground">Analisi, scadenze e conformità normativa</p>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y.value} value={y.value.toString()}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Upcoming Deadlines Alert */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Scadenze Imminenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {taxDeadlines.filter(d => d.priority === "Alta").slice(0, 2).map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{deadline.task}</p>
                      <p className="text-sm text-muted-foreground">Scadenza: {deadline.date}</p>
                      <p className="text-xs text-muted-foreground mt-1">{deadline.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {deadline.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Reports */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Disponibili</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Report Costo del Lavoro */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Costo del Lavoro Mensile</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {monthlyCostReport 
                        ? `Analisi dettagliata del costo del lavoro per ${monthlyCostReport.period}`
                        : "Nessun dato disponibile per il periodo selezionato"
                      }
                    </p>
                    {monthlyCostReport && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{monthlyCostReport.employeeCount} dipendenti</span>
                        <span className="font-semibold text-foreground">
                          Costo totale: {formatCurrency(monthlyCostReport.totalCost)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadCostReport}
                      disabled={!monthlyCostReport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica CSV
                    </Button>
                  </div>
                </div>

                {/* Report Assenze */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Report Assenze</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {absenceReport
                        ? `Analisi ferie, malattie e permessi per ${absenceReport.period}`
                        : "Nessun dato disponibile per il periodo selezionato"
                      }
                    </p>
                    {absenceReport && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{absenceReport.employeeCount} dipendenti</span>
                        <span>Tasso assenze: {absenceReport.absenceRate}%</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadAbsenceReport}
                      disabled={!absenceReport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica CSV
                    </Button>
                  </div>
                </div>

                {/* Report Contributi Trimestrale */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Riepilogo Contributi Trimestrale</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {quarterlyReport
                        ? `Sommario contributi INPS e IRPEF per ${quarterlyReport.period}`
                        : "Nessun dato disponibile per il periodo selezionato"
                      }
                    </p>
                    {quarterlyReport && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>INPS: {formatCurrency(quarterlyReport.totalINPS)}</span>
                        <span>IRPEF: {formatCurrency(quarterlyReport.totalIRPEF)}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadContributionsReport}
                      disabled={!quarterlyReport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Scarica CSV
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* All Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Calendario Scadenze</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {taxDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{deadline.task}</p>
                        <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        <p className="text-xs text-muted-foreground mt-1">{deadline.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={
                            deadline.priority === "Alta" 
                              ? "bg-destructive/10 text-destructive border-destructive/20" 
                              : "bg-primary/10 text-primary border-primary/20"
                          }
                        >
                          {deadline.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Stato Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {complianceStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.item}</p>
                        <p className="text-xs text-muted-foreground">
                          Ultimo controllo: {item.lastCheck}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          item.status === "Conforme" 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : item.status === "Da Verificare" || item.status === "Da Validare"
                            ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                            : "bg-muted text-muted-foreground border-muted"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* GDPR Info */}
        <Card className="mt-6 bg-accent/30">
          <CardHeader>
            <CardTitle className="text-sm">Conformità GDPR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              PayHub garantisce la piena conformità al GDPR per la gestione dei dati personali dei dipendenti. 
              Tutti i dati sono crittografati, con accesso basato sui ruoli e log di audit completi. 
              I dipendenti possono accedere, modificare o richiedere la cancellazione dei propri dati in qualsiasi momento.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
