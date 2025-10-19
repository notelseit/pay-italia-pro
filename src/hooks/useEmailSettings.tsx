import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailSettings {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_secure: boolean;
  use_custom_smtp: boolean;
  from_email: string;
  from_name: string;
  created_at: string;
  updated_at: string;
}

export const useEmailSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as EmailSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<EmailSettings>) => {
      if (!settings?.id) {
        throw new Error("Impostazioni email non trovate");
      }

      const { data, error } = await supabase
        .from("email_settings")
        .update(updates)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
      toast({
        title: "Impostazioni aggiornate",
        description: "Le impostazioni email sono state aggiornate con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
};
