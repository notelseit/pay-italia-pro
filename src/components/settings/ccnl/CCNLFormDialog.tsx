import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrayFieldManager } from "./ArrayFieldManager";
import { VersionBadge } from "@/components/versioning/VersionBadge";
import { VersionHistoryDialog } from "@/components/versioning/VersionHistoryDialog";

interface CCNLFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract: any;
  onSubmit: (data: any) => void;
}

export const CCNLFormDialog = ({ open, onOpenChange, editingContract, onSubmit }: CCNLFormDialogProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const [contractualEntities, setContractualEntities] = useState<any[]>(editingContract?.contractual_entities || []);
  const [trialPeriods, setTrialPeriods] = useState<any[]>(editingContract?.trial_periods || []);
  const [sickLeaveRules, setSickLeaveRules] = useState<any[]>(editingContract?.sick_leave_rules || []);
  const [salaryTable, setSalaryTable] = useState<any[]>(editingContract?.salary_table || []);
  const [permits, setPermits] = useState<any>(editingContract?.permits || {});
  const [overtimeRules, setOvertimeRules] = useState<any>(editingContract?.overtime_rules || {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const contractData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      base_salary: parseFloat(formData.get("base_salary") as string) || null,
      work_hours: parseFloat(formData.get("work_hours") as string) || 40,
      vacation_days: parseInt(formData.get("vacation_days") as string) || 26,
      sick_leave_days: parseInt(formData.get("sick_leave_days") as string) || 180,
      notice_period_days: parseInt(formData.get("notice_period_days") as string) || 15,
      trial_period_days: parseInt(formData.get("trial_period_days") as string) || 90,
      thirteenth_salary: formData.get("thirteenth_salary") === "on",
      fourteenth_salary: formData.get("fourteenth_salary") === "on",
      meal_vouchers: formData.get("meal_vouchers") === "on",
      meal_voucher_amount: parseFloat(formData.get("meal_voucher_amount") as string) || 0,
      inps_rate: parseFloat(formData.get("inps_rate") as string) || null,
      inail_rate: parseFloat(formData.get("inail_rate") as string) || null,
      part_time_allowed: formData.get("part_time_allowed") === "on",
      fixed_term_allowed: formData.get("fixed_term_allowed") === "on",
      notes: formData.get("notes") as string,
      contractual_entities: contractualEntities,
      trial_periods: trialPeriods,
      sick_leave_rules: sickLeaveRules,
      salary_table: salaryTable,
      permits: {
        annual_hours: parseInt(formData.get("permits_annual_hours") as string) || 0,
        rol_hours: parseInt(formData.get("permits_rol_hours") as string) || 0,
        ex_festivity_hours: parseInt(formData.get("permits_ex_festivity_hours") as string) || 0,
      },
      overtime_rules: {
        max_hours_month: parseInt(formData.get("overtime_max_hours_month") as string) || 0,
        max_hours_year: parseInt(formData.get("overtime_max_hours_year") as string) || 0,
        percentage_increase: parseFloat(formData.get("overtime_percentage_increase") as string) || 0,
      },
    };

    onSubmit(contractData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{editingContract ? "Modifica Contratto CCNL" : "Nuovo Contratto CCNL"}</DialogTitle>
            {editingContract?.id && (
              <VersionBadge
                entityType="ccnl"
                entityId={editingContract.id}
                onClick={() => setShowHistory(true)}
              />
            )}
          </div>
          <DialogDescription>
            Configura i dettagli del contratto collettivo nazionale
          </DialogDescription>
        </DialogHeader>

        {editingContract?.id && (
          <VersionHistoryDialog
            open={showHistory}
            onOpenChange={setShowHistory}
            entityType="ccnl"
            entityId={editingContract.id}
            companyId={editingContract.company_id}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Base</TabsTrigger>
              <TabsTrigger value="advanced">Avanzato</TabsTrigger>
              <TabsTrigger value="rules">Regole</TabsTrigger>
              <TabsTrigger value="salary">Retribuzione</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Contratto *</Label>
                  <Input id="name" name="name" required defaultValue={editingContract?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Input id="description" name="description" defaultValue={editingContract?.description} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_salary">RAL Base (€)</Label>
                  <Input id="base_salary" name="base_salary" type="number" step="0.01" defaultValue={editingContract?.base_salary} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_hours">Ore Settimanali</Label>
                  <Input id="work_hours" name="work_hours" type="number" step="0.5" defaultValue={editingContract?.work_hours || 40} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacation_days">Giorni Ferie</Label>
                  <Input id="vacation_days" name="vacation_days" type="number" defaultValue={editingContract?.vacation_days || 26} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sick_leave_days">Giorni Malattia</Label>
                  <Input id="sick_leave_days" name="sick_leave_days" type="number" defaultValue={editingContract?.sick_leave_days || 180} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice_period_days">Giorni Preavviso</Label>
                  <Input id="notice_period_days" name="notice_period_days" type="number" defaultValue={editingContract?.notice_period_days || 15} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trial_period_days">Giorni Prova Standard</Label>
                  <Input id="trial_period_days" name="trial_period_days" type="number" defaultValue={editingContract?.trial_period_days || 90} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="thirteenth_salary" name="thirteenth_salary" defaultChecked={editingContract?.thirteenth_salary ?? true} />
                  <Label htmlFor="thirteenth_salary">Tredicesima</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fourteenth_salary" name="fourteenth_salary" defaultChecked={editingContract?.fourteenth_salary ?? false} />
                  <Label htmlFor="fourteenth_salary">Quattordicesima</Label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="part_time_allowed" name="part_time_allowed" defaultChecked={editingContract?.part_time_allowed ?? true} />
                  <Label htmlFor="part_time_allowed">Part-time Consentito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fixed_term_allowed" name="fixed_term_allowed" defaultChecked={editingContract?.fixed_term_allowed ?? true} />
                  <Label htmlFor="fixed_term_allowed">Tempo Determinato Consentito</Label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="meal_vouchers" name="meal_vouchers" defaultChecked={editingContract?.meal_vouchers ?? false} />
                  <Label htmlFor="meal_vouchers">Buoni Pasto</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal_voucher_amount">Importo Buoni (€)</Label>
                  <Input id="meal_voucher_amount" name="meal_voucher_amount" type="number" step="0.01" defaultValue={editingContract?.meal_voucher_amount || 0} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <ArrayFieldManager
                label="Enti Contrattuali"
                fields={[
                  { name: "name", label: "Nome Ente" },
                  { name: "contribution_rate", label: "Aliquota (%)", type: "number", step: "0.01" }
                ]}
                value={contractualEntities}
                onChange={setContractualEntities}
              />

              <ArrayFieldManager
                label="Periodi di Prova per Categoria"
                fields={[
                  { name: "category", label: "Categoria" },
                  { name: "days", label: "Giorni", type: "number" }
                ]}
                value={trialPeriods}
                onChange={setTrialPeriods}
              />

              <ArrayFieldManager
                label="Regole Malattia"
                fields={[
                  { name: "type", label: "Tipo" },
                  { name: "days", label: "Giorni", type: "number" },
                  { name: "percentage", label: "Percentuale (%)", type: "number", step: "0.01" }
                ]}
                value={sickLeaveRules}
                onChange={setSickLeaveRules}
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Permessi</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="permits_annual_hours">Ore Annuali</Label>
                    <Input id="permits_annual_hours" name="permits_annual_hours" type="number" defaultValue={editingContract?.permits?.annual_hours || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permits_rol_hours">Ore ROL</Label>
                    <Input id="permits_rol_hours" name="permits_rol_hours" type="number" defaultValue={editingContract?.permits?.rol_hours || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permits_ex_festivity_hours">Ore Ex Festività</Label>
                    <Input id="permits_ex_festivity_hours" name="permits_ex_festivity_hours" type="number" defaultValue={editingContract?.permits?.ex_festivity_hours || 0} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Lavoro Straordinario</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtime_max_hours_month">Max Ore/Mese</Label>
                    <Input id="overtime_max_hours_month" name="overtime_max_hours_month" type="number" defaultValue={editingContract?.overtime_rules?.max_hours_month || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime_max_hours_year">Max Ore/Anno</Label>
                    <Input id="overtime_max_hours_year" name="overtime_max_hours_year" type="number" defaultValue={editingContract?.overtime_rules?.max_hours_year || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime_percentage_increase">Maggiorazione (%)</Label>
                    <Input id="overtime_percentage_increase" name="overtime_percentage_increase" type="number" step="0.01" defaultValue={editingContract?.overtime_rules?.percentage_increase || 0} />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inps_rate">Aliquota INPS (%)</Label>
                  <Input id="inps_rate" name="inps_rate" type="number" step="0.01" defaultValue={editingContract?.inps_rate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inail_rate">Aliquota INAIL (%)</Label>
                  <Input id="inail_rate" name="inail_rate" type="number" step="0.01" defaultValue={editingContract?.inail_rate} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-4 mt-4">
              <ArrayFieldManager
                label="Tabella Retributiva"
                fields={[
                  { name: "level", label: "Livello" },
                  { name: "monthly_salary", label: "Retribuzione Mensile (€)", type: "number", step: "0.01" },
                  { name: "annual_salary", label: "Retribuzione Annua (€)", type: "number", step: "0.01" }
                ]}
                value={salaryTable}
                onChange={setSalaryTable}
              />

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea id="notes" name="notes" rows={4} defaultValue={editingContract?.notes} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {editingContract ? "Aggiorna" : "Salva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
