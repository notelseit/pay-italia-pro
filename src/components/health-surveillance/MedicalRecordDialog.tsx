import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MedicalRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const MedicalRecordDialog = ({ open, onOpenChange, companyId }: MedicalRecordDialogProps) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    protocol_id: "",
    work_history: "",
    personal_history: "",
    family_history: "",
    remote_pathology: "",
    recent_pathology: "",
    notes: "",
  });

  const queryClient = useQueryClient();

  // Fetch employees without medical records
  const { data: employees } = useQuery({
    queryKey: ["employees-no-records", companyId],
    queryFn: async () => {
      const { data: allEmployees, error: empError } = await supabase
        .from("employees")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("full_name");

      if (empError) throw empError;

      // Get employees with active medical records
      const { data: recordsData, error: recError } = await supabase
        .from("medical_records")
        .select("employee_id")
        .eq("company_id", companyId)
        .eq("status", "active");

      if (recError) throw recError;

      const employeesWithRecords = new Set(recordsData?.map((r) => r.employee_id));
      return allEmployees?.filter((emp) => !employeesWithRecords.has(emp.id)) || [];
    },
    enabled: !!companyId && open,
  });

  // Fetch protocols
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

  const createRecordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("medical_records").insert({
        company_id: companyId,
        employee_id: data.employee_id,
        protocol_id: data.protocol_id || null,
        work_history: data.work_history || null,
        personal_history: data.personal_history || null,
        family_history: data.family_history || null,
        remote_pathology: data.remote_pathology || null,
        recent_pathology: data.recent_pathology || null,
        notes: data.notes || null,
        status: "active",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cartella sanitaria creata con successo");
      queryClient.invalidateQueries({ queryKey: ["health-surveillance-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employees-no-records"] });
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
      protocol_id: "",
      work_history: "",
      personal_history: "",
      family_history: "",
      remote_pathology: "",
      recent_pathology: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id) {
      toast.error("Seleziona un dipendente");
      return;
    }
    createRecordMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova Cartella Sanitaria e di Rischio</DialogTitle>
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
            <Label htmlFor="protocol_id">Protocollo Sanitario</Label>
            <Select
              value={formData.protocol_id}
              onValueChange={(value) => setFormData({ ...formData, protocol_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona protocollo (opzionale)" />
              </SelectTrigger>
              <SelectContent>
                {protocols?.map((protocol) => (
                  <SelectItem key={protocol.id} value={protocol.id}>
                    {protocol.name}
                  </SelectItem>
                ))}
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
                  placeholder="Storia lavorativa del dipendente"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal_history">Anamnesi Personale</Label>
                <Textarea
                  id="personal_history"
                  value={formData.personal_history}
                  onChange={(e) => setFormData({ ...formData, personal_history: e.target.value })}
                  placeholder="Storia personale del dipendente"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_history">Anamnesi Familiare</Label>
                <Textarea
                  id="family_history"
                  value={formData.family_history}
                  onChange={(e) => setFormData({ ...formData, family_history: e.target.value })}
                  placeholder="Storia familiare del dipendente"
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
                  placeholder="Patologie pregresse"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recent_pathology">Patologia Prossima</Label>
                <Textarea
                  id="recent_pathology"
                  value={formData.recent_pathology}
                  onChange={(e) => setFormData({ ...formData, recent_pathology: e.target.value })}
                  placeholder="Patologie recenti o in corso"
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
                  placeholder="Note aggiuntive sulla cartella sanitaria"
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={createRecordMutation.isPending}>
              {createRecordMutation.isPending ? "Creazione..." : "Crea Cartella"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};