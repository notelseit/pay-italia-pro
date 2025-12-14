import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { CitizenshipTab } from "./tabs/CitizenshipTab";
import { EducationTab } from "./tabs/EducationTab";
import { PayrollTab } from "./tabs/PayrollTab";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

import { italianTaxCodeSchema, italianIbanRequiredSchema, italianPhoneSchema } from "@/lib/validationSchemas";

const employeeSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  tax_code: italianTaxCodeSchema.optional(),
  email: z.string().email("Email non valida").optional().or(z.literal("")),
  phone: italianPhoneSchema,
  birth_date: z.string().optional(),
  city: z.string().max(100, "Città troppo lunga").optional(),
  postal_code: z.string().max(10, "CAP non valido").optional(),
  province: z.string().max(2, "Provincia non valida (2 caratteri)").optional(),
  country: z.string().max(100, "Paese troppo lungo").optional(),
  hire_date: z.string().optional(),
  contract_type: z.enum(["indeterminato", "determinato", "part_time", "consulente"]),
  base_salary: z.number().min(0, "Lo stipendio non può essere negativo").optional(),
  dependents_count: z.number().min(0).max(20).optional(),
  iban: italianIbanRequiredSchema,
  inps_position: z.string().max(50).optional(),
  inail_position: z.string().max(50).optional(),
  pension_fund: z.string().max(100).optional(),
  tax_deductions: z.number().min(0).optional(),
  employee_type: z.string().max(100).optional(),
  payment_category: z.string().max(50).optional(),
  working_hours: z.number().min(0).max(60).optional(),
  nationality: z.string().max(100).optional(),
  id_card_issue_date: z.string().optional(),
  id_card_expiry_date: z.string().optional(),
  id_card_municipality: z.string().max(100).optional(),
  id_card_province: z.string().max(2).optional(),
  passport_number: z.string().max(20).optional(),
  passport_issue_date: z.string().optional(),
  passport_expiry_date: z.string().optional(),
  passport_municipality: z.string().max(100).optional(),
  passport_province: z.string().max(2).optional(),
  marital_status: z.string().max(50).optional(),
  visa_number: z.string().max(50).optional(),
  work_permit_number: z.string().max(50).optional(),
  police_station: z.string().max(100).optional(),
  visa_issue_date: z.string().optional(),
  visa_expiry_date: z.string().optional(),
  cv_url: z.string().url().optional().or(z.literal("")),
  password: z.string().optional(),
  ccnl_contract_id: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  companyId: string;
  onSave: (data: TablesInsert<"employees"> | TablesUpdate<"employees">) => void;
}

export const EmployeeDialog = ({ open, onOpenChange, employee, companyId, onSave }: EmployeeDialogProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      tax_code: "",
      email: "",
      phone: "",
      hire_date: new Date().toISOString().split('T')[0],
      contract_type: "indeterminato",
      base_salary: 0,
      dependents_count: 0,
      tax_deductions: 0,
      nationality: "Italiana",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset(employee);
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        tax_code: "",
        email: "",
        phone: "",
        hire_date: new Date().toISOString().split('T')[0],
        contract_type: "indeterminato",
        base_salary: 0,
        dependents_count: 0,
        tax_deductions: 0,
        nationality: "Italiana",
      });
    }
  }, [employee, form]);

  const onSubmit = (data: EmployeeFormData) => {
    const full_name = `${data.first_name} ${data.last_name}`;
    
    // Convert empty strings to null for optional fields
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? null : value;
      return acc;
    }, {} as any);

    const employeeData = {
      ...cleanedData,
      full_name,
      company_id: companyId,
      is_active: true,
    };

    onSave(employeeData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Modifica Dipendente" : "Aggiungi Dipendente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Validation errors:", errors);
            toast({
              title: "Errore di validazione",
              description: "Controlla i campi obbligatori e riprova",
              variant: "destructive",
            });
          })} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Dati Base</TabsTrigger>
                <TabsTrigger value="citizenship">Cittadinanza</TabsTrigger>
                <TabsTrigger value="education">Formazione</TabsTrigger>
                <TabsTrigger value="payroll">Libro Paga</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoTab form={form} isNewEmployee={!employee} />
              </TabsContent>

              <TabsContent value="citizenship" className="mt-6">
                <CitizenshipTab form={form} />
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                <EducationTab form={form} employeeId={employee?.id} companyId={companyId} />
              </TabsContent>

              <TabsContent value="payroll" className="mt-6">
                <PayrollTab form={form} companyId={companyId} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit">
                {employee ? "Aggiorna" : "Salva"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};