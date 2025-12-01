import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckSquare, Upload, Send } from "lucide-react";
import { VisitChecklistDialog } from "./VisitChecklistDialog";
import { MedicalDocumentsDialog } from "./MedicalDocumentsDialog";

interface MedicalVisitViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: any;
  companyId: string;
}

const visitTypes = [
  { value: "preventiva", label: "Visita Preventiva" },
  { value: "periodica", label: "Visita Periodica" },
  { value: "cambio_mansione", label: "Cambio Mansione" },
  { value: "richiesta_lavoratore", label: "Su Richiesta del Lavoratore" },
  { value: "fine_rapporto", label: "Fine Rapporto" },
];

export const MedicalVisitViewDialog = ({ open, onOpenChange, visit, companyId }: MedicalVisitViewDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [formData, setFormData] = useState({
    visit_type: visit.visit_type || "preventiva",
    scheduled_date: visit.scheduled_date || "",
    completed_date: visit.completed_date || "",
    doctor_name: visit.doctor_name || "",
    status: visit.status || "scheduled",
    objective_examination: visit.objective_examination || "",
    target_organs: visit.target_organs || "",
    notes: visit.notes || "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData({
      visit_type: visit.visit_type || "preventiva",
      scheduled_date: visit.scheduled_date || "",
      completed_date: visit.completed_date || "",
      doctor_name: visit.doctor_name || "",
      status: visit.status || "scheduled",
      objective_examination: visit.objective_examination || "",
      target_organs: visit.target_organs || "",
      notes: visit.notes || "",
    });
  }, [visit]);

  const updateVisitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("medical_visits")
        .update({
          visit_type: data.visit_type,
          scheduled_date: data.scheduled_date,
          completed_date: data.completed_date || null,
          doctor_name: data.doctor_name || null,
          status: data.status,
          objective_examination: data.objective_examination || null,
          target_organs: data.target_organs || null,
          notes: data.notes || null,
        })
        .eq("id", visit.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visita medica aggiornata");
      queryClient.invalidateQueries({ queryKey: ["medical-visits-list"] });
      queryClient.invalidateQueries({ queryKey: ["medical-visits-calendar"] });
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
    if (!formData.scheduled_date || !formData.visit_type) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    updateVisitMutation.mutate(formData);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Visita Medica - {visit.employees?.full_name}</DialogTitle>
            {getStatusBadge(visit.status)}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_type">Tipo Visita *</Label>
              <Select
                value={formData.visit_type}
                onValueChange={(value) => setFormData({ ...formData, visit_type: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Stato *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programmata</SelectItem>
                  <SelectItem value="completed">Completata</SelectItem>
                  <SelectItem value="cancelled">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Data Programmata *</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completed_date">Data Completamento</Label>
              <Input
                id="completed_date"
                type="date"
                value={formData.completed_date}
                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_name">Medico Competente</Label>
            <Input
              id="doctor_name"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Nome del medico"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective_examination">Esame Obiettivo</Label>
            <Textarea
              id="objective_examination"
              value={formData.objective_examination}
              onChange={(e) => setFormData({ ...formData, objective_examination: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_organs">Organi Bersaglio</Label>
            <Textarea
              id="target_organs"
              value={formData.target_organs}
              onChange={(e) => setFormData({ ...formData, target_organs: e.target.value })}
              disabled={!isEditing}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={async () => {
                  try {
                    await supabase.functions.invoke("send-visit-confirmation", {
                      body: {
                        visitId: visit.id,
                        companyId: companyId,
                      },
                    });
                    toast.success("Email di conferma inviata");
                  } catch (error: any) {
                    toast.error(`Errore: ${error.message}`);
                  }
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Invia Conferma
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setChecklistOpen(true)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setDocumentsOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Documenti
              </Button>
            </div>

            <div className="flex gap-2 justify-end">
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
                  <Button type="submit" disabled={updateVisitMutation.isPending}>
                    {updateVisitMutation.isPending ? "Salvataggio..." : "Salva"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      <VisitChecklistDialog
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        visitId={visit.id}
        employeeId={visit.employee_id}
        companyId={companyId}
      />

      <MedicalDocumentsDialog
        open={documentsOpen}
        onOpenChange={setDocumentsOpen}
        employeeId={visit.employee_id}
        companyId={companyId}
        visitId={visit.id}
      />
    </Dialog>
  );
};