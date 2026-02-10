import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

const Employees = () => {
  const { hasRole } = useAuth();
  const isMedicalOfficerOnly = hasRole('medical_officer') && !hasRole('admin') && !hasRole('superadmin') && !hasRole('admin_sub_azienda') && !hasRole('hr_manager');
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees(companyId);

  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        
        if (data?.company_id) {
          setCompanyId(data.company_id);
        }
      }
    };

    fetchCompanyId();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleSave = async (data: any) => {
    if (selectedEmployee) {
      updateEmployee.mutate({ id: selectedEmployee.id, updates: data });
    } else {
      // For new employees, create user first, then create employee
      if (!data.email || !data.password) {
        toast({
          title: "Errore",
          description: "Email e password sono obbligatori per creare un nuovo dipendente",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create user account via edge function
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
          body: {
            email: data.email,
            password: data.password,
            fullName: `${data.first_name} ${data.last_name}`,
            companyId: companyId,
            role: 'employee',
          },
        });

        if (userError) throw userError;

        // Remove password from employee data before creating employee record
        const { password, ...employeeData } = data;
        createEmployee.mutate(employeeData);
      } catch (error: any) {
        toast({
          title: "Errore",
          description: error.message || "Errore durante la creazione dell'utente",
          variant: "destructive",
        });
      }
    }
  };

  const contractTypeLabels: Record<string, string> = {
    indeterminato: "Tempo Indeterminato",
    determinato: "Tempo Determinato",
    part_time: "Part-time",
    consulente: "Consulente",
  };

  const filteredEmployees = employees?.filter((emp) =>
    emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.tax_code?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Gestione Dipendenti</h1>
          <p className="text-muted-foreground">Anagrafica e informazioni dei dipendenti</p>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o codice fiscale..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {!isMedicalOfficerOnly && (
                <Button variant="hero" onClick={handleAddEmployee}>
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Dipendente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totale Dipendenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoading ? "..." : employees?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Indeterminato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoading ? "..." : employees?.filter(e => e.contract_type === "indeterminato").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nuovi questo mese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {isLoading ? "..." : employees?.filter(e => {
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return new Date(e.hire_date) > oneMonthAgo;
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco Dipendenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Codice Fiscale</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Contratto</TableHead>
                  <TableHead>Retribuzione</TableHead>
                  <TableHead>Stato</TableHead>
                  {!isMedicalOfficerOnly && <TableHead className="text-right">Azioni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Caricamento...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nessun dipendente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell className="font-mono text-sm">{employee.tax_code}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {employee.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contractTypeLabels[employee.contract_type as keyof typeof contractTypeLabels] || employee.contract_type}
                      </TableCell>
                      <TableCell className="font-semibold">
                        €{employee.base_salary?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {employee.is_active ? "Attivo" : "Non attivo"}
                        </Badge>
                      </TableCell>
                      {!isMedicalOfficerOnly && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClick(employee.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
        companyId={companyId}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo dipendente? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
