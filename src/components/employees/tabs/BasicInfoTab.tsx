import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoTabProps {
  form: UseFormReturn<any>;
  isNewEmployee?: boolean;
}

const contractTypes = [
  { value: "indeterminato", label: "Tempo Indeterminato" },
  { value: "determinato", label: "Tempo Determinato" },
  { value: "part_time", label: "Part-time" },
  { value: "consulente", label: "Consulente" },
];

const ccnlTypes = [
  "CCNL Commercio",
  "CCNL Metalmeccanico",
  "CCNL Edilizia",
  "CCNL Turismo",
  "CCNL Telecomunicazioni",
];

export const BasicInfoTab = ({ form, isNewEmployee }: BasicInfoTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cognome *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Cognome" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Codice Fiscale *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="RSSMRA80A01H501U" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="email@esempio.it" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isNewEmployee && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Password per l'accesso" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="hire_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data Assunzione *</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="national_contract_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contratto (CCNL) *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona CCNL" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ccnlTypes.map((type) => (
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
        name="base_salary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retribuzione Mensile (€) *</FormLabel>
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
        name="dependents_count"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Familiari a Carico</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                placeholder="0"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="iban"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>IBAN</FormLabel>
            <FormControl>
              <Input {...field} placeholder="IT60 X054 2811 1010 0000 0123 456" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="inps_position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posizione INPS</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Posizione INPS" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="inail_position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posizione INAIL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Posizione INAIL" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pension_fund"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fondo Pensione</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Fondo Pensione" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_deductions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detrazioni Fiscali (€)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};