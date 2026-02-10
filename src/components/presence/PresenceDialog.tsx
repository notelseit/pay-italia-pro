import { useState, useEffect, useMemo } from "react";
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
import { DayData, DayType } from "./DayCell";
import { initializeDays } from "./PresenceCalendar";

interface PresenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presence?: PresenceRecord | null;
  onSubmit: (data: any) => void;
  month: number;
  year: number;
}

/** Calcola i totali dai dati giornalieri del calendario */
function computeTotalsFromDays(days: DayData[]) {
  let working_days = 0;
  let vacation_days = 0;
  let sick_days = 0;
  let other_absences = 0;
  let overtime_hours = 0;
  let night_holiday_hours = 0;

  days.forEach((d) => {
    switch (d.dayType) {
      case "working": working_days++; break;
      case "vacation": vacation_days++; break;
      case "sick": sick_days++; break;
      case "leave": other_absences++; break;
    }
    overtime_hours += d.overtimeHours;
    night_holiday_hours += d.nightHolidayHours;
  });

  return { working_days, vacation_days, sick_days, other_absences, overtime_hours, night_holiday_hours };
}

export const PresenceDialog = ({
  open,
  onOpenChange,
  presence,
  onSubmit,
  month,
  year,
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
    exclude_weekends: true,
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

  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);

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

  // Initialize calendar days when dialog opens or month/year changes
  useEffect(() => {
    if (!open) return;

    if (presence) {
      // Editing: try to load daily_data from presence record or initialize
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

      // Load daily data from DB
      loadDailyData(presence.id);
    } else {
      // New record: initialize with defaults
      setFormData({
        employee_id: "",
        working_days: 0,
        vacation_days: 0,
        sick_days: 0,
        other_absences: 0,
        overtime_hours: 0,
        exclude_weekends: true,
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
      setCalendarDays(initializeDays(month, year, true));
    }
  }, [presence, open, month, year]);

  // Re-initialize weekends when toggle changes
  useEffect(() => {
    if (!open || calendarDays.length === 0) return;
    const newDays = calendarDays.map((d) => {
      const dow = d.date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      if (isWeekend) {
        return { ...d, dayType: formData.exclude_weekends ? "non_working" as DayType : "working" as DayType };
      }
      return d;
    });
    setCalendarDays(newDays);
  }, [formData.exclude_weekends]);

  const loadDailyData = async (presenceRecordId: string) => {
    const { data } = await supabase
      .from("presence_daily")
      .select("*")
      .eq("presence_record_id", presenceRecordId)
      .order("day_date", { ascending: true });

    if (data && data.length > 0) {
      const days: DayData[] = data.map((row: any) => {
        const date = new Date(row.day_date + "T00:00:00");
        return {
          date,
          dayType: row.day_type as DayType,
          overtimeHours: Number(row.overtime_hours) || 0,
          nightHolidayHours: Number(row.night_holiday_hours) || 0,
          notes: row.notes || "",
        };
      });
      setCalendarDays(days);
    } else {
      // No daily data yet, initialize from scratch
      setCalendarDays(initializeDays(month, year, formData.exclude_weekends));
    }
  };

  // Auto-update totals from calendar
  const totals = useMemo(() => computeTotalsFromDays(calendarDays), [calendarDays]);

  useEffect(() => {
    if (calendarDays.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        working_days: totals.working_days,
        vacation_days: totals.vacation_days,
        sick_days: totals.sick_days,
        other_absences: totals.other_absences,
        overtime_hours: totals.overtime_hours,
        night_holiday_hours: totals.night_holiday_hours,
      }));
    }
  }, [totals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Serialize calendar days for saving
    const dailyData = calendarDays.map((d) => ({
      day_date: `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, "0")}-${String(d.date.getDate()).padStart(2, "0")}`,
      day_type: d.dayType,
      overtime_hours: d.overtimeHours,
      night_holiday_hours: d.nightHolidayHours,
      notes: d.notes,
    }));

    onSubmit({
      ...formData,
      company_id: companyId,
      month,
      year,
      daily_data: dailyData,
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
              <TabsTrigger value="basic">Calendario</TabsTrigger>
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
                days={calendarDays}
                onDaysChange={setCalendarDays}
                month={month}
                year={year}
              />
            </TabsContent>

            <TabsContent value="maternity" className="mt-6">
              <MaternityTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="parental" className="mt-6">
              <ParentalLeaveTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="other" className="mt-6">
              <OtherDataTab formData={formData} setFormData={setFormData} />
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
