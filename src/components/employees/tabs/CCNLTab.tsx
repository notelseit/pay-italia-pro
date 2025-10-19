import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";

interface CCNLTabProps {
  form: UseFormReturn<any>;
  companyId?: string;
}

export const CCNLTab = ({ form, companyId }: CCNLTabProps) => {
  const { contracts, isLoading } = useCCNLContracts(companyId);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="ccnl_contract_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contratto CCNL</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona contratto CCNL" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Caricamento...
                  </SelectItem>
                ) : contracts && contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.name}
                      {contract.description && ` - ${contract.description}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nessun contratto disponibile
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("ccnl_contract_id") && contracts && (
        <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
          {(() => {
            const selectedContract = contracts.find(
              (c) => c.id === form.watch("ccnl_contract_id")
            );
            if (!selectedContract) return null;

            return (
              <>
                <h4 className="font-semibold">Dettagli Contratto</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedContract.base_salary && (
                    <div>
                      <span className="text-muted-foreground">RAL Base:</span>{" "}
                      €{selectedContract.base_salary}
                    </div>
                  )}
                  {selectedContract.work_hours && (
                    <div>
                      <span className="text-muted-foreground">Ore settimanali:</span>{" "}
                      {selectedContract.work_hours}
                    </div>
                  )}
                  {selectedContract.vacation_days && (
                    <div>
                      <span className="text-muted-foreground">Giorni ferie:</span>{" "}
                      {selectedContract.vacation_days}
                    </div>
                  )}
                  {selectedContract.sick_leave_days && (
                    <div>
                      <span className="text-muted-foreground">Giorni malattia:</span>{" "}
                      {selectedContract.sick_leave_days}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Tredicesima:</span>{" "}
                    {selectedContract.thirteenth_salary ? "Sì" : "No"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quattordicesima:</span>{" "}
                    {selectedContract.fourteenth_salary ? "Sì" : "No"}
                  </div>
                  {selectedContract.meal_vouchers && (
                    <div>
                      <span className="text-muted-foreground">Buoni pasto:</span> €
                      {selectedContract.meal_voucher_amount}
                    </div>
                  )}
                </div>
                {selectedContract.notes && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Note:</span>{" "}
                    {selectedContract.notes}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
