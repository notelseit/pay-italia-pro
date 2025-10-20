import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePayroll, formatCurrency } from "@/lib/payrollCalculations";
import { Separator } from "@/components/ui/separator";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PayrollEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  payroll: any;
  companyId: string;
}

export const PayrollEditDialog = ({
  open,
  onOpenChange,
  onSubmit,
  payroll,
  companyId,
}: PayrollEditDialogProps) => {
  const { contracts } = useCCNLContracts(companyId);
  
  // Recupera il dipendente associato al cedolino
  const { data: employee } = useQuery({
    queryKey: ["employee", payroll?.employee_id],
    queryFn: async () => {
      if (!payroll?.employee_id) return null;
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("id", payroll.employee_id)
        .single();
      return data;
    },
    enabled: !!payroll?.employee_id,
  });
  
  const [formData, setFormData] = useState({
    baseSalary: 0,
    bonuses: 0,
    overtimePay: 0,
    dependentsCount: 0,
    taxDeductions: 0,
    inpsRate: 9.19,
    inailRate: 1.5,
    thirteenthSalary: true,
    fourteenthSalary: false,
    mealVoucherAmount: 0,
  });

  const [calculation, setCalculation] = useState<any>(null);

  useEffect(() => {
    if (payroll && employee) {
      const ccnlContract = contracts?.find(c => c.id === employee?.ccnl_contract_id);
      
      setFormData({
        baseSalary: Number(payroll.base_salary),
        bonuses: Number(payroll.bonuses),
        overtimePay: Number(payroll.overtime_pay),
        dependentsCount: employee.dependents_count || 0,
        taxDeductions: Number(employee.tax_deductions) || 0,
        inpsRate: ccnlContract?.inps_rate ? Number(ccnlContract.inps_rate) : 9.19,
        inailRate: ccnlContract?.inail_rate ? Number(ccnlContract.inail_rate) : 1.5,
        thirteenthSalary: ccnlContract?.thirteenth_salary ?? true,
        fourteenthSalary: ccnlContract?.fourteenth_salary ?? false,
        mealVoucherAmount: ccnlContract?.meal_voucher_amount ? Number(ccnlContract.meal_voucher_amount) : 0,
      });
    }
  }, [payroll, employee, contracts]);

  useEffect(() => {
    if (formData.baseSalary > 0) {
      const result = calculatePayroll({
        baseSalary: formData.baseSalary,
        bonuses: formData.bonuses,
        overtimePay: formData.overtimePay,
        dependentsCount: formData.dependentsCount,
        taxDeductions: formData.taxDeductions,
        ccnlContract: {
          inps_rate: formData.inpsRate / 100,
          inail_rate: formData.inailRate / 100,
          thirteenth_salary: formData.thirteenthSalary,
          fourteenth_salary: formData.fourteenthSalary,
          meal_voucher_amount: formData.mealVoucherAmount,
        }
      });
      setCalculation(result);
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (calculation && payroll) {
      onSubmit({
        id: payroll.id,
        base_salary: formData.baseSalary,
        bonuses: formData.bonuses,
        overtime_pay: formData.overtimePay,
        gross_total: calculation.grossSalary,
        inps_contribution: calculation.inpsEmployee,
        irpef_tax: calculation.irpef,
        net_salary: calculation.netSalary,
      });
      onOpenChange(false);
    }
  };

  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Cedolino - {payroll.employees?.full_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Retribuzione Base (€) *</Label>
              <Input
                id="baseSalary"
                type="number"
                step="0.01"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonuses">Premi e Bonus (€)</Label>
              <Input
                id="bonuses"
                type="number"
                step="0.01"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimePay">Straordinari (€)</Label>
              <Input
                id="overtimePay"
                type="number"
                step="0.01"
                value={formData.overtimePay}
                onChange={(e) => setFormData({ ...formData, overtimePay: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependentsCount">Familiari a Carico</Label>
              <Input
                id="dependentsCount"
                type="number"
                value={formData.dependentsCount}
                onChange={(e) => setFormData({ ...formData, dependentsCount: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxDeductions">Altre Detrazioni (€)</Label>
              <Input
                id="taxDeductions"
                type="number"
                step="0.01"
                value={formData.taxDeductions}
                onChange={(e) => setFormData({ ...formData, taxDeductions: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* CCNL Data Section */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Dati CCNL (Modificabili)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inpsRate">Aliquota INPS (%)</Label>
                <Input
                  id="inpsRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.inpsRate}
                  onChange={(e) =>
                    setFormData({ ...formData, inpsRate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inailRate">Aliquota INAIL (%)</Label>
                <Input
                  id="inailRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.inailRate}
                  onChange={(e) =>
                    setFormData({ ...formData, inailRate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealVoucherAmount">Buoni Pasto (€)</Label>
                <Input
                  id="mealVoucherAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.mealVoucherAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, mealVoucherAmount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2 flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.thirteenthSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, thirteenthSalary: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Tredicesima</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.fourteenthSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, fourteenthSalary: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Quattordicesima</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {calculation && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo Calcolo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retribuzione Lorda:</span>
                    <span className="font-semibold">{formatCurrency(calculation.grossSalary)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contributi INPS (9.19%):</span>
                      <span className="text-destructive">-{formatCurrency(calculation.inpsEmployee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IRPEF:</span>
                      <span className="text-destructive">-{formatCurrency(calculation.irpef)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Addizionale Regionale:</span>
                      <span className="text-destructive">-{formatCurrency(calculation.regionalTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Addizionale Comunale:</span>
                      <span className="text-destructive">-{formatCurrency(calculation.municipalTax)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-base font-bold pt-2">
                    <span>Netto in Busta:</span>
                    <span className="text-primary text-xl">{formatCurrency(calculation.netSalary)}</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TFR Maturato:</span>
                    <span>{formatCurrency(calculation.tfr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contributi Datore (30.08%):</span>
                    <span>{formatCurrency(calculation.inpsEmployer)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-border/50">
                    <span>Costo Totale Azienda:</span>
                    <span>{formatCurrency(calculation.totalCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="hero" disabled={!calculation}>
              Salva Modifiche
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
