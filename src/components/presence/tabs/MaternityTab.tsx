import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MaternityTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const MaternityTab = ({ formData, setFormData }: MaternityTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maternità Obbligatoria</CardTitle>
          <CardDescription>
            Gestione del Congedo di Maternità per il flusso UniEmens INPS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mandatory_maternity_days">Giorni di Maternità Obbligatoria</Label>
            <Input
              id="mandatory_maternity_days"
              type="number"
              min="0"
              value={formData.mandatory_maternity_days || 0}
              onChange={(e) =>
                setFormData({ ...formData, mandatory_maternity_days: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Numero di giorni di congedo di maternità obbligatoria
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maternity_code_ma1">Codice MA1</Label>
                <p className="text-xs text-muted-foreground">
                  Periodi di Congedo di Maternità e di Paternità Alternativo
                </p>
              </div>
              <Switch
                id="maternity_code_ma1"
                checked={formData.maternity_code_ma1 || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, maternity_code_ma1: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
