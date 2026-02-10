import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface IRPEFBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface WorkDeduction {
  max_income: number;
  deduction: number;
}

export interface PayrollSettings {
  id: string;
  company_id: string;
  irpef_brackets: IRPEFBracket[];
  inps_employee_rate: number;
  inps_employer_rate: number;
  tfr_rate: number;
  inail_rate: number;
  regional_tax_rate: number;
  municipal_tax_rate: number;
  work_deductions: WorkDeduction[];
  deduction_per_child: number;
}

export function usePayrollSettings(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payroll-settings", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("payroll_settings")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("payroll_settings")
          .insert([{ company_id: companyId }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return {
          ...newSettings,
          irpef_brackets: newSettings.irpef_brackets as unknown as IRPEFBracket[],
          work_deductions: newSettings.work_deductions as unknown as WorkDeduction[],
        } as PayrollSettings;
      }
      
      return {
        ...data,
        irpef_brackets: data.irpef_brackets as unknown as IRPEFBracket[],
        work_deductions: data.work_deductions as unknown as WorkDeduction[],
      } as PayrollSettings;
    },
    enabled: !!companyId,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PayrollSettings> & { changeSummary?: string }) => {
      if (!companyId || !settings?.id) throw new Error("Missing company or settings ID");

      const { changeSummary, ...settingsUpdates } = updates;

      // Create immutable version before updating
      const { data: userData } = await supabase.auth.getUser();
      const snapshotData = { ...settings, ...settingsUpdates };
      const { error: versionError } = await supabase
        .from("payroll_settings_versions" as any)
        .insert({
          payroll_settings_id: settings.id,
          company_id: companyId,
          data_json: snapshotData,
          change_summary: changeSummary || "Aggiornamento parametri",
          is_active: true,
          created_by: userData.user?.id || null,
        });
      if (versionError) throw versionError;

      // Convert types for Supabase
      const dbUpdates: any = { ...settingsUpdates };
      if (settingsUpdates.irpef_brackets) {
        dbUpdates.irpef_brackets = settingsUpdates.irpef_brackets as any;
      }
      if (settingsUpdates.work_deductions) {
        dbUpdates.work_deductions = settingsUpdates.work_deductions as any;
      }

      const { data, error } = await supabase
        .from("payroll_settings")
        .update(dbUpdates)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-settings", companyId] });
      queryClient.invalidateQueries({ queryKey: ["version_history", "payroll_settings"] });
      toast({
        title: "Impostazioni aggiornate",
        description: "Le impostazioni dei cedolini sono state salvate e una nuova versione è stata creata.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare le impostazioni: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
}
