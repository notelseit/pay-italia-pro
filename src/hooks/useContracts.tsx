import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useContracts = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["employment_contracts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employment_contracts")
        .select(`
          *,
          employees (
            id,
            full_name,
            email,
            tax_code
          )
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const { data: templates } = useQuery({
    queryKey: ["employment_contract_templates", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employment_contracts")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_template", true)
        .order("contract_name");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const createContract = useMutation({
    mutationFn: async (contractData: any) => {
      const { data, error } = await supabase
        .from("employment_contracts")
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment_contracts"] });
      toast.success("Contratto creato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore nella creazione del contratto: " + error.message);
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...contractData }: any) => {
      const { data, error } = await supabase
        .from("employment_contracts")
        .update(contractData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment_contracts"] });
      toast.success("Contratto aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore nell'aggiornamento del contratto: " + error.message);
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employment_contracts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment_contracts"] });
      toast.success("Contratto eliminato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore nell'eliminazione del contratto: " + error.message);
    },
  });

  return {
    contracts,
    templates,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
  };
};
