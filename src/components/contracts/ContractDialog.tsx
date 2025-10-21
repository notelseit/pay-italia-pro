import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, Euro, Clock, FileText, User } from "lucide-react";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

export const ContractDialog = ({ open, onOpenChange, contract }: ContractDialogProps) => {
  if (!contract) return null;

  const contractTypeLabels: Record<string, string> = {
    indeterminato: "Tempo Indeterminato",
    determinato: "Tempo Determinato",
    apprendistato: "Apprendistato",
    stage: "Stage",
    collaborazione: "Collaborazione",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Dettagli Contratto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{contract.full_name}</h3>
              <p className="text-sm text-muted-foreground">{contract.email}</p>
            </div>
            <Badge variant={contract.is_active ? "default" : "secondary"}>
              {contract.is_active ? "Attivo" : "Cessato"}
            </Badge>
          </div>

          <Separator />

          {/* Contract Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo Contratto</p>
                  <p className="text-base font-semibold">
                    {contractTypeLabels[contract.contract_type]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Assunzione</p>
                  <p className="text-base font-semibold">
                    {contract.hire_date
                      ? format(new Date(contract.hire_date), "dd MMMM yyyy", { locale: it })
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Codice Fiscale</p>
                  <p className="text-base font-semibold">{contract.tax_code}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retribuzione Base</p>
                  <p className="text-base font-semibold">
                    € {contract.base_salary?.toLocaleString("it-IT")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ore Lavorative</p>
                  <p className="text-base font-semibold">
                    {contract.working_hours || "-"} ore/settimana
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo Dipendente</p>
                  <p className="text-base font-semibold">{contract.employee_type || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Informazioni Aggiuntive</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posizione INPS</p>
                <p className="text-sm">{contract.inps_position || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Posizione INAIL</p>
                <p className="text-sm">{contract.inail_position || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Fondo Pensione</p>
                <p className="text-sm">{contract.pension_fund || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria Pagamento</p>
                <p className="text-sm">{contract.payment_category || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                <p className="text-sm font-mono">{contract.iban || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Familiari a Carico</p>
                <p className="text-sm">{contract.dependents_count || 0}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-semibold">Contatti</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefono</p>
                <p className="text-sm">{contract.phone || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{contract.email}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Indirizzo</p>
                <p className="text-sm">
                  {contract.city && contract.province
                    ? `${contract.city} (${contract.province}), ${contract.postal_code || ""} - ${contract.country || "Italia"}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
