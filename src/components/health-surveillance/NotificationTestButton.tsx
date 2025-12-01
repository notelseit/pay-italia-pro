import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useState } from "react";

export const NotificationTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-medical-visit-expiry', {
        body: { manual_trigger: true }
      });

      if (error) throw error;

      toast.success(`Controllo completato: ${data.notifications_generated} notifiche generate`, {
        description: `Visite in scadenza: ${data.expiring_visits_count}, Giudizi in scadenza: ${data.expiring_judgments_count}`
      });

      console.log('Notifiche generate:', data.notifications);
    } catch (error: any) {
      toast.error('Errore durante il controllo delle notifiche', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTestNotifications}
      disabled={isLoading}
    >
      <Bell className="mr-2 h-4 w-4" />
      {isLoading ? 'Controllo in corso...' : 'Testa Notifiche Scadenze'}
    </Button>
  );
};