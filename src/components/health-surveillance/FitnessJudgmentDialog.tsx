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

interface FitnessJudgmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  prefilledEmployeeId?: string;
}

const judgmentTypes = [
  { value: "idoneo", label: "Idoneo" },
  { value: "idoneo_con_prescrizioni", label: "Idoneo con Prescrizioni" },
  { value: "non_idoneo", label: "Non Idoneo" },
  { value: "idoneo_temporaneamente", label: "Idoneo Temporaneamente" },
];

export const FitnessJudgmentDialog = ({ open, onOpenChange, companyId, prefilledEmployeeId }: FitnessJudgmentDialogProps) => {
  const [formData, setFormData] = useState({
    visit_id: "",
    judgment_type: "",
    judgment_date: format(new Date(), "yyyy-MM-dd"),
    expiry_date: "",
    prescriptions: "",
    limitations: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch completed visits without judgment
  const { data: visits } = useQuery({
    queryKey: ["completed-visits", companyId, prefilledEmployeeId],
    queryFn: async () => {
      let query = supabase
        .from("medical_visits")
        .select(`
          id,
          scheduled_date,
          visit_type,
          employee_id,
          employees (full_name)
        `)
        .eq("company_id", companyId)
        .eq("status", "completed")
        .order("completed_date", { ascending: false });

      // Filter by employee if prefilledEmployeeId is provided
      if (prefilledEmployeeId) {
        query = query.eq("employee_id", prefilledEmployeeId);
      }

      const { data: completedVisits, error: visitError } = await query;

      if (visitError) throw visitError;

      // Get visits that already have judgments
      const { data: judgments, error: judgError } = await supabase
        .from("fitness_judgments")
        .select("visit_id")
        .eq("company_id", companyId);

      if (judgError) throw judgError;

      const visitsWithJudgments = new Set(judgments?.map((j) => j.visit_id));
      return completedVisits?.filter((visit) => !visitsWithJudgments.has(visit.id)) || [];
    },
    enabled: !!companyId && open,
  });

  const createJudgmentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get employee_id from visit
      const { data: visit, error: visitError } = await supabase
        .from("medical_visits")
        .select("employee_id")
        .eq("id", data.visit_id)
        .single();

      if (visitError) throw visitError;

      const { error } = await supabase.from("fitness_judgments").insert({
        company_id: companyId,
        visit_id: data.visit_id,
        employee_id: visit.employee_id,
        judgment_type: data.judgment_type,
        judgment_date: data.judgment_date,
        expiry_date: data.expiry_date || null,
        prescriptions: data.prescriptions || null,
        limitations: data.limitations || null,
        notes: data.notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Giudizio di idoneità emesso con successo");
      queryClient.invalidateQueries({ queryKey: ["health-surveillance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["completed-visits"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      visit_id: "",
      judgment_type: "",
      judgment_date: format(new Date(), "yyyy-MM-dd"),
      expiry_date: "",
      prescriptions: "",
      limitations: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visit_id || !formData.judgment_type || !formData.judgment_date) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    createJudgmentMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emetti Giudizio di Idoneità</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visit_id">Visita Medica Completata *</Label>
            <Select
              value={formData.visit_id}
              onValueChange={(value) => setFormData({ ...formData, visit_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona visita" />
              </SelectTrigger>
              <SelectContent>
                {visits?.map((visit: any) => (
                  <SelectItem key={visit.id} value={visit.id}>
                    {visit.employees?.full_name} - {format(new Date(visit.scheduled_date), "dd/MM/yyyy")} ({visit.visit_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="judgment_type">Tipo Giudizio *</Label>
            <Select
              value={formData.judgment_type}
              onValueChange={(value) => setFormData({ ...formData, judgment_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo giudizio" />
              </SelectTrigger>
              <SelectContent>
                {judgmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="judgment_date">Data Giudizio *</Label>
              <Input
                id="judgment_date"
                type="date"
                value={formData.judgment_date}
                onChange={(e) => setFormData({ ...formData, judgment_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Data Scadenza</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                min={formData.judgment_date}
              />
            </div>
          </div>

          {(formData.judgment_type === "idoneo_con_prescrizioni" || formData.judgment_type === "idoneo_temporaneamente") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="prescriptions">Prescrizioni</Label>
                <Textarea
                  id="prescriptions"
                  value={formData.prescriptions}
                  onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                  placeholder="Eventuali prescrizioni mediche"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitations">Limitazioni</Label>
                <Textarea
                  id="limitations"
                  value={formData.limitations}
                  onChange={(e) => setFormData({ ...formData, limitations: e.target.value })}
                  placeholder="Eventuali limitazioni alle mansioni"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sul giudizio"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={createJudgmentMutation.isPending}>
              {createJudgmentMutation.isPending ? "Salvataggio..." : "Emetti Giudizio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};