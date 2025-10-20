import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Users, Edit, LogIn, Trash2, FileText } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { LogsTab } from "@/components/superadmin/LogsTab";

const createCompanySchema = z.object({
  companyName: z.string().min(2, "Nome azienda richiesto"),
  companyEmail: z.string().email("Email non valida"),
  adminFullName: z.string().min(2, "Nome admin richiesto"),
  adminEmail: z.string().email("Email admin non valida"),
  adminPassword: z.string().min(6, "Password deve essere almeno 6 caratteri"),
});

const editCompanySchema = z.object({
  name: z.string().min(2, "Nome azienda richiesto"),
  email: z.string().email("Email non valida"),
  vat_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
});

const SuperAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    vat_number: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
  });

  // Fetch all companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ['superadmin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          profiles:profiles(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createCompanySchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non autenticato');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella creazione dell\'azienda');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Azienda creata",
        description: "L'azienda e l'utente amministratore sono stati creati con successo",
      });
      setIsDialogOpen(false);
      setFormData({
        companyName: "",
        companyEmail: "",
        adminFullName: "",
        adminEmail: "",
        adminPassword: "",
      });
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof editCompanySchema> }) => {
      const { error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Azienda aggiornata",
        description: "I dati dell'azienda sono stati aggiornati con successo",
      });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Impersonate admin mutation
  const impersonateMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non autenticato');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/impersonate-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nell\'accesso come admin');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Accesso in corso",
        description: `Accesso come admin ${data.adminEmail}`,
      });
      // Redirect to the magic link URL
      window.location.href = data.redirectUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non autenticato');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella cancellazione dell\'azienda');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Azienda eliminata",
        description: "L'azienda e tutti i dati associati sono stati eliminati con successo",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createCompanySchema.parse(formData);
      createCompanyMutation.mutate(formData);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.errors?.[0]?.message || "Dati non validi",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany) return;
    
    try {
      editCompanySchema.parse(editFormData);
      updateCompanyMutation.mutate({ id: selectedCompany.id, data: editFormData });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.errors?.[0]?.message || "Dati non validi",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (company: any) => {
    setSelectedCompany(company);
    setEditFormData({
      name: company.name || "",
      email: company.email || "",
      vat_number: company.vat_number || "",
      address: company.address || "",
      city: company.city || "",
      province: company.province || "",
      postal_code: company.postal_code || "",
      phone: company.phone || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleImpersonate = (companyId: string) => {
    if (confirm('Vuoi accedere come amministratore di questa azienda?')) {
      impersonateMutation.mutate(companyId);
    }
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
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <Building2 className="h-8 w-8 text-primary" />
              Gestione Aziende
            </h1>
            <p className="text-muted-foreground mt-2">Pannello di controllo SuperAdmin</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crea Nuova Azienda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crea Nuova Azienda</DialogTitle>
                <DialogDescription>
                  Crea una nuova azienda con un utente amministratore
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome Azienda</Label>
                  <Input
                    id="companyName"
                    placeholder="Azienda S.r.l."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email Azienda</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="info@azienda.it"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    required
                  />
                </div>
                <hr className="my-4" />
                <div className="space-y-2">
                  <Label htmlFor="adminFullName">Nome Completo Admin</Label>
                  <Input
                    id="adminFullName"
                    placeholder="Mario Rossi"
                    value={formData.adminFullName}
                    onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email Admin</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@azienda.it"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password Admin</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Minimo 6 caratteri"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending ? "Creazione in corso..." : "Crea Azienda"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Aziende
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="h-4 w-4" />
              Log di Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Aziende Registrate</CardTitle>
                <CardDescription>
                  Lista di tutte le aziende nel sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
                ) : companies && companies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>P.IVA</TableHead>
                        <TableHead>Città</TableHead>
                        <TableHead className="text-center">Utenti</TableHead>
                        <TableHead>Data Creazione</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company: any) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.email}</TableCell>
                          <TableCell>{company.vat_number || '-'}</TableCell>
                          <TableCell>{company.city || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {company.profiles?.[0]?.count || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(company.created_at).toLocaleDateString('it-IT')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(company)}
                                title="Modifica azienda"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleImpersonate(company.id)}
                                disabled={impersonateMutation.isPending}
                                title="Accedi come admin"
                              >
                                <LogIn className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(company)}
                                disabled={deleteCompanyMutation.isPending}
                                title="Elimina azienda"
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
          </TabsContent>

          <TabsContent value="logs">
            <LogsTab />
          </TabsContent>
        </Tabs>

        {/* Edit Company Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifica Azienda</DialogTitle>
              <DialogDescription>
                Modifica i dati dell'azienda selezionata
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Azienda</Label>
                <Input
                  id="edit-name"
                  placeholder="Azienda S.r.l."
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="info@azienda.it"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vat">Partita IVA</Label>
                <Input
                  id="edit-vat"
                  placeholder="12345678901"
                  value={editFormData.vat_number}
                  onChange={(e) => setEditFormData({ ...editFormData, vat_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefono</Label>
                <Input
                  id="edit-phone"
                  placeholder="+39 123 456 7890"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Indirizzo</Label>
                <Input
                  id="edit-address"
                  placeholder="Via Roma 1"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Città</Label>
                  <Input
                    id="edit-city"
                    placeholder="Milano"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-province">Provincia</Label>
                  <Input
                    id="edit-province"
                    placeholder="MI"
                    value={editFormData.province}
                    onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postal">CAP</Label>
                <Input
                  id="edit-postal"
                  placeholder="20100"
                  value={editFormData.postal_code}
                  onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateCompanyMutation.isPending}
              >
                {updateCompanyMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Company Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione eliminerà permanentemente l'azienda "{selectedCompany?.name}" e tutti i dati associati:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tutti gli utenti dell'azienda</li>
                  <li>Tutti i dipendenti e i loro dati</li>
                  <li>Tutte le presenze e buste paga</li>
                  <li>Tutti i documenti caricati</li>
                </ul>
                <p className="mt-2 font-semibold text-destructive">
                  Questa operazione non può essere annullata.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCompanyMutation.isPending}
              >
                {deleteCompanyMutation.isPending ? "Eliminazione..." : "Elimina"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SuperAdmin;
