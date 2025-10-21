import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  companyId: string;
  onSave: (data: any) => void;
}

export const ContractFormDialog = ({
  open,
  onOpenChange,
  contract,
  companyId,
  onSave,
}: ContractFormDialogProps) => {
  const isEdit = !!contract?.id;

  const [formData, setFormData] = useState({
    contract_name: "",
    contract_type: "indeterminato",
    employee_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    base_salary: "",
    working_hours: "40",
    trial_period_days: "90",
    notice_period_days: "30",
    job_title: "",
    job_description: "",
    work_location: "",
    benefits: "",
    additional_clauses: "",
    is_template: false,
    is_active: true,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees_for_contract", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name, email")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  useEffect(() => {
    if (contract && isEdit) {
      setFormData({
        contract_name: contract.contract_name || "",
        contract_type: contract.contract_type || "indeterminato",
        employee_id: contract.employee_id || "",
        start_date: contract.start_date || format(new Date(), "yyyy-MM-dd"),
        end_date: contract.end_date || "",
        base_salary: contract.base_salary?.toString() || "",
        working_hours: contract.working_hours?.toString() || "40",
        trial_period_days: contract.trial_period_days?.toString() || "90",
        notice_period_days: contract.notice_period_days?.toString() || "30",
        job_title: contract.job_title || "",
        job_description: contract.job_description || "",
        work_location: contract.work_location || "",
        benefits: contract.benefits || "",
        additional_clauses: contract.additional_clauses || "",
        is_template: contract.is_template || false,
        is_active: contract.is_active ?? true,
      });
    } else {
      setFormData({
        contract_name: "",
        contract_type: "indeterminato",
        employee_id: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        base_salary: "",
        working_hours: "40",
        trial_period_days: "90",
        notice_period_days: "30",
        job_title: "",
        job_description: "",
        work_location: "",
        benefits: "",
        additional_clauses: "",
        is_template: false,
        is_active: true,
      });
    }
  }, [contract, isEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave: any = {
      ...formData,
      company_id: companyId,
      base_salary: parseFloat(formData.base_salary),
      working_hours: parseFloat(formData.working_hours),
      trial_period_days: parseInt(formData.trial_period_days),
      notice_period_days: parseInt(formData.notice_period_days),
    };

    // Se è un template, rimuovi employee_id
    if (formData.is_template) {
      dataToSave.employee_id = null;
    }

    // Se non è tempo determinato, rimuovi end_date
    if (formData.contract_type !== "determinato") {
      dataToSave.end_date = null;
    }

    if (isEdit) {
      dataToSave.id = contract.id;
    }

    onSave(dataToSave);
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contractTypeLabels: Record<string, string> = {
    indeterminato: "Tempo Indeterminato",
    determinato: "Tempo Determinato",
    apprendistato: "Apprendistato",
    stage: "Stage",
    collaborazione: "Collaborazione",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifica Contratto" : "Nuovo Contratto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informazioni Base</TabsTrigger>
              <TabsTrigger value="details">Dettagli</TabsTrigger>
              <TabsTrigger value="clauses">Clausole</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="contract_name">Nome Contratto *</Label>
                  <Input
                    id="contract_name"
                    value={formData.contract_name}
                    onChange={(e) => handleChange("contract_name", e.target.value)}
                    placeholder="es. Contratto Impiegato Amministrativo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contract_type">Tipo Contratto *</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) => handleChange("contract_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contractTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employee_id">Dipendente</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => handleChange("employee_id", value)}
                    disabled={formData.is_template}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nessun dipendente</SelectItem>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_date">Data Inizio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    required
                  />
                </div>

                {formData.contract_type === "determinato" && (
                  <div>
                    <Label htmlFor="end_date">Data Fine</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="base_salary">Retribuzione Base (€) *</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    step="0.01"
                    value={formData.base_salary}
                    onChange={(e) => handleChange("base_salary", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="working_hours">Ore Settimanali *</Label>
                  <Input
                    id="working_hours"
                    type="number"
                    step="0.5"
                    value={formData.working_hours}
                    onChange={(e) => handleChange("working_hours", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    id="is_template"
                    checked={formData.is_template}
                    onCheckedChange={(checked) => handleChange("is_template", checked)}
                  />
                  <Label htmlFor="is_template">Salva come modello</Label>
                </div>

                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Contratto attivo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trial_period_days">Periodo di Prova (giorni)</Label>
                  <Input
                    id="trial_period_days"
                    type="number"
                    value={formData.trial_period_days}
                    onChange={(e) => handleChange("trial_period_days", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notice_period_days">Preavviso (giorni)</Label>
                  <Input
                    id="notice_period_days"
                    type="number"
                    value={formData.notice_period_days}
                    onChange={(e) => handleChange("notice_period_days", e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="job_title">Qualifica</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleChange("job_title", e.target.value)}
                    placeholder="es. Impiegato Amministrativo"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="work_location">Luogo di Lavoro</Label>
                  <Input
                    id="work_location"
                    value={formData.work_location}
                    onChange={(e) => handleChange("work_location", e.target.value)}
                    placeholder="es. Sede aziendale, Via Roma 1, Milano"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="job_description">Descrizione Mansioni</Label>
                  <Textarea
                    id="job_description"
                    value={formData.job_description}
                    onChange={(e) => handleChange("job_description", e.target.value)}
                    rows={4}
                    placeholder="Descrivi le principali mansioni e responsabilità del dipendente..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="benefits">Benefit e Trattamento Economico</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => handleChange("benefits", e.target.value)}
                    rows={4}
                    placeholder="es. Tredicesima, ferie, buoni pasto, assicurazione..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clauses" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="additional_clauses">Clausole Aggiuntive</Label>
                <Textarea
                  id="additional_clauses"
                  value={formData.additional_clauses}
                  onChange={(e) => handleChange("additional_clauses", e.target.value)}
                  rows={10}
                  placeholder="Inserisci eventuali clausole particolari, CCNL di riferimento, norme sulla privacy, ecc..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {isEdit ? "Salva Modifiche" : "Crea Contratto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
