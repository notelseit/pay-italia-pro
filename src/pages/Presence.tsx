import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Upload, Download, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresence } from "@/hooks/usePresence";
import { PresenceDialog } from "@/components/presence/PresenceDialog";
import { exportPresenceToCSV, parseCSVFile } from "@/lib/csvUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Presence = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState<any>(null);

  const { 
    presenceRecords, 
    isLoading, 
    createPresence, 
    updatePresence, 
    validatePresence 
  } = usePresence(selectedMonth, selectedYear);

  const monthlyStats = useMemo(() => {
    const totalAbsences = presenceRecords.reduce(
      (sum, record) => sum + record.vacation_days + record.sick_days + record.other_absences,
      0
    );
    const pendingValidation = presenceRecords.filter(r => !r.is_validated).length;
    const validated = presenceRecords.filter(r => r.is_validated).length;
    const totalWorkingDays = presenceRecords.reduce(
      (sum, record) => sum + record.working_days,
      0
    );

    return {
      totalWorkingDays,
      totalAbsences,
      pendingValidation,
      validated,
    };
  }, [presenceRecords]);

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

  const handleExport = () => {
    exportPresenceToCSV(presenceRecords, selectedMonth, selectedYear);
    toast({
      title: "Esportazione completata",
      description: "I dati sono stati esportati in formato CSV.",
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCSVFile(file);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("Company ID non trovato");

      const { data: employees } = await supabase
        .from("employees")
        .select("id, full_name")
        .eq("company_id", profile.company_id);

      if (!employees) throw new Error("Nessun dipendente trovato");

      for (const row of data) {
        const employee = employees.find(e => e.full_name === row.Dipendente);
        if (!employee) continue;

        await createPresence.mutateAsync({
          employee_id: employee.id,
          company_id: profile.company_id,
          month: selectedMonth,
          year: selectedYear,
          working_days: parseInt(row["Giorni Lavorativi"]) || 0,
          vacation_days: parseInt(row["Giorni Ferie"]) || 0,
          sick_days: parseInt(row["Giorni Malattia"]) || 0,
          other_absences: parseInt(row["Altre Assenze"]) || 0,
          overtime_hours: parseFloat(row["Ore Straordinarie"]) || 0,
          exclude_weekends: false,
          night_holiday_hours: 0,
          mandatory_maternity_days: 0,
          maternity_code_ma1: false,
          parental_leave_pg4_days: 0,
          parental_leave_pg5_days: 0,
          wage_integration: 0,
          allowances: 0,
          deductions: 0,
          bilateral_entity_amount: 0,
          is_validated: false,
        });
      }

      toast({
        title: "Importazione completata",
        description: `${data.length} registrazioni importate con successo.`,
      });
    } catch (error: any) {
      toast({
        title: "Errore nell'importazione",
        description: error.message,
        variant: "destructive",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (data: any) => {
    if (data.id) {
      updatePresence.mutate(data);
    } else {
      createPresence.mutate(data);
    }
  };

  const handleValidate = (id: string) => {
    validatePresence.mutate(id);
  };

  const handleEdit = (presence: any) => {
    setSelectedPresence(presence);
    setDialogOpen(true);
  };

  const handleNewRecord = () => {
    setSelectedPresence(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Gestione Presenze e Assenze</h1>
          <p className="text-muted-foreground">Tracciamento presenze, ferie e permessi</p>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Select 
                  value={`${["", "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"][selectedMonth]}-${selectedYear}`}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const items: React.ReactNode[] = [];
                      const monthNames = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
                      const monthLabels = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                      const cy = currentDate.getFullYear();
                      // Current year + previous year
                      for (const yr of [cy, cy - 1]) {
                        for (let m = 11; m >= 0; m--) {
                          items.push(
                            <SelectItem key={`${monthNames[m]}-${yr}`} value={`${monthNames[m]}-${yr}`}>
                              {monthLabels[m]} {yr}
                            </SelectItem>
                          );
                        }
                      }
                      return items;
                    })()}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importa CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExport}
                  disabled={presenceRecords.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                </Button>
                <Button variant="hero" onClick={handleNewRecord}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuova Registrazione
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Giorni Lavorativi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{monthlyStats.totalWorkingDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assenze Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{monthlyStats.totalAbsences}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Da Validare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{monthlyStats.pendingValidation}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Validati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{monthlyStats.validated}</div>
            </CardContent>
          </Card>
        </div>

        {/* Presence Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Riepilogo Presenze - {["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"][selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : presenceRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessuna registrazione trovata per questo mese.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dipendente</TableHead>
                    <TableHead className="text-center">Giorni Lav.</TableHead>
                    <TableHead className="text-center">Ferie</TableHead>
                    <TableHead className="text-center">Malattia</TableHead>
                    <TableHead className="text-center">Altre Assenze</TableHead>
                    <TableHead className="text-center">Straordinari (h)</TableHead>
                    <TableHead className="text-center">Nott./Fest. (h)</TableHead>
                    <TableHead className="text-center">Sab/Dom</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presenceRecords.map((record) => {
                    const totalAbsences = record.vacation_days + record.sick_days + record.other_absences;
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employees?.full_name || "N/A"}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {record.working_days}
                        </TableCell>
                        <TableCell className="text-center">{record.vacation_days}</TableCell>
                        <TableCell className="text-center">{record.sick_days}</TableCell>
                        <TableCell className="text-center">{record.other_absences}</TableCell>
                        <TableCell className="text-center font-semibold text-primary">
                          {record.overtime_hours}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.night_holiday_hours}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.exclude_weekends ? "✓" : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              record.is_validated
                                ? "bg-primary/10 text-primary border-primary/20" 
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {record.is_validated ? "Validato" : "In Attesa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              Modifica
                            </Button>
                            {!record.is_validated && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleValidate(record.id)}
                              >
                                Valida
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PresenceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          presence={selectedPresence}
          onSubmit={handleSubmit}
          month={selectedMonth}
          year={selectedYear}
        />

        {/* Absence Types Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tipologie Assenze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Ferie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm text-muted-foreground">Malattia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-foreground"></div>
                <span className="text-sm text-muted-foreground">Permesso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                <span className="text-sm text-muted-foreground">Congedo Parentale</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Presence;
