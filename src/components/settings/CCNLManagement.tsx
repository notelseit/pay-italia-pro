import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CCNLManagement = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) return null;

      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      return data;
    },
  });

  const { contracts, createContract, updateContract, deleteContract } = useCCNLContracts(company?.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const contractData = {
      company_id: company!.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      base_salary: parseFloat(formData.get("base_salary") as string) || null,
      work_hours: parseFloat(formData.get("work_hours") as string) || 40,
      vacation_days: parseInt(formData.get("vacation_days") as string) || 26,
      sick_leave_days: parseInt(formData.get("sick_leave_days") as string) || 180,
      notice_period_days: parseInt(formData.get("notice_period_days") as string) || 15,
      trial_period_days: parseInt(formData.get("trial_period_days") as string) || 90,
      thirteenth_salary: formData.get("thirteenth_salary") === "on",
      fourteenth_salary: formData.get("fourteenth_salary") === "on",
      meal_vouchers: formData.get("meal_vouchers") === "on",
      meal_voucher_amount: parseFloat(formData.get("meal_voucher_amount") as string) || 0,
      inps_rate: parseFloat(formData.get("inps_rate") as string) || null,
      inail_rate: parseFloat(formData.get("inail_rate") as string) || null,
      notes: formData.get("notes") as string,
    };

    if (editingContract) {
      await updateContract.mutateAsync({ id: editingContract.id, updates: contractData });
    } else {
      await createContract.mutateAsync(contractData);
    }

    setDialogOpen(false);
    setEditingContract(null);
  };

  const handleEdit = (contract: any) => {
    setEditingContract(contract);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler disattivare questo contratto?")) {
      await deleteContract.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contratti CCNL</h3>
        <Button onClick={() => { setEditingContract(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Contratto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrizione</TableHead>
            <TableHead>RAL Base</TableHead>
            <TableHead>Ore/Sett</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts && contracts.length > 0 ? (
            contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.name}</TableCell>
                <TableCell>{contract.description}</TableCell>
                <TableCell>{contract.base_salary ? `€${contract.base_salary}` : "-"}</TableCell>
                <TableCell>{contract.work_hours || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nessun contratto CCNL configurato
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContract ? "Modifica Contratto CCNL" : "Nuovo Contratto CCNL"}</DialogTitle>
            <DialogDescription>
              Configura i dettagli del contratto collettivo nazionale
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Contratto *</Label>
                <Input id="name" name="name" required defaultValue={editingContract?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Input id="description" name="description" defaultValue={editingContract?.description} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_salary">RAL Base (€)</Label>
                <Input id="base_salary" name="base_salary" type="number" step="0.01" defaultValue={editingContract?.base_salary} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_hours">Ore Settimanali</Label>
                <Input id="work_hours" name="work_hours" type="number" step="0.5" defaultValue={editingContract?.work_hours || 40} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacation_days">Giorni Ferie</Label>
                <Input id="vacation_days" name="vacation_days" type="number" defaultValue={editingContract?.vacation_days || 26} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sick_leave_days">Giorni Malattia</Label>
                <Input id="sick_leave_days" name="sick_leave_days" type="number" defaultValue={editingContract?.sick_leave_days || 180} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notice_period_days">Giorni Preavviso</Label>
                <Input id="notice_period_days" name="notice_period_days" type="number" defaultValue={editingContract?.notice_period_days || 15} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial_period_days">Giorni Prova</Label>
                <Input id="trial_period_days" name="trial_period_days" type="number" defaultValue={editingContract?.trial_period_days || 90} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="thirteenth_salary" name="thirteenth_salary" defaultChecked={editingContract?.thirteenth_salary ?? true} />
                <Label htmlFor="thirteenth_salary">Tredicesima</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="fourteenth_salary" name="fourteenth_salary" defaultChecked={editingContract?.fourteenth_salary ?? false} />
                <Label htmlFor="fourteenth_salary">Quattordicesima</Label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="meal_vouchers" name="meal_vouchers" defaultChecked={editingContract?.meal_vouchers ?? false} />
                <Label htmlFor="meal_vouchers">Buoni Pasto</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal_voucher_amount">Importo Buoni (€)</Label>
                <Input id="meal_voucher_amount" name="meal_voucher_amount" type="number" step="0.01" defaultValue={editingContract?.meal_voucher_amount || 0} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inps_rate">Aliquota INPS (%)</Label>
                <Input id="inps_rate" name="inps_rate" type="number" step="0.01" defaultValue={editingContract?.inps_rate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inail_rate">Aliquota INAIL (%)</Label>
                <Input id="inail_rate" name="inail_rate" type="number" step="0.01" defaultValue={editingContract?.inail_rate} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={editingContract?.notes} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">
                {editingContract ? "Aggiorna" : "Salva"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
