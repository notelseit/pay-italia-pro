import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type VersionEntityType = "ccnl" | "payroll_settings" | "contract";

export interface VersionRecord {
  id: string;
  version_number: number;
  data_json: Record<string, any>;
  change_summary: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  parent_id: string;
  company_id: string;
}

const TABLE_MAP: Record<VersionEntityType, string> = {
  ccnl: "ccnl_versions",
  payroll_settings: "payroll_settings_versions",
  contract: "contract_versions",
};

const PARENT_COL_MAP: Record<VersionEntityType, string> = {
  ccnl: "ccnl_id",
  payroll_settings: "payroll_settings_id",
  contract: "contract_id",
};

export function useVersionHistory(entityType: VersionEntityType, entityId?: string) {
  const queryClient = useQueryClient();
  const table = TABLE_MAP[entityType];
  const parentCol = PARENT_COL_MAP[entityType];

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["version_history", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .eq(parentCol, entityId!)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return (data || []).map((v: any) => ({
        id: v.id,
        version_number: v.version_number,
        data_json: v.data_json,
        change_summary: v.change_summary,
        is_active: v.is_active,
        created_at: v.created_at,
        created_by: v.created_by,
        parent_id: v[parentCol],
        company_id: v.company_id,
      })) as VersionRecord[];
    },
    enabled: !!entityId,
  });

  const activeVersion = versions.find((v) => v.is_active) || null;

  const createVersion = useMutation({
    mutationFn: async ({
      parentId,
      companyId,
      dataJson,
      changeSummary,
    }: {
      parentId: string;
      companyId: string;
      dataJson: Record<string, any>;
      changeSummary: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const insertData: any = {
        [parentCol]: parentId,
        company_id: companyId,
        data_json: dataJson,
        change_summary: changeSummary,
        is_active: true,
        created_by: userData.user?.id || null,
      };

      const { data, error } = await supabase
        .from(table as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["version_history", entityType, entityId] });
      toast.success("Nuova versione creata");
    },
    onError: (error: any) => {
      toast.error("Errore creazione versione: " + error.message);
    },
  });

  return {
    versions,
    activeVersion,
    isLoading,
    createVersion,
  };
}
