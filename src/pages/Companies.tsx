import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, UserPlus, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { z } from "zod";

const createCompanySchema = z.object({
  adminEmail: z.string().email("Email non valida"),
  adminPassword: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  adminFullName: z.string().min(1, "Il nome è obbligatorio"),
  companyName: z.string().min(1, "Il nome azienda è obbligatorio"),
  companyEmail: z.string().email("Email non valida"),
});

const editCompanySchema = z.object({
  companyName: z.string().min(1, "Il nome azienda è obbligatorio"),
  companyEmail: z.string().email("Email non valida"),
});

const Companies = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["allCompanies"],
    queryFn: async () => {
      // The RLS policies will automatically filter companies based on user role
      // Superadmins see all, admins see only their created companies
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof createCompanySchema>) => {
      const { data, error } = await supabase.functions.invoke("create-company", {
        body: formData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Successo",
        description: "Azienda creata con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare l'azienda",
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof editCompanySchema> }) => {
      const { error } = await supabase
        .from("companies")
        .update({
          name: data.companyName,
          email: data.companyEmail,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Successo",
        description: "Azienda aggiornata con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare l'azienda",
        variant: "destructive",
      });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase.functions.invoke("delete-company", {
        body: { companyId },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCompanies"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Successo",
        description: "Azienda eliminata con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare l'azienda",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      adminEmail: formData.get("adminEmail") as string,
      adminPassword: formData.get("adminPassword") as string,
      adminFullName: formData.get("adminFullName") as string,
      companyName: formData.get("companyName") as string,
      companyEmail: formData.get("companyEmail") as string,
    };

    const validation = createCompanySchema.safeParse(data);
    if (!validation.success) {
      toast({
        title: "Errore di validazione",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    createCompanyMutation.mutate(validation.data);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get("companyName") as string,
      companyEmail: formData.get("companyEmail") as string,
    };

    const validation = editCompanySchema.safeParse(data);
    if (!validation.success) {
      toast({
        title: "Errore di validazione",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    updateCompanyMutation.mutate({ id: selectedCompany.id, data: validation.data });
  };

  const handleEditClick = (company: any) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (company: any) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCompany) {
      deleteCompanyMutation.mutate(selectedCompany.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Gestione Aziende</h1>
            <p className="text-muted-foreground">Crea e gestisci le aziende del sistema</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Building2 className="h-4 w-4" />
                Crea Nuova Azienda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Crea Nuova Azienda</DialogTitle>
                  <DialogDescription>
                    Inserisci i dati dell'azienda e dell'amministratore
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome Azienda</Label>
                    <Input id="companyName" name="companyName" placeholder="Acme S.r.l." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email Azienda</Label>
                    <Input id="companyEmail" name="companyEmail" type="email" placeholder="info@azienda.it" required />
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Dati Amministratore
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="adminFullName">Nome Completo</Label>
                        <Input id="adminFullName" name="adminFullName" placeholder="Mario Rossi" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email</Label>
                        <Input id="adminEmail" name="adminEmail" type="email" placeholder="admin@azienda.it" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input id="adminPassword" name="adminPassword" type="password" minLength={8} required />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={createCompanyMutation.isPending}>
                    {createCompanyMutation.isPending ? "Creazione..." : "Crea Azienda"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aziende Registrate</CardTitle>
            <CardDescription>Elenco di tutte le aziende nel sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : companies && companies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Azienda</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>P.IVA</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.email || "-"}</TableCell>
                      <TableCell>{company.vat_number || "-"}</TableCell>
                      <TableCell>{company.city || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(company)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nessuna azienda registrata
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Modifica Azienda</DialogTitle>
              <DialogDescription>Aggiorna i dati dell'azienda</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-companyName">Nome Azienda</Label>
                <Input
                  id="edit-companyName"
                  name="companyName"
                  defaultValue={selectedCompany?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-companyEmail">Email Azienda</Label>
                <Input
                  id="edit-companyEmail"
                  name="companyEmail"
                  type="email"
                  defaultValue={selectedCompany?.email}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={updateCompanyMutation.isPending}>
                {updateCompanyMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà permanentemente l'azienda "{selectedCompany?.name}" e tutti i
              dati associati (dipendenti, cedolini, presenze). Questa operazione non può essere
              annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCompanyMutation.isPending ? "Eliminazione..." : "Elimina Azienda"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Companies;
