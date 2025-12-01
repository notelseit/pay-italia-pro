import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface VisitChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: string;
  employeeId: string;
  companyId: string;
}

export const VisitChecklistDialog = ({ 
  open, 
  onOpenChange, 
  visitId, 
  employeeId, 
  companyId 
}: VisitChecklistDialogProps) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState("");
  const queryClient = useQueryClient();

  const { data: checklist } = useQuery({
    queryKey: ["visit-checklist", visitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visit_checklists")
        .select("*")
        .eq("visit_id", visitId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: open && !!visitId,
  });

  useEffect(() => {
    if (checklist?.checklist_items) {
      try {
        const parsedItems = typeof checklist.checklist_items === 'string' 
          ? JSON.parse(checklist.checklist_items)
          : checklist.checklist_items;
        setItems(Array.isArray(parsedItems) ? parsedItems : []);
      } catch {
        setItems([]);
      }
    } else {
      // Default checklist items
      setItems([
        { id: crypto.randomUUID(), label: "Verifica documenti identità", completed: false },
        { id: crypto.randomUUID(), label: "Consegna questionario anamnestico", completed: false },
        { id: crypto.randomUUID(), label: "Firma consenso informato", completed: false },
        { id: crypto.randomUUID(), label: "Preparazione sala visita", completed: false },
      ]);
    }
  }, [checklist]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allCompleted = items.every(item => item.completed);
      
      if (checklist) {
        const { error } = await supabase
          .from("visit_checklists")
          .update({
            checklist_items: items as any,
            completed: allCompleted,
            completed_at: allCompleted ? new Date().toISOString() : null,
          })
          .eq("id", checklist.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("visit_checklists")
          .insert({
            visit_id: visitId,
            company_id: companyId,
            employee_id: employeeId,
            checklist_items: items as any,
            completed: allCompleted,
            completed_at: allCompleted ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Checklist salvata");
      queryClient.invalidateQueries({ queryKey: ["visit-checklist"] });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleToggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return;
    
    setItems([...items, {
      id: crypto.randomUUID(),
      label: newItemLabel,
      completed: false,
    }]);
    setNewItemLabel("");
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const completionPercentage = items.length > 0 
    ? Math.round((items.filter(i => i.completed).length / items.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checklist Pre-Visita</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Completamento: {completionPercentage}%
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <Label className="flex-1 cursor-pointer">{item.label}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="Aggiungi nuovo elemento..."
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Button type="button" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Chiudi
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvataggio..." : "Salva Checklist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
