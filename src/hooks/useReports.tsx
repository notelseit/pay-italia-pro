import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useReports = (month?: number, year?: number) => {
  const { companyId } = useAuth();

  // Fetch payroll records
  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery({
    queryKey: ['reports-payroll', companyId, month, year],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('payroll_records')
        .select(`
          *,
          employees(full_name)
        `)
        .eq('company_id', companyId)
        .eq('status', 'confermato');

      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Fetch presence records
  const { data: presenceRecords = [], isLoading: presenceLoading } = useQuery({
    queryKey: ['reports-presence', companyId, month, year],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from('presence_records')
        .select(`
          *,
          employees(full_name)
        `)
        .eq('company_id', companyId)
        .eq('is_validated', true);

      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['reports-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  return {
    payrollRecords,
    presenceRecords,
    employees,
    isLoading: payrollLoading || presenceLoading || employeesLoading,
  };
};
