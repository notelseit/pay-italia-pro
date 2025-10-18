import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Send, CheckCircle, Calculator, Plus, Eye } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayroll } from "@/hooks/usePayroll";
import { useEmployees } from "@/hooks/useEmployees";
import { PayrollDialog } from "@/components/payroll/PayrollDialog";
import { PayrollDetailDialog } from "@/components/payroll/PayrollDetailDialog";
import { formatCurrency } from "@/lib/payrollCalculations";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Payroll = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [companyId, setCompanyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>("");
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  const { 
    payrollRecords, 
    isLoading, 
    createPayrollRecord,
    confirmPayroll,
    sendPayroll
  } = usePayroll(selectedMonth, selectedYear, companyId);

  const { employees = [] } = useEmployees(companyId);

  useEffect(() => {
    const getCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    };

    getCompanyId();
  }, []);

  const handleMonthChange = (value: string) => {
    const [monthStr, yearStr] = value.split("-");
    const monthNames: { [key: string]: number } = {
      "gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4,
      "maggio": 5, "giugno": 6, "luglio": 7, "agosto": 8,
      "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12
    };
    setSelectedMonth(monthNames[monthStr]);
    setSelectedYear(parseInt(yearStr));
  };

  const payrollStats = useMemo(() => {
    const totalGross = payrollRecords.reduce((sum, record) => sum + Number(record.gross_total), 0);
    const totalNet = payrollRecords.reduce((sum, record) => sum + Number(record.net_salary), 0);
    const totalContributions = payrollRecords.reduce(
      (sum, record) => sum + Number(record.inps_contribution) + Number(record.irpef_tax), 
      0
    );
    const confirmed = payrollRecords.filter(r => r.status === "confermato" || r.status === "inviato").length;
    const total = employees.length;

    return {
      totalGross: formatCurrency(totalGross),
      totalNet: formatCurrency(totalNet),
      totalContributions: formatCurrency(totalContributions),
      processed: confirmed,
      total,
    };
  }, [payrollRecords, employees]);

  const progress = payrollStats.total > 0 
    ? (payrollStats.processed / payrollStats.total) * 100 
    : 0;

  const handleSubmit = (data: any) => {
    createPayrollRecord.mutate(data);
  };

  const handleConfirm = (id: string) => {
    setSelectedPayrollId(id);
    setConfirmDialogOpen(true);
  };

  const handleSend = (id: string) => {
    setSelectedPayrollId(id);
    setSendDialogOpen(true);
  };

  const handleView = (record: any) => {
    setSelectedPayroll(record);
    setDetailDialogOpen(true);
  };

  const confirmConfirm = () => {
    confirmPayroll.mutate(selectedPayrollId);
    setConfirmDialogOpen(false);
  };

  const confirmSend = () => {
    sendPayroll.mutate(selectedPayrollId);
    setSendDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inviato":
        return "bg-primary/10 text-primary border-primary/20";
      case "confermato":
        return "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "bozza":
        return "Bozza";
      case "confermato":
        return "Confermato";
      case "inviato":
        return "Inviato";
      default:
        return status;
    }
  };

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
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Elaborazione Cedolini
                  </h3>
                  <Select 
                    value={`${["", "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"][selectedMonth]}-${selectedYear}`}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gennaio-2025">Gennaio 2025</SelectItem>
                      <SelectItem value="febbraio-2025">Febbraio 2025</SelectItem>
                      <SelectItem value="marzo-2025">Marzo 2025</SelectItem>
                      <SelectItem value="aprile-2025">Aprile 2025</SelectItem>
                      <SelectItem value="maggio-2025">Maggio 2025</SelectItem>
                      <SelectItem value="giugno-2025">Giugno 2025</SelectItem>
                      <SelectItem value="luglio-2025">Luglio 2025</SelectItem>
                      <SelectItem value="agosto-2025">Agosto 2025</SelectItem>
                      <SelectItem value="settembre-2025">Settembre 2025</SelectItem>
                      <SelectItem value="ottobre-2025">Ottobre 2025</SelectItem>
                      <SelectItem value="novembre-2025">Novembre 2025</SelectItem>
                      <SelectItem value="dicembre-2025">Dicembre 2025</SelectItem>
                      <SelectItem value="dicembre-2024">Dicembre 2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {payrollStats.processed} di {payrollStats.total} cedolini completati
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex gap-2">
                <Button variant="hero" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Genera Cedolino
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
              <p className="text-xs text-muted-foreground mt-1">
                {["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"][selectedMonth]} {selectedYear}
              </p>
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
            <CardTitle>
              Dettaglio Cedolini - {["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"][selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : payrollRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessun cedolino generato per questo mese. Clicca su "Genera Cedolino" per iniziare.
              </div>
            ) : (
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
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employees?.full_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(record.base_salary))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(record.bonuses))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(record.overtime_pay))}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(Number(record.gross_total))}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(Number(record.inps_contribution))}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(Number(record.irpef_tax))}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(Number(record.net_salary))}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusBadge(record.status)}
                        >
                          {getStatusLabel(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleView(record)}
                            title="Visualizza dettagli"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Visualizza
                          </Button>
                          {record.status === "bozza" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConfirm(record.id)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Conferma
                            </Button>
                          )}
                          {record.status === "confermato" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleSend(record.id)}
                            >
                              <Send className="mr-1 h-3 w-3" />
                              Invia
                            </Button>
                          )}
                          {record.status === "inviato" && (
                            <Button variant="ghost" size="icon" title="Scarica PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PayrollDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          month={selectedMonth}
          year={selectedYear}
          companyId={companyId}
        />

        <PayrollDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          payroll={selectedPayroll}
        />

        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confermare il cedolino?</AlertDialogTitle>
              <AlertDialogDescription>
                Una volta confermato, il cedolino potrà essere inviato al dipendente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={confirmConfirm}>Conferma</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Inviare il cedolino?</AlertDialogTitle>
              <AlertDialogDescription>
                Il cedolino verrà inviato al dipendente via email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSend}>Invia</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Sistema di Calcolo Conforme alle Normative Italiane 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Scaglioni IRPEF 2025</strong>: 23% (0-28k), 35% (28k-50k), 43% (oltre 50k)</p>
              <p>• <strong>Contributi INPS</strong>: 9.19% dipendente + 30.08% datore di lavoro</p>
              <p>• <strong>Detrazioni fiscali</strong>: Lavoro dipendente e familiari a carico</p>
              <p>• <strong>Addizionali</strong>: Regionali (1.23%) e comunali (0.8%)</p>
              <p>• <strong>TFR</strong>: 6.91% della retribuzione lorda</p>
              <p className="text-xs mt-4 text-primary font-semibold">
                ✅ Sistema completamente conforme alle normative italiane vigenti
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payroll;
