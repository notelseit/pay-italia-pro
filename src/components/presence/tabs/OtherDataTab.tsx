import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OtherDataTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const OtherDataTab = ({ formData, setFormData }: OtherDataTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrazioni Salariali</CardTitle>
          <CardDescription>
            Importi aggiuntivi e integrazioni alla retribuzione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="wage_integration">Importo Integrazione (€)</Label>
            <Input
              id="wage_integration"
              type="number"
              min="0"
              step="0.01"
              value={formData.wage_integration || 0}
              onChange={(e) =>
                setFormData({ ...formData, wage_integration: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Integrazioni salariali da applicare al cedolino
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competenze e Trattenute</CardTitle>
          <CardDescription>
            Importi aggiuntivi e detrazioni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allowances">Competenze (€)</Label>
            <Input
              id="allowances"
              type="number"
              min="0"
              step="0.01"
              value={formData.allowances || 0}
              onChange={(e) =>
                setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Competenze aggiuntive da includere nel cedolino
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductions">Trattenute (€)</Label>
            <Input
              id="deductions"
              type="number"
              min="0"
              step="0.01"
              value={formData.deductions || 0}
              onChange={(e) =>
                setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Trattenute da applicare al cedolino
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dati Particolari</CardTitle>
          <CardDescription>
            Calcoli e importi specifici
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bilateral_entity_amount">Calcolo Ente Bilaterale (€)</Label>
            <Input
              id="bilateral_entity_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.bilateral_entity_amount || 0}
              onChange={(e) =>
                setFormData({ ...formData, bilateral_entity_amount: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Verifica del calcolo dell'ente bilaterale - può essere modificato in fase di generazione cedolino
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
