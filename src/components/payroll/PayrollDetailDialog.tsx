import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/payrollCalculations";
import { generatePayrollPDF } from "@/lib/pdfGenerator";

interface PayrollRecord {
  id: string;
  employee_id: string;
  company_id: string;
  month: number;
  year: number;
  base_salary: number;
  bonuses: number;
  overtime_pay: number;
  gross_total: number;
  inps_contribution: number;
  irpef_tax: number;
  net_salary: number;
  status: "bozza" | "confermato" | "inviato" | "generato";
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  sent_at: string | null;
  pdf_url: string | null;
  payroll_settings_version_id?: string | null;
  ccnl_version_id?: string | null;
  employees?: { 
    full_name: string;
    tax_code?: string;
    hire_date?: string;
    employee_type?: string;
    national_contract_type?: string;
    working_hours?: number;
    inps_position?: string;
    inail_position?: string;
  };
}

interface PayrollDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollRecord | null;
}

export function PayrollDetailDialog({
  open,
  onOpenChange,
  payroll,
}: PayrollDetailDialogProps) {
  if (!payroll) return null;

  const monthNames = [
    "", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "bozza": return "Bozza";
      case "confermato": return "Confermato";
      case "inviato": return "Inviato";
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "inviato":
        return "bg-primary/10 text-primary border-primary/20";
      case "confermato":
        return "bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Calcolo costo totale azienda (stimato)
  const employerContributions = Number(payroll.gross_total) * 0.30;
  const tfr = Number(payroll.gross_total) * 0.0691;
  const totalCost = Number(payroll.gross_total) + employerContributions + tfr;
  
  const totalDeductions = Number(payroll.inps_contribution) + Number(payroll.irpef_tax);

  const handleDownloadPDF = async () => {
    await generatePayrollPDF(payroll as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>Dettaglio Cedolino</DialogTitle>
              <Badge variant="outline" className={getStatusBadge(payroll.status)}>
                {getStatusLabel(payroll.status)}
              </Badge>
            </div>
            <Button onClick={handleDownloadPDF} size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Scarica PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informazioni Dipendente */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              INFORMAZIONI DIPENDENTE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{payroll.employees?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Periodo</p>
                <p className="font-medium">
                  {monthNames[payroll.month]} {payroll.year}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Retribuzione */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              RETRIBUZIONE
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Retribuzione Base</span>
                <span className="font-medium">
                  {formatCurrency(Number(payroll.base_salary))}
                </span>
              </div>
              {Number(payroll.bonuses) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Bonus</span>
                  <span className="font-medium text-primary">
                    + {formatCurrency(Number(payroll.bonuses))}
                  </span>
                </div>
              )}
              {Number(payroll.overtime_pay) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Straordinari</span>
                  <span className="font-medium text-primary">
                    + {formatCurrency(Number(payroll.overtime_pay))}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Totale Lordo</span>
                <span className="font-bold">
                  {formatCurrency(Number(payroll.gross_total))}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Trattenute */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              TRATTENUTE
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Contributi INPS (9.19%)</span>
                <span className="font-medium text-destructive">
                  - {formatCurrency(Number(payroll.inps_contribution))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">IRPEF (imposte sul reddito)</span>
                <span className="font-medium text-destructive">
                  - {formatCurrency(Number(payroll.irpef_tax))}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Totale Trattenute</span>
                <span className="font-bold text-destructive">
                  - {formatCurrency(totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Netto */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Netto da Pagare</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(Number(payroll.net_salary))}
              </span>
            </div>
          </div>

          <Separator />

          {/* Costo Azienda */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              COSTO TOTALE AZIENDA
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Retribuzione Lorda</span>
                <span>{formatCurrency(Number(payroll.gross_total))}</span>
              </div>
              <div className="flex justify-between">
                <span>Contributi INPS Datore (30%)</span>
                <span>{formatCurrency(employerContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span>TFR (6.91%)</span>
                <span>{formatCurrency(tfr)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Totale Costo</span>
                <span className="font-bold">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> I calcoli sono conformi alle normative italiane 2025.
              Gli importi dei contributi datore di lavoro e TFR sono stimati.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
