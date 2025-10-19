import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Users } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";

const createCompanySchema = z.object({
  companyName: z.string().min(2, "Nome azienda richiesto"),
  companyEmail: z.string().email("Email non valida"),
  adminFullName: z.string().min(2, "Nome admin richiesto"),
  adminEmail: z.string().email("Email admin non valida"),
  adminPassword: z.string().min(6, "Password deve essere almeno 6 caratteri"),
});

const SuperAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
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
      </div>
    </div>
  );
};

export default SuperAdmin;
