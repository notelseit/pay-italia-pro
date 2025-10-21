import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { ContractDialog } from "@/components/contracts/ContractDialog";
import { ContractFormDialog } from "@/components/contracts/ContractFormDialog";
import { useContracts } from "@/hooks/useContracts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Contract = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const { companyId, hasRole } = useAuth();

  const { contracts, isLoading, createContract, updateContract, deleteContract } = useContracts(companyId);

  const canEdit = hasRole("superadmin") || hasRole("admin") || hasRole("hr_manager") || hasRole("admin_sub_azienda");

  const contractTypeLabels: Record<string, string> = {
    indeterminato: "Tempo Indeterminato",
    determinato: "Tempo Determinato",
    apprendistato: "Apprendistato",
    stage: "Stage",
    collaborazione: "Collaborazione",
  };

  const filteredContracts = contracts?.filter((contract) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.contract_name?.toLowerCase().includes(searchLower) ||
      contract.job_title?.toLowerCase().includes(searchLower) ||
      contract.employees?.full_name?.toLowerCase().includes(searchLower) ||
      contractTypeLabels[contract.contract_type]?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: contracts?.length || 0,
    active: contracts?.filter((c) => c.is_active)?.length || 0,
    templates: contracts?.filter((c) => c.is_template)?.length || 0,
  };

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setIsDialogOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setIsFormDialogOpen(true);
  };

  const handleNewContract = () => {
    setSelectedContract(null);
    setIsFormDialogOpen(true);
  };

  const handleSaveContract = (data: any) => {
    if (data.id) {
      updateContract.mutate(data);
    } else {
      createContract.mutate(data);
    }
  };

  const handleDeleteContract = (id: string) => {
    setContractToDelete(id);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract.mutate(contractToDelete);
      setContractToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestione Contratti</h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci i contratti dei dipendenti
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca per nome contratto, qualifica o dipendente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {canEdit && (
            <Button onClick={handleNewContract}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Contratto
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratti Totali</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratti Attivi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelli</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templates}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco Contratti</CardTitle>
            <CardDescription>
              Lista completa dei contratti attivi e scaduti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : filteredContracts && filteredContracts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Contratto</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qualifica</TableHead>
                    <TableHead>Data Inizio</TableHead>
                    <TableHead>Retribuzione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.contract_name}
                        {contract.is_template && (
                          <Badge variant="outline" className="ml-2">
                            Modello
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {contract.employees?.full_name || "-"}
                      </TableCell>
                      <TableCell>{contractTypeLabels[contract.contract_type]}</TableCell>
                      <TableCell>{contract.job_title || "-"}</TableCell>
                      <TableCell>
                        {contract.start_date
                          ? format(new Date(contract.start_date), "dd MMM yyyy", { locale: it })
                          : "-"}
                      </TableCell>
                      <TableCell>€ {contract.base_salary?.toLocaleString("it-IT")}</TableCell>
                      <TableCell>
                        <Badge variant={contract.is_active ? "default" : "secondary"}>
                          {contract.is_active ? "Attivo" : "Cessato"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditContract(contract)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContract(contract.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nessun contratto trovato
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ContractDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contract={selectedContract}
      />

      {canEdit && (
        <>
          <ContractFormDialog
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            contract={selectedContract}
            companyId={companyId || ""}
            onSave={handleSaveContract}
          />

          <AlertDialog open={!!contractToDelete} onOpenChange={() => setContractToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare questo contratto? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Elimina</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default Contract;
