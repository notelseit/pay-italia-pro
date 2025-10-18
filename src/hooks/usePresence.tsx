import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PresenceRecord {
  id: string;
  employee_id: string;
  company_id: string;
  month: number;
  year: number;
  working_days: number;
  vacation_days: number;
  sick_days: number;
  other_absences: number;
  overtime_hours: number;
  exclude_weekends: boolean;
  night_holiday_hours: number;
  is_validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
  updated_at: string;
  employees?: {
    full_name: string;
  };
}

export const usePresence = (month: number, year: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: presenceRecords = [], isLoading } = useQuery({
    queryKey: ["presence", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presence_records")
        .select(`
          *,
          employees (
            full_name
          )
        `)
        .eq("month", month)
        .eq("year", year)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PresenceRecord[];
    },
  });

  const createPresence = useMutation({
    mutationFn: async (newPresence: Omit<PresenceRecord, "id" | "created_at" | "updated_at" | "employees">) => {
      const { data, error } = await supabase
        .from("presence_records")
        .insert(newPresence)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza registrata",
        description: "La registrazione è stata creata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePresence = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PresenceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("presence_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza aggiornata",
        description: "La registrazione è stata modificata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validatePresence = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("presence_records")
        .update({
          is_validated: true,
          validated_at: new Date().toISOString(),
          validated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza validata",
        description: "La registrazione è stata validata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePresence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("presence_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
      toast({
        title: "Presenza eliminata",
        description: "La registrazione è stata eliminata con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    presenceRecords,
    isLoading,
    createPresence,
    updatePresence,
    validatePresence,
    deletePresence,
  };
};
