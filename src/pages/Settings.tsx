import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Building2, Users, Bell, Shield, FileText, Briefcase, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRolesManagement } from "@/components/settings/UserRolesManagement";
import { CCNLManagement } from "@/components/settings/CCNLManagement";
import { EmailTemplates } from "@/components/settings/EmailTemplates";
import { EmailSettingsManagement } from "@/components/settings/EmailSettingsManagement";
import { useCCNLContracts } from "@/hooks/useCCNLContracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("company");
  const [defaultCCNL, setDefaultCCNL] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();

      if (!profile?.company_id) return null;

      const { data, error } = await supabase.from("companies").select("*").eq("id", profile.company_id).single();

      if (error) throw error;
      return data;
    },
  });

  const { contracts } = useCCNLContracts(company?.id);

  useEffect(() => {
    if (company?.default_ccnl_contract_id) {
      setDefaultCCNL(company.default_ccnl_contract_id);
    }
  }, [company]);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "superadmin")
        .is("company_id", null);

      setIsSuperAdmin(roles && roles.length > 0);
    };

    checkSuperAdmin();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!company?.id) {
      toast({
        title: "Errore",
        description: "Dati azienda non disponibili",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);

    const updates = {
      name: formData.get("company-name") as string,
      vat_number: formData.get("vat") as string,
      address: formData.get("address") as string,
      street_number: formData.get("street-number") as string,
      postal_code: formData.get("postal-code") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      country: formData.get("country") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      matricola_inps: formData.get("matricola-inps") as string,
      posizione_inail: formData.get("posizione-inail") as string,
      voce_inail: formData.get("voce-inail") as string,
      default_ccnl_contract_id: defaultCCNL && defaultCCNL !== "none" ? defaultCCNL : null,
    };

    const { error } = await supabase.from("companies").update(updates).eq("id", company.id);

    if (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } else {
      // Invalida la query per ricaricare i dati aggiornati
      await queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({
        title: "Successo",
        description: "Modifiche salvate correttamente",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Impostazioni</h1>
          <p className="text-muted-foreground">Configura il tuo account e le preferenze aziendali</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  <Button
                    variant={activeSection === "company" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("company")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Dati Azienda
                  </Button>
                  <Button
                    variant={activeSection === "users" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Utenti e Ruoli
                  </Button>
                  <Button
                    variant={activeSection === "ccnl" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("ccnl")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Contratti CCNL
                  </Button>
                  <Button
                    variant={activeSection === "notifications" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifiche
                  </Button>
                  <Button
                    variant={activeSection === "security" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("security")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Sicurezza
                  </Button>
                  <Button
                    variant={activeSection === "email" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("email")}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Template Email
                  </Button>
                  <Button
                    variant={activeSection === "documents" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("documents")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Documenti
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            {activeSection === "company" && (
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Azienda</CardTitle>
                  <CardDescription>Dati anagrafici e informazioni fiscali</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Ragione Sociale</Label>
                        <Input id="company-name" name="company-name" defaultValue={company?.name || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vat">Partita IVA</Label>
                        <Input id="vat" name="vat" defaultValue={company?.vat_number || ""} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="address">Indirizzo Sede Legale</Label>
                        <Input id="address" name="address" defaultValue={company?.address || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street-number">Numero Civico</Label>
                        <Input id="street-number" name="street-number" defaultValue={company?.street_number || ""} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postal-code">CAP</Label>
                        <Input id="postal-code" name="postal-code" defaultValue={company?.postal_code || ""} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="city">Città</Label>
                        <Input id="city" name="city" defaultValue={company?.city || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Provincia</Label>
                        <Input id="province" name="province" defaultValue={company?.province || ""} maxLength={2} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Nazione</Label>
                        <Input id="country" name="country" defaultValue={company?.country || "Italia"} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefono</Label>
                        <Input id="phone" name="phone" defaultValue={company?.phone || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Aziendale</Label>
                        <Input id="email" name="email" type="email" defaultValue={company?.email || ""} />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="matricola-inps">Matricola INPS</Label>
                        <Input id="matricola-inps" name="matricola-inps" defaultValue={company?.matricola_inps || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="posizione-inail">Posizione INAIL</Label>
                        <Input
                          id="posizione-inail"
                          name="posizione-inail"
                          defaultValue={company?.posizione_inail || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voce-inail">Voce INAIL</Label>
                        <Input id="voce-inail" name="voce-inail" defaultValue={company?.voce_inail || ""} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-ccnl">Contratto CCNL di Default</Label>
                      <Select value={defaultCCNL || "none"} onValueChange={setDefaultCCNL}>
                        <SelectTrigger id="default-ccnl">
                          <SelectValue placeholder="Seleziona contratto di default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nessun contratto di default</SelectItem>
                          {contracts &&
                            contracts.map((contract) => (
                              <SelectItem key={contract.id} value={contract.id}>
                                {contract.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Verrà assegnato automaticamente ai nuovi dipendenti
                      </p>
                    </div>

                    <Separator className="my-4" />

                    <Button type="submit" variant="hero">
                      Salva Modifiche
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Users and Roles */}
            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>Utenti e Ruoli</CardTitle>
                  <CardDescription>Gestisci gli utenti della tua azienda e i loro permessi di accesso</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserRolesManagement />
                </CardContent>
              </Card>
            )}

            {/* CCNL Contracts */}
            {activeSection === "ccnl" && (
              <Card>
                <CardHeader>
                  <CardTitle>Contratti CCNL</CardTitle>
                  <CardDescription>Gestisci i contratti collettivi nazionali di lavoro disponibili</CardDescription>
                </CardHeader>
                <CardContent>
                  <CCNLManagement />
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferenze Notifiche</CardTitle>
                  <CardDescription>Gestisci le notifiche email e in-app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-payroll">Cedolini Generati</Label>
                      <p className="text-sm text-muted-foreground">Notifica quando i cedolini sono pronti</p>
                    </div>
                    <Switch id="notif-payroll" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-deadlines">Scadenze Fiscali</Label>
                      <p className="text-sm text-muted-foreground">Promemoria per pagamenti INPS e IRPEF</p>
                    </div>
                    <Switch id="notif-deadlines" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-compliance">Alert Compliance</Label>
                      <p className="text-sm text-muted-foreground">Avvisi per documenti in scadenza</p>
                    </div>
                    <Switch id="notif-compliance" defaultChecked />
                  </div>

                  <Separator className="my-4" />

                  <Button variant="hero">Salva Preferenze</Button>
                </CardContent>
              </Card>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Sicurezza</CardTitle>
                  <CardDescription>Gestisci password e impostazioni di sicurezza</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cambio Password</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const currentPassword = formData.get("current-password") as string;
                        const newPassword = formData.get("new-password") as string;
                        const confirmPassword = formData.get("confirm-password") as string;

                        if (newPassword !== confirmPassword) {
                          toast({
                            title: "Errore",
                            description: "Le nuove password non corrispondono",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (newPassword.length < 8) {
                          toast({
                            title: "Errore",
                            description: "La password deve essere di almeno 8 caratteri",
                            variant: "destructive",
                          });
                          return;
                        }

                        const { error } = await supabase.auth.updateUser({
                          password: newPassword,
                        });

                        if (error) {
                          toast({
                            title: "Errore",
                            description: "Impossibile cambiare la password. Verifica la password corrente.",
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: "Successo",
                            description: "Password cambiata correttamente",
                          });
                          (e.target as HTMLFormElement).reset();
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Password Corrente</Label>
                        <Input
                          id="current-password"
                          name="current-password"
                          type="password"
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nuova Password</Label>
                        <Input
                          id="new-password"
                          name="new-password"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <p className="text-xs text-muted-foreground">Minimo 8 caratteri</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Conferma Nuova Password</Label>
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </div>
                      <Button type="submit" variant="hero">
                        Cambia Password
                      </Button>
                    </form>
                  </div>

                  <Separator />

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Impostazioni di Sicurezza</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Termina Tutte le Sessioni</Label>
                          <p className="text-sm text-muted-foreground">Disconnetti tutti i dispositivi tranne questo</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const { error } = await supabase.auth.signOut({ scope: "others" });
                            if (error) {
                              toast({
                                title: "Errore",
                                description: "Impossibile terminare le sessioni",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Successo",
                                description: "Tutte le altre sessioni sono state terminate",
                              });
                            }
                          }}
                        >
                          Termina Sessioni
                        </Button>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Informazioni Account</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Il tuo account è protetto con autenticazione sicura.</p>
                          <p>Cambia regolarmente la tua password per mantenere il massimo livello di sicurezza.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Templates */}
            {activeSection === "email" && (
              <>
                {company?.id && <EmailTemplates companyId={company.id} />}

                {isSuperAdmin && (
                  <div className="mt-8">
                    <EmailSettingsManagement />
                  </div>
                )}
              </>
            )}

            {/* Documents */}
            {/*    {activeSection === "documents" && (
              <Card>
                <CardHeader>
                  <CardTitle>Documenti</CardTitle>
                  <CardDescription>
                    Gestisci i documenti aziendali
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funzionalità in sviluppo</p>
                </CardContent>
              </Card>
            )}   */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
