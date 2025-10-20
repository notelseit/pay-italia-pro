import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { calculatePayroll, formatCurrency, PayrollResult } from "@/lib/payrollCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface PayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  month: number;
  year: number;
  companyId: string;
}

export const PayrollDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  month,
  year,
  companyId 
}: PayrollDialogProps) => {
  const { employees = [], isLoading: loadingEmployees } = useEmployees(companyId);
  const { contracts } = useCCNLContracts(companyId);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
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
  const [calculation, setCalculation] = useState<PayrollResult | null>(null);

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      const ccnlContract = contracts?.find(c => c.id === employee?.ccnl_contract_id);
      
      if (employee) {
        setFormData(prev => ({
          ...prev,
          baseSalary: Number(employee.base_salary) || 0,
          dependentsCount: employee.dependents_count || 0,
          taxDeductions: Number(employee.tax_deductions) || 0,
          inpsRate: ccnlContract?.inps_rate ? Number(ccnlContract.inps_rate) : 9.19,
          inailRate: ccnlContract?.inail_rate ? Number(ccnlContract.inail_rate) : 1.5,
          thirteenthSalary: ccnlContract?.thirteenth_salary ?? true,
          fourteenthSalary: ccnlContract?.fourteenth_salary ?? false,
          mealVoucherAmount: ccnlContract?.meal_voucher_amount ? Number(ccnlContract.meal_voucher_amount) : 0,
        }));
      }
    }
  }, [selectedEmployee, employees, contracts]);

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
    if (!calculation) return;

    onSubmit({
      employee_id: selectedEmployee,
      company_id: companyId,
      month,
      year,
      base_salary: formData.baseSalary,
      bonuses: formData.bonuses,
      overtime_pay: formData.overtimePay,
      gross_total: calculation.grossSalary,
      inps_contribution: calculation.inpsEmployee,
      irpef_tax: calculation.irpefGross,
      net_salary: calculation.netSalary,
      status: "bozza",
    });
    
    onOpenChange(false);
    setSelectedEmployee("");
    setFormData({
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
    setCalculation(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Genera Cedolino</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="employee">Dipendente *</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
                required
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingEmployees ? "Caricamento..." : "Seleziona dipendente"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 && !loadingEmployees ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nessun dipendente disponibile
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseSalary">Stipendio Base (RAL/13) *</Label>
              <Input
                id="baseSalary"
                type="number"
                min="0"
                step="0.01"
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonuses">Premi/Bonus</Label>
              <Input
                id="bonuses"
                type="number"
                min="0"
                step="0.01"
                value={formData.bonuses}
                onChange={(e) =>
                  setFormData({ ...formData, bonuses: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimePay">Straordinari</Label>
              <Input
                id="overtimePay"
                type="number"
                min="0"
                step="0.01"
                value={formData.overtimePay}
                onChange={(e) =>
                  setFormData({ ...formData, overtimePay: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependentsCount">Figli a Carico</Label>
              <Input
                id="dependentsCount"
                type="number"
                min="0"
                value={formData.dependentsCount}
                onChange={(e) =>
                  setFormData({ ...formData, dependentsCount: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxDeductions">Detrazioni Aggiuntive</Label>
              <Input
                id="taxDeductions"
                type="number"
                min="0"
                step="0.01"
                value={formData.taxDeductions}
                onChange={(e) =>
                  setFormData({ ...formData, taxDeductions: parseFloat(e.target.value) || 0 })
                }
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
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Calcolo Cedolino</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lordo Mensile</p>
                    <p className="text-lg font-semibold">{formatCurrency(calculation.grossSalary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Netto in Busta</p>
                    <p className="text-lg font-semibold text-primary">{formatCurrency(calculation.netSalary)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-semibold">Trattenute:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">INPS Dipendente:</span>
                      <span>{formatCurrency(calculation.inpsEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IRPEF:</span>
                      <span>{formatCurrency(calculation.irpefGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add. Regionale:</span>
                      <span>{formatCurrency(calculation.regionalTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add. Comunale:</span>
                      <span>{formatCurrency(calculation.municipalTax)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-semibold">Detrazioni:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lavoro Dipendente:</span>
                      <span className="text-green-600">{formatCurrency(calculation.workDeductions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Familiari a Carico:</span>
                      <span className="text-green-600">{formatCurrency(calculation.familyDeductions)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-semibold">Costi Azienda:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">INPS Datore:</span>
                      <span>{formatCurrency(calculation.inpsEmployer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TFR:</span>
                      <span>{formatCurrency(calculation.tfr)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Costo Totale Azienda:</span>
                    <span className="font-semibold">{formatCurrency(calculation.totalCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={!selectedEmployee || !calculation}>
              Genera Cedolino
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
