import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const NotificationSettingsDialog = ({ open, onOpenChange, companyId }: NotificationSettingsDialogProps) => {
  const [visitDays, setVisitDays] = useState<number[]>([30, 15, 7]);
  const [judgmentDays, setJudgmentDays] = useState<number[]>([60, 30, 15]);
  const [visitActive, setVisitActive] = useState(true);
  const [judgmentActive, setJudgmentActive] = useState(true);
  const [newVisitDay, setNewVisitDay] = useState("");
  const [newJudgmentDay, setNewJudgmentDay] = useState("");

  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["notification-settings", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("company_id", companyId);

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  useEffect(() => {
    if (settings) {
      const visitSetting = settings.find(s => s.notification_type === 'medical_visit');
      const judgmentSetting = settings.find(s => s.notification_type === 'fitness_judgment');
      
      if (visitSetting) {
        setVisitDays(visitSetting.days_before_expiry || []);
        setVisitActive(visitSetting.is_active || false);
      }
      if (judgmentSetting) {
        setJudgmentDays(judgmentSetting.days_before_expiry || []);
        setJudgmentActive(judgmentSetting.is_active || false);
      }
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      // Update visit settings
      await supabase
        .from("notification_settings")
        .upsert({
          company_id: companyId,
          notification_type: 'medical_visit',
          days_before_expiry: visitDays,
          is_active: visitActive,
        }, { onConflict: 'company_id,notification_type' });

      // Update judgment settings
      await supabase
        .from("notification_settings")
        .upsert({
          company_id: companyId,
          notification_type: 'fitness_judgment',
          days_before_expiry: judgmentDays,
          is_active: judgmentActive,
        }, { onConflict: 'company_id,notification_type' });
    },
    onSuccess: () => {
      toast.success("Impostazioni notifiche aggiornate");
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const addVisitDay = () => {
    const day = parseInt(newVisitDay);
    if (day > 0 && !visitDays.includes(day)) {
      setVisitDays([...visitDays, day].sort((a, b) => b - a));
      setNewVisitDay("");
    }
  };

  const removeVisitDay = (day: number) => {
    setVisitDays(visitDays.filter(d => d !== day));
  };

  const addJudgmentDay = () => {
    const day = parseInt(newJudgmentDay);
    if (day > 0 && !judgmentDays.includes(day)) {
      setJudgmentDays([...judgmentDays, day].sort((a, b) => b - a));
      setNewJudgmentDay("");
    }
  };

  const removeJudgmentDay = (day: number) => {
    setJudgmentDays(judgmentDays.filter(d => d !== day));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurazione Notifiche Automatiche</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notifiche Visite Mediche</h3>
                <p className="text-sm text-muted-foreground">
                  Invia notifiche automatiche prima delle visite programmate
                </p>
              </div>
              <Switch checked={visitActive} onCheckedChange={setVisitActive} />
            </div>

            <div className="space-y-2">
              <Label>Giorni prima della scadenza</Label>
              <div className="flex gap-2 flex-wrap">
                {visitDays.map((day) => (
                  <Badge key={day} variant="secondary" className="gap-1">
                    {day} giorni
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeVisitDay(day)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Aggiungi giorni"
                  value={newVisitDay}
                  onChange={(e) => setNewVisitDay(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addVisitDay()}
                />
                <Button type="button" onClick={addVisitDay} variant="outline">
                  Aggiungi
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notifiche Giudizi di Idoneità</h3>
                <p className="text-sm text-muted-foreground">
                  Invia notifiche automatiche prima della scadenza dei giudizi
                </p>
              </div>
              <Switch checked={judgmentActive} onCheckedChange={setJudgmentActive} />
            </div>

            <div className="space-y-2">
              <Label>Giorni prima della scadenza</Label>
              <div className="flex gap-2 flex-wrap">
                {judgmentDays.map((day) => (
                  <Badge key={day} variant="secondary" className="gap-1">
                    {day} giorni
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeJudgmentDay(day)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Aggiungi giorni"
                  value={newJudgmentDay}
                  onChange={(e) => setNewJudgmentDay(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addJudgmentDay()}
                />
                <Button type="button" onClick={addJudgmentDay} variant="outline">
                  Aggiungi
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Come funziona?</p>
            <p className="text-muted-foreground">
              Il sistema invierà automaticamente notifiche email nei giorni specificati prima delle scadenze.
              Le email vengono inviate ogni giorno alle 9:00 AM all'indirizzo email dell'azienda.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button onClick={() => updateSettingsMutation.mutate()} disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? "Salvataggio..." : "Salva Configurazione"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};