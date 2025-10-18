import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { Building2, Users, Bell, Shield, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("company");
  const { toast } = useToast();

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

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSaveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updates = {
      name: formData.get("company-name") as string,
      vat_number: formData.get("vat") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      matricola_inps: formData.get("matricola-inps") as string,
      posizione_inail: formData.get("posizione-inail") as string,
      voce_inail: formData.get("voce-inail") as string,
    };

    const { error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", company?.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } else {
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
                  <CardDescription>
                    Dati anagrafici e informazioni fiscali
                  </CardDescription>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Indirizzo Sede Legale</Label>
                      <Input id="address" name="address" defaultValue={company?.address || ""} />
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
                        <Input id="posizione-inail" name="posizione-inail" defaultValue={company?.posizione_inail || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="voce-inail">Voce INAIL</Label>
                        <Input id="voce-inail" name="voce-inail" defaultValue={company?.voce_inail || ""} />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <Button type="submit" variant="hero">Salva Modifiche</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Users and Roles */}
            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>Utenti e Ruoli</CardTitle>
                  <CardDescription>
                    Gestisci gli utenti e i loro permessi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funzionalità in sviluppo</p>
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferenze Notifiche</CardTitle>
                  <CardDescription>
                    Gestisci le notifiche email e in-app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-payroll">Cedolini Generati</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifica quando i cedolini sono pronti
                      </p>
                    </div>
                    <Switch id="notif-payroll" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-deadlines">Scadenze Fiscali</Label>
                      <p className="text-sm text-muted-foreground">
                        Promemoria per pagamenti INPS e IRPEF
                      </p>
                    </div>
                    <Switch id="notif-deadlines" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-compliance">Alert Compliance</Label>
                      <p className="text-sm text-muted-foreground">
                        Avvisi per documenti in scadenza
                      </p>
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
                  <CardDescription>
                    Gestisci password e impostazioni di sicurezza
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funzionalità in sviluppo</p>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {activeSection === "documents" && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
