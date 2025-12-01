import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface JobRoleProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const JobRoleProtocolDialog = ({ open, onOpenChange, companyId }: JobRoleProtocolDialogProps) => {
  const [formData, setFormData] = useState({
    job_role: "",
    protocol_id: "",
  });

  const queryClient = useQueryClient();

  // Fetch existing mappings
  const { data: mappings } = useQuery({
    queryKey: ["job-role-protocols", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_role_protocols")
        .select(`
          id,
          job_role,
          protocol_id,
          medical_protocols (
            id,
            name
          )
        `)
        .eq("company_id", companyId)
        .order("job_role");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  // Fetch protocols
  const { data: protocols } = useQuery({
    queryKey: ["medical-protocols", companyId],
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
    enabled: !!companyId && open,
  });

  const createMappingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("job_role_protocols").insert({
        company_id: companyId,
        job_role: data.job_role,
        protocol_id: data.protocol_id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Associazione mansione-protocollo creata");
      queryClient.invalidateQueries({ queryKey: ["job-role-protocols"] });
      setFormData({ job_role: "", protocol_id: "" });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_role_protocols")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Associazione eliminata");
      queryClient.invalidateQueries({ queryKey: ["job-role-protocols"] });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_role || !formData.protocol_id) {
      toast.error("Compila tutti i campi");
      return;
    }
    createMappingMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Mansioni e Protocolli Sanitari</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Nuova Associazione</h3>
            
            <div className="space-y-2">
              <Label htmlFor="job_role">Mansione</Label>
              <Input
                id="job_role"
                value={formData.job_role}
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                placeholder="es. Operatore VDT, Magazziniere..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol_id">Protocollo Sanitario</Label>
              <Select
                value={formData.protocol_id}
                onValueChange={(value) => setFormData({ ...formData, protocol_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona protocollo" />
                </SelectTrigger>
                <SelectContent>
                  {protocols?.map((protocol) => (
                    <SelectItem key={protocol.id} value={protocol.id}>
                      {protocol.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={createMappingMutation.isPending}>
              {createMappingMutation.isPending ? "Salvataggio..." : "Aggiungi Associazione"}
            </Button>
          </form>

          <div>
            <h3 className="font-semibold mb-4">Associazioni Esistenti</h3>
            {mappings && mappings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mansione</TableHead>
                    <TableHead>Protocollo Sanitario</TableHead>
                    <TableHead className="w-20">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping: any) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.job_role}</TableCell>
                      <TableCell>{mapping.medical_protocols?.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMappingMutation.mutate(mapping.id)}
                          disabled={deleteMappingMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessuna associazione configurata
              </p>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Come funziona?</h4>
            <p className="text-sm text-muted-foreground">
              Quando assegni una mansione a un dipendente nella sua scheda anagrafica, 
              il sistema assocerà automaticamente i protocolli sanitari configurati per quella mansione, 
              creando o aggiornando la sua cartella sanitaria.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};