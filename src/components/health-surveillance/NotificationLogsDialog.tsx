import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface NotificationLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const NotificationLogsDialog = ({ open, onOpenChange, companyId }: NotificationLogsDialogProps) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["notification-logs", companyId, filterType, filterEmployee, filterDateFrom, filterDateTo],
    queryFn: async () => {
      let query = supabase
        .from("notification_logs")
        .select(`
          *,
          employees(full_name)
        `)
        .eq("company_id", companyId)
        .order("notification_date", { ascending: false });

      if (filterType && filterType !== "all") {
        query = query.eq("notification_type", filterType);
      }

      if (filterDateFrom) {
        query = query.gte("notification_date", filterDateFrom);
      }

      if (filterDateTo) {
        query = query.lte("notification_date", filterDateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtro per dipendente (case insensitive)
      if (filterEmployee) {
        return data?.filter(log => 
          log.employees?.full_name?.toLowerCase().includes(filterEmployee.toLowerCase())
        );
      }

      return data;
    },
    enabled: !!companyId && open,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      sent: 'default',
      failed: 'destructive',
      pending: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="gap-1">
        {getStatusIcon(status)}
        {status === 'sent' ? 'Inviata' : status === 'failed' ? 'Fallita' : 'In attesa'}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    return type === 'medical_visit' ? 'Visita Medica' : 'Giudizio Idoneità';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Storico Notifiche Inviate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo Notifica</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="medical_visit">Visite Mediche</SelectItem>
                  <SelectItem value="fitness_judgment">Giudizi Idoneità</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dipendente</Label>
              <Input
                placeholder="Cerca per nome..."
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Da</Label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data A</Label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Caricamento...</div>
            ) : logs && logs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Ora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Giorni Prima</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="max-w-[200px]">Messaggio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.notification_date), "dd/MM/yyyy HH:mm", { locale: it })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(log.notification_type)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.employees?.full_name || 'N/A'}</TableCell>
                      <TableCell>{log.days_before_expiry} giorni</TableCell>
                      <TableCell className="text-xs">{log.email_recipient}</TableCell>
                      <TableCell>{getStatusBadge(log.email_status)}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={log.message_content}>
                        {log.message_content}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Nessuna notifica trovata con i filtri selezionati
              </div>
            )}
          </div>

          {logs && logs.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Totale notifiche: {logs.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};