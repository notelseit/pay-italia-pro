import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type PayrollRecord = Tables<"payroll_records"> & {
  employees?: {
    full_name: string;
    tax_code?: string;
    hire_date?: string;
    employee_type?: string;
    working_hours?: number;
    inps_position?: string;
    inail_position?: string;
    ccnl_contracts?: {
      name: string;
      inps_rate?: number;
      inail_rate?: number;
      thirteenth_salary?: boolean;
      fourteenth_salary?: boolean;
      meal_voucher_amount?: number;
    };
  };
};

export const usePayroll = (month: number, year: number, companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payrollRecords = [], isLoading } = useQuery({
    queryKey: ["payroll", month, year, companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_records")
        .select(`
          *,
          employees (
            full_name,
            tax_code,
            hire_date,
            employee_type,
            working_hours,
            inps_position,
            inail_position,
            ccnl_contracts:ccnl_contract_id (
              name,
              inps_rate,
              inail_rate,
              thirteenth_salary,
              fourteenth_salary,
              meal_voucher_amount
            )
          )
        `)
        .eq("month", month)
        .eq("year", year)
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PayrollRecord[];
    },
    enabled: !!companyId,
  });

  const createPayrollRecord = useMutation({
    mutationFn: async (record: Omit<PayrollRecord, "id" | "created_at" | "updated_at" | "employees">) => {
      const { data, error } = await supabase
        .from("payroll_records")
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino generato",
        description: "Il cedolino è stato creato con successo.",
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

  const updatePayrollRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayrollRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("payroll_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino aggiornato",
        description: "Il cedolino è stato modificato con successo.",
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

  const confirmPayroll = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("payroll_records")
        .update({
          status: "confermato",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino confermato",
        description: "Il cedolino è stato confermato con successo.",
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

  const sendPayroll = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("payroll_records")
        .update({
          status: "inviato",
          sent_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino inviato",
        description: "Il cedolino è stato inviato al dipendente.",
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

  const deletePayrollRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payroll_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino eliminato",
        description: "Il cedolino è stato eliminato.",
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
    payrollRecords,
    isLoading,
    createPayrollRecord,
    updatePayrollRecord,
    confirmPayroll,
    sendPayroll,
    deletePayrollRecord,
  };
};
