import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, Euro, Clock, FileText, User, Briefcase, MapPin } from "lucide-react";

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
              <h3 className="text-xl font-semibold">{contract.contract_name}</h3>
              {contract.employees && (
                <p className="text-sm text-muted-foreground">
                  {contract.employees.full_name} - {contract.employees.email}
                </p>
              )}
              {contract.is_template && (
                <Badge variant="outline" className="mt-2">
                  Modello
                </Badge>
              )}
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
                  <p className="text-sm font-medium text-muted-foreground">Data Inizio</p>
                  <p className="text-base font-semibold">
                    {contract.start_date
                      ? format(new Date(contract.start_date), "dd MMMM yyyy", { locale: it })
                      : "-"}
                  </p>
                </div>
              </div>

              {contract.end_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Fine</p>
                    <p className="text-base font-semibold">
                      {format(new Date(contract.end_date), "dd MMMM yyyy", { locale: it })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualifica</p>
                  <p className="text-base font-semibold">{contract.job_title || "-"}</p>
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
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Luogo di Lavoro</p>
                  <p className="text-base font-semibold">{contract.work_location || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          {contract.job_description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold">Descrizione Mansioni</h4>
                <p className="text-sm whitespace-pre-wrap">{contract.job_description}</p>
              </div>
            </>
          )}

          {/* Benefits */}
          {contract.benefits && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold">Benefit e Trattamento Economico</h4>
                <p className="text-sm whitespace-pre-wrap">{contract.benefits}</p>
              </div>
            </>
          )}

          {/* Additional Information */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold">Dettagli Contrattuali</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Periodo di Prova</p>
                <p className="text-sm">{contract.trial_period_days} giorni</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Preavviso</p>
                <p className="text-sm">{contract.notice_period_days} giorni</p>
              </div>
            </div>
          </div>

          {/* Additional Clauses */}
          {contract.additional_clauses && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold">Clausole Aggiuntive</h4>
                <p className="text-sm whitespace-pre-wrap">{contract.additional_clauses}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
