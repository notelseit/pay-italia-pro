import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { logAuditEvent } from "@/lib/auditLogger";
import { emitEvent } from "@/lib/domainEvents";

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino generato",
        description: "Il cedolino è stato creato con successo.",
      });
      // Audit log
      logAuditEvent({
        action: "payroll_created",
        entityType: "payroll",
        entityId: data.id,
        newValue: { month: data.month, year: data.year, employee_id: data.employee_id },
      });
      emitEvent({
        eventType: "payroll_created",
        entityType: "payroll",
        entityId: data.id,
        companyId: data.company_id,
        payload: { month: data.month, year: data.year, employee_id: data.employee_id, net_salary: data.net_salary, gross_total: data.gross_total },
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino aggiornato",
        description: "Il cedolino è stato modificato con successo.",
      });
      // Audit log
      logAuditEvent({
        action: "payroll_updated",
        entityType: "payroll",
        entityId: data.id,
        newValue: { net_salary: data.net_salary, gross_total: data.gross_total },
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino confermato",
        description: "Il cedolino è stato confermato con successo.",
      });
      // Audit log
      logAuditEvent({
        action: "payroll_confirmed",
        entityType: "payroll",
        entityId: data.id,
        newValue: { confirmed_at: data.confirmed_at },
      });
      emitEvent({
        eventType: "payroll_confirmed",
        entityType: "payroll",
        entityId: data.id,
        companyId: data.company_id,
        payload: { confirmed_at: data.confirmed_at, month: data.month, year: data.year, employee_id: data.employee_id },
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
      // Get payroll record with employee details
      const { data: payrollRecord, error: fetchError } = await supabase
        .from("payroll_records")
        .select(`
          *,
          employees (
            full_name,
            email,
            tax_code
          )
        `)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!payrollRecord) throw new Error("Cedolino non trovato");

      const employee = payrollRecord.employees as any;
      if (!employee?.email) {
        throw new Error("Email del dipendente non trovata");
      }

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: employee.email,
          subject: `Cedolino ${getMonthName(payrollRecord.month)} ${payrollRecord.year} - ${employee.full_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Cedolino Paga</h2>
              <p>Gentile ${employee.full_name},</p>
              <p>Il cedolino per il mese di <strong>${getMonthName(payrollRecord.month)} ${payrollRecord.year}</strong> è disponibile.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Lordo Totale</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">€ ${Number(payrollRecord.gross_total).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Contributi INPS</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">€ ${Number(payrollRecord.inps_contribution).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>IRPEF</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">€ ${Number(payrollRecord.irpef_tax).toFixed(2)}</td>
                </tr>
                <tr style="background: #f5f5f5; font-size: 1.2em;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Netto</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>€ ${Number(payrollRecord.net_salary).toFixed(2)}</strong></td>
                </tr>
              </table>
              ${payrollRecord.pdf_url ? `<p><a href="${payrollRecord.pdf_url}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Scarica PDF</a></p>` : ''}
              <p>Cordiali saluti</p>
            </div>
          `,
          text: `Cedolino ${getMonthName(payrollRecord.month)} ${payrollRecord.year}\n\nGentile ${employee.full_name},\n\nLordo: € ${Number(payrollRecord.gross_total).toFixed(2)}\nContributi INPS: € ${Number(payrollRecord.inps_contribution).toFixed(2)}\nIRPEF: € ${Number(payrollRecord.irpef_tax).toFixed(2)}\nNetto: € ${Number(payrollRecord.net_salary).toFixed(2)}`,
          template_type: "payroll",
          company_id: payrollRecord.company_id,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        throw new Error("Errore nell'invio dell'email");
      }

      // Update payroll status
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino inviato",
        description: "Il cedolino è stato inviato al dipendente via email.",
      });
      // Audit log
      logAuditEvent({
        action: "payroll_sent",
        entityType: "payroll",
        entityId: data.id,
        newValue: { sent_at: data.sent_at },
      });
      emitEvent({
        eventType: "payroll_sent",
        entityType: "payroll",
        entityId: data.id,
        companyId: data.company_id,
        payload: { sent_at: data.sent_at, month: data.month, year: data.year, employee_id: data.employee_id },
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

  // Helper function to get month name
  const getMonthName = (month: number): string => {
    const months = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    return months[month - 1];
  };

  const deletePayrollRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payroll_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({
        title: "Cedolino eliminato",
        description: "Il cedolino è stato eliminato.",
      });
      // Audit log
      logAuditEvent({
        action: "payroll_deleted",
        entityType: "payroll",
        entityId: id,
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
