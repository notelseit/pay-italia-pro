import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Send, CheckCircle, Calculator } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const Payroll = () => {
  // Mock payroll data
  const payrollData = [
    {
      employee: "Mario Rossi",
      baseSalary: 2500,
      bonuses: 150,
      overtime: 200,
      grossTotal: 2850,
      inps: 285,
      irpef: 712,
      netSalary: 1853,
      status: "Generato"
    },
    {
      employee: "Laura Bianchi",
      baseSalary: 2200,
      bonuses: 100,
      overtime: 80,
      grossTotal: 2380,
      inps: 238,
      irpef: 595,
      netSalary: 1547,
      status: "Generato"
    },
    {
      employee: "Giuseppe Verdi",
      baseSalary: 3000,
      bonuses: 200,
      overtime: 300,
      grossTotal: 3500,
      inps: 350,
      irpef: 875,
      netSalary: 2275,
      status: "Inviato"
    },
    {
      employee: "Anna Neri",
      baseSalary: 1500,
      bonuses: 50,
      overtime: 0,
      grossTotal: 1550,
      inps: 155,
      irpef: 388,
      netSalary: 1007,
      status: "In Sospeso"
    },
  ];

  const payrollStats = {
    totalGross: "€342,800",
    totalNet: "€223,820",
    totalContributions: "€118,980",
    processed: 138,
    total: 142
  };

  const progress = (payrollStats.processed / payrollStats.total) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Generazione Cedolini</h1>
          <p className="text-muted-foreground">Calcolo automatico stipendi e contributi</p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Elaborazione Cedolini - Novembre 2024
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {payrollStats.processed} di {payrollStats.total} cedolini completati
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex gap-2">
                <Button variant="hero">
                  <Calculator className="mr-2 h-4 w-4" />
                  Genera Rimanenti
                </Button>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Invia Tutti
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totale Lordo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{payrollStats.totalGross}</div>
              <p className="text-xs text-muted-foreground mt-1">Novembre 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totale Netto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{payrollStats.totalNet}</div>
              <p className="text-xs text-muted-foreground mt-1">Da erogare ai dipendenti</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contributi Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{payrollStats.totalContributions}</div>
              <p className="text-xs text-muted-foreground mt-1">INPS + IRPEF</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dettaglio Cedolini - Novembre 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dipendente</TableHead>
                  <TableHead className="text-right">Retrib. Base</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Straord.</TableHead>
                  <TableHead className="text-right">Lordo Tot.</TableHead>
                  <TableHead className="text-right">INPS</TableHead>
                  <TableHead className="text-right">IRPEF</TableHead>
                  <TableHead className="text-right">Netto</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.employee}</TableCell>
                    <TableCell className="text-right">€{record.baseSalary}</TableCell>
                    <TableCell className="text-right">€{record.bonuses}</TableCell>
                    <TableCell className="text-right">€{record.overtime}</TableCell>
                    <TableCell className="text-right font-semibold">€{record.grossTotal}</TableCell>
                    <TableCell className="text-right text-destructive">-€{record.inps}</TableCell>
                    <TableCell className="text-right text-destructive">-€{record.irpef}</TableCell>
                    <TableCell className="text-right font-bold text-primary">€{record.netSalary}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          record.status === "Inviato" 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : record.status === "Generato"
                            ? "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Scarica PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        {record.status === "Generato" && (
                          <Button variant="ghost" size="icon" title="Invia">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Calcolo Automatico Contributi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>INPS</strong>: Contributi previdenziali calcolati al 10% (semplificato per demo)</p>
              <p>• <strong>IRPEF</strong>: Imposta sul reddito calcolata secondo scaglioni italiani al 25% (semplificato)</p>
              <p>• I calcoli reali considerano detrazioni, bonus, e normative CCNL specifiche</p>
              <p className="text-xs mt-4 text-primary">
                ⚠️ Questa è una versione demo con calcoli semplificati. La versione completa include tutti gli scaglioni IRPEF, 
                detrazioni fiscali, TFR, e conformità completa alle normative italiane.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payroll;
