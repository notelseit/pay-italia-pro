import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { PresenceRecord } from "@/hooks/usePresence";
import { supabase } from "@/integrations/supabase/client";

interface PresenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presence?: PresenceRecord | null;
  onSubmit: (data: any) => void;
  month: number;
  year: number;
}

export const PresenceDialog = ({ 
  open, 
  onOpenChange, 
  presence, 
  onSubmit,
  month,
  year 
}: PresenceDialogProps) => {
  const { employees = [] } = useEmployees();
  const [companyId, setCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    employee_id: "",
    working_days: 0,
    vacation_days: 0,
    sick_days: 0,
    other_absences: 0,
    overtime_hours: 0,
  });

  useEffect(() => {
    const getCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.company_id) {
          setCompanyId(profile.company_id);
        }
      }
    };

    getCompanyId();
  }, []);

  useEffect(() => {
    if (presence) {
      setFormData({
        employee_id: presence.employee_id,
        working_days: presence.working_days,
        vacation_days: presence.vacation_days,
        sick_days: presence.sick_days,
        other_absences: presence.other_absences,
        overtime_hours: presence.overtime_hours,
      });
    } else {
      setFormData({
        employee_id: "",
        working_days: 0,
        vacation_days: 0,
        sick_days: 0,
        other_absences: 0,
        overtime_hours: 0,
      });
    }
  }, [presence, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      company_id: companyId,
      month,
      year,
      ...(presence && { id: presence.id }),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {presence ? "Modifica Presenza" : "Nuova Registrazione Presenza"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Dipendente *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => 
                  setFormData({ ...formData, employee_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona dipendente" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {presence ? "Salva Modifiche" : "Crea Registrazione"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
