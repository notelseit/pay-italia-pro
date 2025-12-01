import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PayrollTabProps {
  form: UseFormReturn<any>;
  companyId?: string;
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

export const PayrollTab = ({ form, companyId }: PayrollTabProps) => {
  const { contracts, isLoading } = useCCNLContracts(companyId);
  const selectedContractId = form.watch("ccnl_contract_id");
  const selectedContract = contracts?.find(c => c.id === selectedContractId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contratto CCNL</CardTitle>
          <CardDescription>Seleziona il contratto collettivo nazionale di lavoro applicabile</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="ccnl_contract_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contratto CCNL</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Caricamento..." : "Seleziona contratto CCNL"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contracts
                      ?.filter((contract) => contract.id && contract.id.trim() !== "")
                      .map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedContract && (
            <div className="mt-4 space-y-2 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm">Dettagli Contratto</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedContract.base_salary && (
                  <div>
                    <span className="text-muted-foreground">Retribuzione base:</span>{" "}
                    <span className="font-medium">€{selectedContract.base_salary}</span>
                  </div>
                )}
                {selectedContract.work_hours && (
                  <div>
                    <span className="text-muted-foreground">Ore settimanali:</span>{" "}
                    <span className="font-medium">{selectedContract.work_hours}h</span>
                  </div>
                )}
                {selectedContract.vacation_days && (
                  <div>
                    <span className="text-muted-foreground">Giorni ferie:</span>{" "}
                    <span className="font-medium">{selectedContract.vacation_days}</span>
                  </div>
                )}
                {selectedContract.thirteenth_salary && (
                  <div>
                    <span className="text-muted-foreground">13ª mensilità:</span>{" "}
                    <span className="font-medium">Sì</span>
                  </div>
                )}
                {selectedContract.fourteenth_salary && (
                  <div>
                    <span className="text-muted-foreground">14ª mensilità:</span>{" "}
                    <span className="font-medium">Sì</span>
                  </div>
                )}
              </div>
              {selectedContract.notes && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <p className="mt-1">{selectedContract.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

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
    </div>
  );
};