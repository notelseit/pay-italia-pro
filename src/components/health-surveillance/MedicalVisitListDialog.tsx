import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { Eye, Search } from "lucide-react";
import { MedicalVisitViewDialog } from "./MedicalVisitViewDialog";
import { Label } from "@/components/ui/label";

interface MedicalVisitListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const MedicalVisitListDialog = ({ open, onOpenChange, companyId }: MedicalVisitListDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: visits, isLoading } = useQuery({
    queryKey: ["medical-visits-list", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_visits")
        .select(`
          *,
          employees(id, full_name, email)
        `)
        .eq("company_id", companyId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  const filteredVisits = visits?.filter(visit => {
    const matchesSearch = visit.employees?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || visit.status === filterStatus;
    const matchesType = filterType === "all" || visit.visit_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewVisit = (visit: any) => {
    setSelectedVisit(visit);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    const labels: Record<string, string> = {
      scheduled: 'Programmata',
      completed: 'Completata',
      cancelled: 'Annullata',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (scheduledDate: string, status: string) => {
    if (status !== 'scheduled') return null;
    
    const daysUntil = differenceInDays(new Date(scheduledDate), new Date());
    
    if (daysUntil < 0) return <Badge variant="destructive">Scaduta</Badge>;
    if (daysUntil <= 7) return <Badge variant="destructive">Urgente</Badge>;
    if (daysUntil <= 15) return <Badge variant="secondary">15 giorni</Badge>;
    if (daysUntil <= 30) return <Badge variant="outline">30 giorni</Badge>;
    return null;
  };

  const getVisitTypeLabel = (visitType: string) => {
    const labels: Record<string, string> = {
      'preventiva': 'Preventiva',
      'periodica': 'Periodica',
      'cambio_mansione': 'Cambio Mansione',
      'richiesta_lavoratore': 'Su Richiesta',
      'fine_rapporto': 'Fine Rapporto'
    };
    return labels[visitType] || visitType;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visite Mediche Programmate</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cerca Dipendente</Label>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome dipendente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stato</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="scheduled">Programmate</SelectItem>
                    <SelectItem value="completed">Completate</SelectItem>
                    <SelectItem value="cancelled">Annullate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo Visita</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="periodica">Periodica</SelectItem>
                    <SelectItem value="cambio_mansione">Cambio Mansione</SelectItem>
                    <SelectItem value="richiesta_lavoratore">Su Richiesta</SelectItem>
                    <SelectItem value="fine_rapporto">Fine Rapporto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Caricamento...</div>
              ) : filteredVisits && filteredVisits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dipendente</TableHead>
                      <TableHead>Tipo Visita</TableHead>
                      <TableHead>Data Programmata</TableHead>
                      <TableHead>Medico</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Priorità</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit: any) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.employees?.full_name}</TableCell>
                        <TableCell>{getVisitTypeLabel(visit.visit_type)}</TableCell>
                        <TableCell>
                          {format(new Date(visit.scheduled_date), "dd/MM/yyyy", { locale: it })}
                        </TableCell>
                        <TableCell>{visit.doctor_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(visit.status)}</TableCell>
                        <TableCell>{getPriorityBadge(visit.scheduled_date, visit.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewVisit(visit)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizza
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                    ? "Nessuna visita trovata con i filtri selezionati" 
                    : "Nessuna visita medica programmata"}
                </div>
              )}
            </div>

            {filteredVisits && filteredVisits.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Totale visite: {filteredVisits.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedVisit && (
        <MedicalVisitViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          visit={selectedVisit}
          companyId={companyId}
        />
      )}
    </>
  );
};