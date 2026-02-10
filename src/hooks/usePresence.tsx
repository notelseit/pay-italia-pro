import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { emitEvent } from "@/lib/domainEvents";

export interface PresenceRecord {
  id: string;
  employee_id: string;
  company_id: string;
  month: number;
  year: number;
  working_days: number;
  vacation_days: number;
  sick_days: number;
  other_absences: number;
  overtime_hours: number;
  exclude_weekends: boolean;
  night_holiday_hours: number;
  mandatory_maternity_days: number;
  maternity_code_ma1: boolean;
  parental_leave_pg4_days: number;
  parental_leave_pg5_days: number;
  wage_integration: number;
  allowances: number;
  deductions: number;
  bilateral_entity_amount: number;
  is_validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
  updated_at: string;
  employees?: {
    full_name: string;
  };
}

interface DailyDataRow {
  day_date: string;
  day_type: string;
  overtime_hours: number;
  night_holiday_hours: number;
  notes: string;
}

async function saveDailyData(presenceRecordId: string, dailyData: DailyDataRow[]) {
  // Delete existing daily data for this record then insert new
  await supabase
    .from("presence_daily")
    .delete()
    .eq("presence_record_id", presenceRecordId);

  if (dailyData.length > 0) {
    const rows = dailyData.map((d) => ({
      presence_record_id: presenceRecordId,
      day_date: d.day_date,
      day_type: d.day_type,
      overtime_hours: d.overtime_hours,
      night_holiday_hours: d.night_holiday_hours,
      notes: d.notes || null,
    }));

    const { error } = await supabase.from("presence_daily").insert(rows);
    if (error) console.error("Error saving daily data:", error);
  }
}

export const usePresence = (month: number, year: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: presenceRecords = [], isLoading } = useQuery({
    queryKey: ["presence", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presence_records")
        .select(`
          *,
          employees (
            full_name
          )
        `)
        .eq("month", month)
        .eq("year", year)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PresenceRecord[];
    },
  });

  const createPresence = useMutation({
    mutationFn: async (input: any) => {
      const { daily_data, ...newPresence } = input;
      const { data, error } = await supabase
        .from("presence_records")
        .insert(newPresence)
        .select()
        .single();

      if (error) throw error;

      // Save daily data if provided
      if (daily_data && daily_data.length > 0) {
        await saveDailyData(data.id, daily_data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza registrata",
        description: "La registrazione è stata creata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePresence = useMutation({
    mutationFn: async (input: any) => {
      const { id, daily_data, ...updates } = input;
      const { data, error } = await supabase
        .from("presence_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Save daily data if provided
      if (daily_data && daily_data.length > 0) {
        await saveDailyData(id, daily_data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza aggiornata",
        description: "La registrazione è stata modificata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validatePresence = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("presence_records")
        .update({
          is_validated: true,
          validated_at: new Date().toISOString(),
          validated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza validata",
        description: "La registrazione è stata validata con successo.",
      });
      emitEvent({
        eventType: "presence_validated",
        entityType: "presence",
        entityId: data.id,
        companyId: data.company_id,
        payload: { month: data.month, year: data.year, employee_id: data.employee_id, working_days: data.working_days, validated_at: data.validated_at },
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePresence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("presence_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza eliminata",
        description: "La registrazione è stata eliminata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    presenceRecords,
    isLoading,
    createPresence,
    updatePresence,
    validatePresence,
    deletePresence,
  };
};
