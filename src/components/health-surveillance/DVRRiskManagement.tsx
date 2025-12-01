import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DVRRiskManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

const riskCategories = [
  { value: "fisico", label: "Fisico" },
  { value: "chimico", label: "Chimico" },
  { value: "biologico", label: "Biologico" },
  { value: "ergonomico", label: "Ergonomico" },
  { value: "biomeccanico", label: "Biomeccanico" },
  { value: "psicosociale", label: "Psicosociale" },
  { value: "organizzativo", label: "Organizzativo" },
];

const severityLevels = [
  { value: "basso", label: "Basso", color: "bg-green-500" },
  { value: "medio", label: "Medio", color: "bg-yellow-500" },
  { value: "alto", label: "Alto", color: "bg-orange-500" },
  { value: "molto_alto", label: "Molto Alto", color: "bg-red-500" },
];

export const DVRRiskManagement = ({ open, onOpenChange, companyId }: DVRRiskManagementProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    risk_code: "",
    risk_name: "",
    risk_category: "",
    description: "",
    severity_level: "",
  });

  const queryClient = useQueryClient();

  const { data: risks } = useQuery({
    queryKey: ["dvr-risks", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dvr_risks")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("risk_code");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: protocols } = useQuery({
    queryKey: ["protocols-for-risk", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_protocols")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addRiskMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("dvr_risks").insert({
        company_id: companyId,
        ...data,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rischio DVR aggiunto");
      queryClient.invalidateQueries({ queryKey: ["dvr-risks"] });
      setIsAdding(false);
      setFormData({
        risk_code: "",
        risk_name: "",
        risk_category: "",
        description: "",
        severity_level: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      const { error } = await supabase
        .from("dvr_risks")
        .update({ is_active: false })
        .eq("id", riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rischio rimosso");
      queryClient.invalidateQueries({ queryKey: ["dvr-risks"] });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const updateProtocolsMutation = useMutation({
    mutationFn: async ({ riskId, protocolIds }: { riskId: string; protocolIds: string[] }) => {
      const { error } = await supabase
        .from("dvr_risks")
        .update({ suggested_protocols: protocolIds })
        .eq("id", riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocolli aggiornati");
      queryClient.invalidateQueries({ queryKey: ["dvr-risks"] });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.risk_code || !formData.risk_name || !formData.risk_category || !formData.severity_level) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    addRiskMutation.mutate(formData);
  };

  const getSeverityColor = (level: string) => {
    return severityLevels.find((s) => s.value === level)?.color || "bg-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gestione Rischi DVR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Risk Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Aggiungi Nuovo Rischio</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Codice Rischio *</Label>
                  <Input
                    value={formData.risk_code}
                    onChange={(e) => setFormData({ ...formData, risk_code: e.target.value })}
                    placeholder="es. R009"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome Rischio *</Label>
                  <Input
                    value={formData.risk_name}
                    onChange={(e) => setFormData({ ...formData, risk_name: e.target.value })}
                    placeholder="es. Lavori in Altezza"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={formData.risk_category}
                    onValueChange={(value) => setFormData({ ...formData, risk_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Livello di Gravità *</Label>
                  <Select
                    value={formData.severity_level}
                    onValueChange={(value) => setFormData({ ...formData, severity_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona gravità" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descrizione dettagliata del rischio..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={addRiskMutation.isPending}>
                  {addRiskMutation.isPending ? "Salvataggio..." : "Aggiungi Rischio"}
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Rischio DVR
            </Button>
          )}

          {/* Risks List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Rischi Configurati</h3>
            {risks && risks.length > 0 ? (
              <div className="space-y-3">
                {risks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{risk.risk_code}</Badge>
                          <h4 className="font-semibold">{risk.risk_name}</h4>
                          <Badge className={getSeverityColor(risk.severity_level)}>
                            {severityLevels.find((s) => s.value === risk.severity_level)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Categoria: {riskCategories.find((c) => c.value === risk.risk_category)?.label}
                        </p>
                        {risk.description && (
                          <p className="text-sm">{risk.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRiskMutation.mutate(risk.id)}
                        disabled={deleteRiskMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <Label className="text-sm">Protocolli Suggeriti</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(risk.suggested_protocols) &&
                          risk.suggested_protocols.map((protocolName: string) => (
                            <Badge key={protocolName} variant="secondary">
                              {protocolName}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nessun rischio DVR configurato
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
