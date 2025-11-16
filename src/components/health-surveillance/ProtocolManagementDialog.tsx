import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProtocolManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const ProtocolManagementDialog = ({ open, onOpenChange, companyId }: ProtocolManagementDialogProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reference_law: "",
    risk_assessment: "",
    allegato_3b_mapping: "",
  });

  const queryClient = useQueryClient();

  // Fetch protocols
  const { data: protocols } = useQuery({
    queryKey: ["medical-protocols-list", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_protocols")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("medical_protocols").insert({
        company_id: companyId,
        name: data.name,
        description: data.description || null,
        reference_law: data.reference_law || null,
        risk_assessment: data.risk_assessment || null,
        allegato_3b_mapping: data.allegato_3b_mapping ? JSON.parse(data.allegato_3b_mapping) : null,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocollo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["medical-protocols-list"] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("medical_protocols")
        .update({
          name: data.name,
          description: data.description || null,
          reference_law: data.reference_law || null,
          risk_assessment: data.risk_assessment || null,
          allegato_3b_mapping: data.allegato_3b_mapping ? JSON.parse(data.allegato_3b_mapping) : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocollo aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["medical-protocols-list"] });
      resetForm();
      setIsFormOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medical_protocols").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Protocollo eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["medical-protocols-list"] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      reference_law: "",
      risk_assessment: "",
      allegato_3b_mapping: "",
    });
  };

  const handleEdit = (protocol: any) => {
    setEditingId(protocol.id);
    setFormData({
      name: protocol.name,
      description: protocol.description || "",
      reference_law: protocol.reference_law || "",
      risk_assessment: protocol.risk_assessment || "",
      allegato_3b_mapping: protocol.allegato_3b_mapping ? JSON.stringify(protocol.allegato_3b_mapping) : "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Il nome del protocollo è obbligatorio");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestione Protocolli Sanitari</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="list" value={isFormOpen ? "form" : "list"} onValueChange={(v) => setIsFormOpen(v === "form")}>
            <TabsList>
              <TabsTrigger value="list">Lista Protocolli</TabsTrigger>
              <TabsTrigger value="form">
                {editingId ? "Modifica Protocollo" : "Nuovo Protocollo"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { resetForm(); setEditingId(null); setIsFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuovo Protocollo
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Riferimento Normativo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protocols?.map((protocol) => (
                    <TableRow key={protocol.id}>
                      <TableCell className="font-medium">{protocol.name}</TableCell>
                      <TableCell>{protocol.reference_law || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={protocol.is_active ? "default" : "secondary"}>
                          {protocol.is_active ? "Attivo" : "Inattivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(protocol)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(protocol.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="form">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Protocollo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Es: Protocollo Videoterminalisti"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_law">Riferimento Normativo</Label>
                  <Input
                    id="reference_law"
                    value={formData.reference_law}
                    onChange={(e) => setFormData({ ...formData, reference_law: e.target.value })}
                    placeholder="Es: D.Lgs. 81/08, D.Lgs. 101/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione del protocollo sanitario"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_assessment">Valutazione Dei Rischi (VDR)</Label>
                  <Textarea
                    id="risk_assessment"
                    value={formData.risk_assessment}
                    onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
                    placeholder="Dettagli della valutazione dei rischi"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allegato_3b_mapping">Mappatura Allegato 3B (JSON)</Label>
                  <Textarea
                    id="allegato_3b_mapping"
                    value={formData.allegato_3b_mapping}
                    onChange={(e) => setFormData({ ...formData, allegato_3b_mapping: e.target.value })}
                    placeholder='{"rischi": ["rumore", "vibrazioni"], "agenti": ["chimici"]}'
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); resetForm(); setEditingId(null); }}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Aggiorna" : "Crea"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo protocollo? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};