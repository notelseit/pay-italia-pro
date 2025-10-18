import { useState } from "react";
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

const Presence = () => {
  const [selectedMonth, setSelectedMonth] = useState("novembre-2024");

  // Mock presence data
  const presenceData = [
    {
      employee: "Mario Rossi",
      workingDays: 21,
      absences: 1,
      vacation: 0,
      sickLeave: 1,
      overtime: 8,
      status: "Validato"
    },
    {
      employee: "Laura Bianchi",
      workingDays: 20,
      absences: 2,
      vacation: 2,
      sickLeave: 0,
      overtime: 4,
      status: "In Attesa"
    },
    {
      employee: "Giuseppe Verdi",
      workingDays: 22,
      absences: 0,
      vacation: 0,
      sickLeave: 0,
      overtime: 12,
      status: "Validato"
    },
    {
      employee: "Anna Neri",
      workingDays: 21,
      absences: 1,
      vacation: 1,
      sickLeave: 0,
      overtime: 0,
      status: "Validato"
    },
  ];

  const monthlyStats = {
    totalWorkingDays: 22,
    totalAbsences: 4,
    pendingValidation: 23,
    validated: 119
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
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novembre-2024">Novembre 2024</SelectItem>
                    <SelectItem value="ottobre-2024">Ottobre 2024</SelectItem>
                    <SelectItem value="settembre-2024">Settembre 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importa CSV
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                </Button>
                <Button variant="hero">
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
            <CardTitle>Riepilogo Presenze - Novembre 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dipendente</TableHead>
                  <TableHead className="text-center">Giorni Lav.</TableHead>
                  <TableHead className="text-center">Assenze</TableHead>
                  <TableHead className="text-center">Ferie</TableHead>
                  <TableHead className="text-center">Malattia</TableHead>
                  <TableHead className="text-center">Straordinari (h)</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presenceData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.employee}</TableCell>
                    <TableCell className="text-center font-semibold">{record.workingDays}</TableCell>
                    <TableCell className="text-center">{record.absences}</TableCell>
                    <TableCell className="text-center">{record.vacation}</TableCell>
                    <TableCell className="text-center">{record.sickLeave}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">{record.overtime}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          record.status === "Validato" 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        {record.status === "Validato" ? "Modifica" : "Valida"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
