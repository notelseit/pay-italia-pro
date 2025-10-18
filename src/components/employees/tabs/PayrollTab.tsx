import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface PayrollTabProps {
  form: UseFormReturn<any>;
}

const contractTypes = [
  { value: "indeterminato", label: "Tempo Indeterminato" },
  { value: "determinato", label: "Tempo Determinato" },
  { value: "part_time", label: "Part-time" },
  { value: "consulente", label: "Consulente" },
];

const employeeTypes = [
  "Operaio",
  "Impiegato",
  "Quadro",
  "Dirigente",
];

const paymentCategories = [
  "Mensile",
  "Quindicinale",
  "Settimanale",
];

export const PayrollTab = ({ form }: PayrollTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contract_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipologia Contratto *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo contratto" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="base_salary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retribuzione (€) *</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="2500.00"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="employee_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo Dipendente</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {employeeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="national_contract_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contratto Nazionale (CCNL)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="CCNL Commercio" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="payment_category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria di Pagamento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {paymentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="working_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orario Lavorativo (ore/settimana)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                step="0.5"
                placeholder="40"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};