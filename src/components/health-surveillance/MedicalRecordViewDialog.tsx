import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Upload, Download } from "lucide-react";
import { MedicalDocumentsDialog } from "./MedicalDocumentsDialog";
import { generateMedicalRecordPDF } from "@/lib/medicalRecordPdfGenerator";

interface MedicalRecordViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  companyId: string;
}

export const MedicalRecordViewDialog = ({ open, onOpenChange, record, companyId }: MedicalRecordViewDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [formData, setFormData] = useState({
    protocol_id: record.protocol_id || "",
    work_history: record.work_history || "",
    personal_history: record.personal_history || "",
    family_history: record.family_history || "",
    remote_pathology: record.remote_pathology || "",
    recent_pathology: record.recent_pathology || "",
    notes: record.notes || "",
    status: record.status || "active",
  });

  const queryClient = useQueryClient();

  const { data: visits } = useQuery({
    queryKey: ["medical-visits-for-record", record.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_visits")
        .select("*")
        .eq("medical_record_id", record.id)
        .order("scheduled_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: judgments } = useQuery({
    queryKey: ["fitness-judgments-for-record", record.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fitness_judgments")
        .select("*")
        .eq("employee_id", record.employee_id)
        .order("judgment_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  useEffect(() => {
    setFormData({
      protocol_id: record.protocol_id || "",
      work_history: record.work_history || "",
      personal_history: record.personal_history || "",
      family_history: record.family_history || "",
      remote_pathology: record.remote_pathology || "",
      recent_pathology: record.recent_pathology || "",
      notes: record.notes || "",
      status: record.status || "active",
    });
  }, [record]);

  const { data: protocols } = useQuery({
    queryKey: ["medical-protocols", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_protocols")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  const updateRecordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const updateData: any = {
        protocol_id: data.protocol_id || null,
        work_history: data.work_history || null,
        personal_history: data.personal_history || null,
        family_history: data.family_history || null,
        remote_pathology: data.remote_pathology || null,
        recent_pathology: data.recent_pathology || null,
        notes: data.notes || null,
        status: data.status,
      };

      if (data.status === 'closed' && !record.closed_at) {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("medical_records")
        .update(updateData)
        .eq("id", record.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cartella sanitaria aggiornata");
      queryClient.invalidateQueries({ queryKey: ["medical-records-list"] });
      queryClient.invalidateQueries({ queryKey: ["health-surveillance-stats"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      toast.error("Attiva la modalità modifica prima di salvare");
      return;
    }
    updateRecordMutation.mutate(formData);
  };

  const handleGeneratePDF = async () => {
    try {
      const pdf = generateMedicalRecordPDF(
        record,
        visits || [],
        judgments || []
      );
      
      pdf.save(`cartella_sanitaria_${record.employees?.full_name}_${new Date().getTime()}.pdf`);
      toast.success("PDF generato con successo");
    } catch (error: any) {
      toast.error(`Errore nella generazione del PDF: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Cartella Sanitaria - {record.employees?.full_name}</DialogTitle>
            <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
              {record.status === 'active' ? 'Attiva' : 'Chiusa'}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Data apertura: {record.opened_at ? format(new Date(record.opened_at), "dd MMMM yyyy", { locale: it }) : 'N/A'}</p>
            {record.closed_at && (
              <p>Data chiusura: {format(new Date(record.closed_at), "dd MMMM yyyy", { locale: it })}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol_id">Protocollo Sanitario</Label>
            <Select
              value={formData.protocol_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, protocol_id: value === "none" ? null : value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona protocollo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                {protocols?.map((protocol) => (
                  <SelectItem key={protocol.id} value={protocol.id}>
                    {protocol.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Stato Cartella</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attiva</SelectItem>
                <SelectItem value="closed">Chiusa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="work" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work">Anamnesi</TabsTrigger>
              <TabsTrigger value="pathology">Patologie</TabsTrigger>
              <TabsTrigger value="notes">Note</TabsTrigger>
            </TabsList>

            <TabsContent value="work" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="work_history">Anamnesi Lavorativa</Label>
                <Textarea
                  id="work_history"
                  value={formData.work_history}
                  onChange={(e) => setFormData({ ...formData, work_history: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal_history">Anamnesi Personale</Label>
                <Textarea
                  id="personal_history"
                  value={formData.personal_history}
                  onChange={(e) => setFormData({ ...formData, personal_history: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_history">Anamnesi Familiare</Label>
                <Textarea
                  id="family_history"
                  value={formData.family_history}
                  onChange={(e) => setFormData({ ...formData, family_history: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="pathology" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remote_pathology">Patologia Remota</Label>
                <Textarea
                  id="remote_pathology"
                  value={formData.remote_pathology}
                  onChange={(e) => setFormData({ ...formData, remote_pathology: e.target.value })}
                  disabled={!isEditing}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recent_pathology">Patologia Prossima</Label>
                <Textarea
                  id="recent_pathology"
                  value={formData.recent_pathology}
                  onChange={(e) => setFormData({ ...formData, recent_pathology: e.target.value })}
                  disabled={!isEditing}
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Note Generali</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!isEditing}
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setDocumentsOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Documenti
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleGeneratePDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Genera PDF
              </Button>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Chiudi
                  </Button>
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    Modifica
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(false);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" disabled={updateRecordMutation.isPending}>
                    {updateRecordMutation.isPending ? "Salvataggio..." : "Salva"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      <MedicalDocumentsDialog
        open={documentsOpen}
        onOpenChange={setDocumentsOpen}
        employeeId={record.employee_id}
        companyId={companyId}
        medicalRecordId={record.id}
      />
    </Dialog>
  );
};