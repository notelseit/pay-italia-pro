import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PresenceCalendar } from "../PresenceCalendar";
import { DayData } from "../DayCell";

interface BasicPresenceTabProps {
  formData: any;
  setFormData: (data: any) => void;
  employees: any[];
  loadingEmployees: boolean;
  days: DayData[];
  onDaysChange: (days: DayData[]) => void;
  month: number;
  year: number;
}

export const BasicPresenceTab = ({
  formData,
  setFormData,
  employees,
  loadingEmployees,
  days,
  onDaysChange,
  month,
  year,
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

        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="exclude_weekends">Escludi Sabato e Domenica</Label>
            <Switch
              id="exclude_weekends"
              checked={formData.exclude_weekends}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, exclude_weekends: checked })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Se attivo, sabato e domenica sono pre-impostati come "Non Lavorativo"
          </p>
        </div>
      </div>

      {/* Calendario mensile */}
      <PresenceCalendar
        month={month}
        year={year}
        days={days}
        onDaysChange={onDaysChange}
        excludeWeekends={formData.exclude_weekends}
      />
    </div>
  );
};
