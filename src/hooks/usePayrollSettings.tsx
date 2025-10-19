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
    mutationFn: async (updates: Partial<PayrollSettings>) => {
      if (!companyId || !settings?.id) throw new Error("Missing company or settings ID");

      // Convert types for Supabase
      const dbUpdates: any = { ...updates };
      if (updates.irpef_brackets) {
        dbUpdates.irpef_brackets = updates.irpef_brackets as any;
      }
      if (updates.work_deductions) {
        dbUpdates.work_deductions = updates.work_deductions as any;
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
      toast({
        title: "Impostazioni aggiornate",
        description: "Le impostazioni dei cedolini sono state salvate con successo.",
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
