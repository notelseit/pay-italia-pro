import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface MedicalVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const visitTypes = [
  { value: "preventiva", label: "Visita Preventiva" },
  { value: "periodica", label: "Visita Periodica" },
  { value: "cambio_mansione", label: "Cambio Mansione" },
  { value: "richiesta_lavoratore", label: "Su Richiesta del Lavoratore" },
  { value: "fine_rapporto", label: "Fine Rapporto" },
];

export const MedicalVisitDialog = ({ open, onOpenChange, companyId }: MedicalVisitDialogProps) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    visit_type: "",
    scheduled_date: "",
    doctor_name: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  const createVisitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("medical_visits").insert({
        company_id: companyId,
        employee_id: data.employee_id,
        visit_type: data.visit_type,
        scheduled_date: data.scheduled_date,
        doctor_name: data.doctor_name || null,
        notes: data.notes || null,
        status: "scheduled",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visita medica programmata con successo");
      queryClient.invalidateQueries({ queryKey: ["health-surveillance-stats"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      employee_id: "",
      visit_type: "",
      scheduled_date: "",
      doctor_name: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.visit_type || !formData.scheduled_date) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    createVisitMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova Visita Medica</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Dipendente *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona dipendente" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_type">Tipo Visita *</Label>
            <Select
              value={formData.visit_type}
              onValueChange={(value) => setFormData({ ...formData, visit_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo" />
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
            <Label htmlFor="scheduled_date">Data Programmata *</Label>
            <Input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              min={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_name">Medico Competente</Label>
            <Input
              id="doctor_name"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              placeholder="Nome del medico"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Eventuali note sulla visita"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={createVisitMutation.isPending}>
              {createVisitMutation.isPending ? "Salvataggio..." : "Crea Visita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};