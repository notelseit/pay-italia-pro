import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/hooks/useEmployees";
import { PresenceRecord } from "@/hooks/usePresence";
import { supabase } from "@/integrations/supabase/client";
import { BasicPresenceTab } from "./tabs/BasicPresenceTab";
import { MaternityTab } from "./tabs/MaternityTab";
import { ParentalLeaveTab } from "./tabs/ParentalLeaveTab";
import { OtherDataTab } from "./tabs/OtherDataTab";

interface PresenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presence?: PresenceRecord | null;
  onSubmit: (data: any) => void;
  month: number;
  year: number;
}

export const PresenceDialog = ({ 
  open, 
  onOpenChange, 
  presence, 
  onSubmit,
  month,
  year 
}: PresenceDialogProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [companyId, setCompanyId] = useState<string>("");
  const { employees = [], isLoading: loadingEmployees } = useEmployees(companyId);
  const [formData, setFormData] = useState({
    employee_id: "",
    working_days: 0,
    vacation_days: 0,
    sick_days: 0,
    other_absences: 0,
    overtime_hours: 0,
    exclude_weekends: false,
    night_holiday_hours: 0,
    mandatory_maternity_days: 0,
    maternity_code_ma1: false,
    parental_leave_pg4_days: 0,
    parental_leave_pg5_days: 0,
    wage_integration: 0,
    allowances: 0,
    deductions: 0,
    bilateral_entity_amount: 0,
  });

  useEffect(() => {
    const getCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    };

    getCompanyId();
  }, []);

  useEffect(() => {
    if (presence) {
      setFormData({
        employee_id: presence.employee_id,
        working_days: presence.working_days,
        vacation_days: presence.vacation_days,
        sick_days: presence.sick_days,
        other_absences: presence.other_absences,
        overtime_hours: presence.overtime_hours,
        exclude_weekends: presence.exclude_weekends,
        night_holiday_hours: presence.night_holiday_hours,
        mandatory_maternity_days: (presence as any).mandatory_maternity_days || 0,
        maternity_code_ma1: (presence as any).maternity_code_ma1 || false,
        parental_leave_pg4_days: (presence as any).parental_leave_pg4_days || 0,
        parental_leave_pg5_days: (presence as any).parental_leave_pg5_days || 0,
        wage_integration: (presence as any).wage_integration || 0,
        allowances: (presence as any).allowances || 0,
        deductions: (presence as any).deductions || 0,
        bilateral_entity_amount: (presence as any).bilateral_entity_amount || 0,
      });
    } else {
      setFormData({
        employee_id: "",
        working_days: 0,
        vacation_days: 0,
        sick_days: 0,
        other_absences: 0,
        overtime_hours: 0,
        exclude_weekends: false,
        night_holiday_hours: 0,
        mandatory_maternity_days: 0,
        maternity_code_ma1: false,
        parental_leave_pg4_days: 0,
        parental_leave_pg5_days: 0,
        wage_integration: 0,
        allowances: 0,
        deductions: 0,
        bilateral_entity_amount: 0,
      });
    }
  }, [presence, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      company_id: companyId,
      month,
      year,
      ...(presence && { id: presence.id }),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {presence ? "Modifica Presenza" : "Nuova Registrazione Presenza"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Dati Base</TabsTrigger>
              <TabsTrigger value="maternity">Maternità Obb.</TabsTrigger>
              <TabsTrigger value="parental">Maternità Fac.</TabsTrigger>
              <TabsTrigger value="other">Altro</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <BasicPresenceTab
                formData={formData}
                setFormData={setFormData}
                employees={employees}
                loadingEmployees={loadingEmployees}
              />
            </TabsContent>

            <TabsContent value="maternity" className="mt-6">
              <MaternityTab
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="parental" className="mt-6">
              <ParentalLeaveTab
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="other" className="mt-6">
              <OtherDataTab
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {presence ? "Salva Modifiche" : "Crea Registrazione"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
