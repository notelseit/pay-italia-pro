import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ParentalLeaveTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ParentalLeaveTab = ({ formData, setFormData }: ParentalLeaveTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maternità Facoltativa</CardTitle>
          <CardDescription>
            Congedo Parentale - Codici UniEmens 2025 (Legge di Bilancio 2025)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Nuovi codici validi dal 1° gennaio 2025 per il congedo parentale indennizzato all'80% 
              (massimo 3 mesi secondo le nuove regole)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="parental_leave_pg4_days">Codice PG4 - Congedo Parentale Orario</Label>
            <Input
              id="parental_leave_pg4_days"
              type="number"
              min="0"
              value={formData.parental_leave_pg4_days || 0}
              onChange={(e) =>
                setFormData({ ...formData, parental_leave_pg4_days: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Congedo parentale orario indennizzato all'80%
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parental_leave_pg5_days">Codice PG5 - Congedo Parentale Giornaliero</Label>
            <Input
              id="parental_leave_pg5_days"
              type="number"
              min="0"
              value={formData.parental_leave_pg5_days || 0}
              onChange={(e) =>
                setFormData({ ...formData, parental_leave_pg5_days: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Congedo parentale giornaliero indennizzato all'80%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
