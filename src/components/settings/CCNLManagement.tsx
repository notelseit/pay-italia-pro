import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { Plus, Pencil, Trash2, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CCNLFormDialog } from "./ccnl/CCNLFormDialog";

export const CCNLManagement = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (contractData: any) => {
    const fullContractData = {
      ...contractData,
      company_id: company!.id,
    };

    if (editingContract) {
      await updateContract.mutateAsync({ id: editingContract.id, updates: fullContractData });
    } else {
      await createContract.mutateAsync(fullContractData);
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

  const handleExport = () => {
    if (!contracts || contracts.length === 0) {
      toast({
        title: "Nessun contratto",
        description: "Non ci sono contratti da esportare",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = [
      "Nome",
      "Descrizione",
      "RAL Base",
      "Ore Settimanali",
      "Giorni Ferie",
      "Giorni Malattia",
      "Giorni Preavviso",
      "Giorni Prova",
      "Tredicesima",
      "Quattordicesima",
      "Buoni Pasto",
      "Importo Buoni",
      "Aliquota INPS",
      "Aliquota INAIL",
      "Note"
    ];

    const csvContent = [
      headers.join(","),
      ...contracts.map(contract => [
        `"${contract.name || ""}"`,
        `"${contract.description || ""}"`,
        contract.base_salary || "",
        contract.work_hours || "",
        contract.vacation_days || "",
        contract.sick_leave_days || "",
        contract.notice_period_days || "",
        contract.trial_period_days || "",
        contract.thirteenth_salary ? "Sì" : "No",
        contract.fourteenth_salary ? "Sì" : "No",
        contract.meal_vouchers ? "Sì" : "No",
        contract.meal_voucher_amount || "",
        contract.inps_rate || "",
        contract.inail_rate || "",
        `"${contract.notes || ""}"`
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contratti_ccnl_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export completato",
      description: "I contratti sono stati esportati con successo",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Formato non valido",
        description: "Seleziona un file CSV",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        // Skip header
        const dataLines = lines.slice(1);
        
        let imported = 0;
        let errors = 0;

        for (const line of dataLines) {
          try {
            // Parse CSV line (handle quoted values)
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, "")) || [];
            
            if (values.length < 15) continue;

            const contractData = {
              company_id: company!.id,
              name: values[0],
              description: values[1],
              base_salary: values[2] ? parseFloat(values[2]) : null,
              work_hours: values[3] ? parseFloat(values[3]) : 40,
              vacation_days: values[4] ? parseInt(values[4]) : 26,
              sick_leave_days: values[5] ? parseInt(values[5]) : 180,
              notice_period_days: values[6] ? parseInt(values[6]) : 15,
              trial_period_days: values[7] ? parseInt(values[7]) : 90,
              thirteenth_salary: values[8] === "Sì",
              fourteenth_salary: values[9] === "Sì",
              meal_vouchers: values[10] === "Sì",
              meal_voucher_amount: values[11] ? parseFloat(values[11]) : 0,
              inps_rate: values[12] ? parseFloat(values[12]) : null,
              inail_rate: values[13] ? parseFloat(values[13]) : null,
              notes: values[14] || "",
            };

            await createContract.mutateAsync(contractData);
            imported++;
          } catch (error) {
            console.error("Error importing contract:", error);
            errors++;
          }
        }

        toast({
          title: "Import completato",
          description: `${imported} contratti importati${errors > 0 ? `, ${errors} errori` : ""}`,
        });

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        toast({
          title: "Errore import",
          description: "Errore durante l'importazione del file",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contratti CCNL</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!contracts || contracts.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Importa
          </Button>
          <Button onClick={() => { setEditingContract(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Contratto
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        style={{ display: "none" }}
      />

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

      <CCNLFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingContract={editingContract}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
