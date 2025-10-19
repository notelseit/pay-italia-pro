import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicPresenceTabProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: any[];
  loadingEmployees: boolean;
}

export const BasicPresenceTab = ({ 
  formData, 
  setFormData, 
  employees, 
  loadingEmployees 
}: BasicPresenceTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="employee">Dipendente *</Label>
          <Select
            value={formData.employee_id}
            onValueChange={(value) => 
              setFormData({ ...formData, employee_id: value })
            }
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
          <Label htmlFor="working_days">Giorni Lavorativi *</Label>
          <Input
            id="working_days"
            type="number"
            min="0"
            value={formData.working_days}
            onChange={(e) =>
              setFormData({ ...formData, working_days: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vacation_days">Giorni di Ferie</Label>
          <Input
            id="vacation_days"
            type="number"
            min="0"
            value={formData.vacation_days}
            onChange={(e) =>
              setFormData({ ...formData, vacation_days: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sick_days">Giorni di Malattia</Label>
          <Input
            id="sick_days"
            type="number"
            min="0"
            value={formData.sick_days}
            onChange={(e) =>
              setFormData({ ...formData, sick_days: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_absences">Altre Assenze</Label>
          <Input
            id="other_absences"
            type="number"
            min="0"
            value={formData.other_absences}
            onChange={(e) =>
              setFormData({ ...formData, other_absences: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="overtime_hours">Ore Straordinarie</Label>
          <Input
            id="overtime_hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.overtime_hours}
            onChange={(e) =>
              setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="night_holiday_hours">Ore Notturno e Festivo</Label>
          <Input
            id="night_holiday_hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.night_holiday_hours}
            onChange={(e) =>
              setFormData({ ...formData, night_holiday_hours: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="exclude_weekends">Sabato e Domenica</Label>
            <Switch
              id="exclude_weekends"
              checked={formData.exclude_weekends}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, exclude_weekends: checked })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Se attivo, sabato e domenica sono esclusi dal calcolo delle ore lavorative
          </p>
        </div>
      </div>
    </div>
  );
};
