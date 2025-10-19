import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

export const useDashboard = (companyId?: string) => {
  // Active employees count
  const { data: employeesCount } = useQuery({
    queryKey: ["dashboard-employees-count", companyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("is_active", true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Unvalidated presence records
  const { data: unvalidatedPresence } = useQuery({
    queryKey: ["dashboard-unvalidated-presence", companyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("presence_records")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("is_validated", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Current month payroll records
  const { data: payrollStats } = useQuery({
    queryKey: ["dashboard-payroll-stats", companyId],
    queryFn: async () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data: payrollData, error: payrollError } = await supabase
        .from("payroll_records")
        .select("status")
        .eq("company_id", companyId!)
        .eq("month", currentMonth)
        .eq("year", currentYear);

      if (payrollError) throw payrollError;

      const { count: employeesCount, error: employeesError } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("is_active", true);

      if (employeesError) throw employeesError;

      return {
        generated: payrollData?.length || 0,
        total: employeesCount || 0,
        pending: (employeesCount || 0) - (payrollData?.length || 0),
      };
    },
    enabled: !!companyId,
  });

  // Recent activity (last 10 records from employees, payroll, and presence)
  const { data: recentActivity } = useQuery({
    queryKey: ["dashboard-recent-activity", companyId],
    queryFn: async () => {
      const activities: Array<{
        action: string;
        employee: string;
        time: string;
        timestamp: Date;
      }> = [];

      // Recent employees
      const { data: recentEmployees } = await supabase
        .from("employees")
        .select("full_name, created_at")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false })
        .limit(5);

      recentEmployees?.forEach((emp) => {
        activities.push({
          action: "Nuovo dipendente",
          employee: emp.full_name,
          time: formatRelativeTime(new Date(emp.created_at)),
          timestamp: new Date(emp.created_at),
        });
      });

      // Recent payroll
      const { data: recentPayroll } = await supabase
        .from("payroll_records")
        .select("created_at, employees(full_name)")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false })
        .limit(5);

      recentPayroll?.forEach((payroll: any) => {
        activities.push({
          action: "Cedolino generato",
          employee: payroll.employees?.full_name || "N/A",
          time: formatRelativeTime(new Date(payroll.created_at)),
          timestamp: new Date(payroll.created_at),
        });
      });

      // Recent presence records
      const { data: recentPresence } = await supabase
        .from("presence_records")
        .select("created_at, sick_days, vacation_days, employees(full_name)")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false })
        .limit(5);

      recentPresence?.forEach((presence: any) => {
        let action = "Presenza registrata";
        if (presence.sick_days > 0) action = "Malattia registrata";
        if (presence.vacation_days > 0) action = "Ferie registrate";

        activities.push({
          action,
          employee: presence.employees?.full_name || "N/A",
          time: formatRelativeTime(new Date(presence.created_at)),
          timestamp: new Date(presence.created_at),
        });
      });

      // Sort by timestamp and take the 10 most recent
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(({ timestamp, ...rest }) => rest);
    },
    enabled: !!companyId,
  });

  // New employees this month
  const { data: newEmployeesThisMonth } = useQuery({
    queryKey: ["dashboard-new-employees", companyId],
    queryFn: async () => {
      const now = new Date();
      const startDate = startOfMonth(now).toISOString();
      const endDate = endOfMonth(now).toISOString();

      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  return {
    employeesCount: employeesCount || 0,
    unvalidatedPresence: unvalidatedPresence || 0,
    payrollStats: payrollStats || { generated: 0, total: 0, pending: 0 },
    recentActivity: recentActivity || [],
    newEmployeesThisMonth: newEmployeesThisMonth || 0,
  };
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Proprio ora";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuti fa`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`;
  if (diffInSeconds < 172800) return "Ieri";
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`;
  
  return format(date, "d MMM yyyy", { locale: it });
}
