import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Eye, Search } from "lucide-react";
import { MedicalRecordViewDialog } from "./MedicalRecordViewDialog";

interface MedicalRecordListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const MedicalRecordListDialog = ({ open, onOpenChange, companyId }: MedicalRecordListDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ["medical-records-list", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          employees(id, full_name, email),
          medical_protocols(id, name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  const filteredRecords = records?.filter(record =>
    record.employees?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cartelle Sanitarie e di Rischio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome dipendente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border rounded-lg">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Caricamento...</div>
              ) : filteredRecords && filteredRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dipendente</TableHead>
                      <TableHead>Protocollo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data Apertura</TableHead>
                      <TableHead>Data Chiusura</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employees?.full_name}</TableCell>
                        <TableCell>{record.medical_protocols?.name || 'Nessuno'}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
                            {record.status === 'active' ? 'Attiva' : 'Chiusa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.opened_at ? format(new Date(record.opened_at), "dd/MM/yyyy", { locale: it }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {record.closed_at ? format(new Date(record.closed_at), "dd/MM/yyyy", { locale: it }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewRecord(record)}
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
                  {searchTerm ? "Nessuna cartella trovata" : "Nessuna cartella sanitaria presente"}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedRecord && (
        <MedicalRecordViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          record={selectedRecord}
          companyId={companyId}
        />
      )}
    </>
  );
};