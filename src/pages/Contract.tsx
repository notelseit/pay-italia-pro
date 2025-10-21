import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { ContractDialog } from "@/components/contracts/ContractDialog";

const Contract = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { companyId } = useAuth();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", companyId)
        .order("hire_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

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
      contract.full_name?.toLowerCase().includes(searchLower) ||
      contract.tax_code?.toLowerCase().includes(searchLower) ||
      contractTypeLabels[contract.contract_type]?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: contracts?.length || 0,
    active: contracts?.filter((c) => c.is_active)?.length || 0,
    indeterminato: contracts?.filter((c) => c.contract_type === "indeterminato")?.length || 0,
  };

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setIsDialogOpen(true);
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
              placeholder="Cerca per nome, codice fiscale o tipo contratto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
              <CardTitle className="text-sm font-medium">Tempo Indeterminato</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indeterminato}</div>
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
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Codice Fiscale</TableHead>
                    <TableHead>Tipo Contratto</TableHead>
                    <TableHead>Data Assunzione</TableHead>
                    <TableHead>Retribuzione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.full_name}</TableCell>
                      <TableCell>{contract.tax_code}</TableCell>
                      <TableCell>{contractTypeLabels[contract.contract_type]}</TableCell>
                      <TableCell>
                        {contract.hire_date
                          ? format(new Date(contract.hire_date), "dd MMM yyyy", { locale: it })
                          : "-"}
                      </TableCell>
                      <TableCell>€ {contract.base_salary?.toLocaleString("it-IT")}</TableCell>
                      <TableCell>
                        <Badge variant={contract.is_active ? "default" : "secondary"}>
                          {contract.is_active ? "Attivo" : "Cessato"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContract(contract)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Dettagli
                        </Button>
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
    </div>
  );
};

export default Contract;
