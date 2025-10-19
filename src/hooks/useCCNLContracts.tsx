import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type CCNLContract = Tables<"ccnl_contracts">;
type CCNLContractInsert = TablesInsert<"ccnl_contracts">;
type CCNLContractUpdate = TablesUpdate<"ccnl_contracts">;

export const useCCNLContracts = (companyId?: string) => {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["ccnl_contracts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ccnl_contracts")
        .select("*")
        .eq("company_id", companyId!)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as CCNLContract[];
    },
    enabled: !!companyId,
  });

  const createContract = useMutation({
    mutationFn: async (contract: CCNLContractInsert) => {
      const { data, error } = await supabase
        .from("ccnl_contracts")
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ccnl_contracts"] });
      toast({
        title: "Contratto CCNL aggiunto",
        description: "Il contratto è stato aggiunto con successo",
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

  const updateContract = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CCNLContractUpdate }) => {
      const { data, error } = await supabase
        .from("ccnl_contracts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ccnl_contracts"] });
      toast({
        title: "Contratto CCNL aggiornato",
        description: "Il contratto è stato aggiornato con successo",
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

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ccnl_contracts")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ccnl_contracts"] });
      toast({
        title: "Contratto CCNL disattivato",
        description: "Il contratto è stato disattivato",
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
    contracts,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
  };
};
