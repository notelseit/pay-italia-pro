import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail } from "lucide-react";

export const EmailSettingsManagement = () => {
  const { settings, isLoading, updateSettings } = useEmailSettings();
  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: 993,
    smtp_user: "",
    smtp_secure: true,
    use_custom_smtp: false,
    from_email: "",
    from_name: "PayHub",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_secure: settings.smtp_secure,
        use_custom_smtp: settings.use_custom_smtp,
        from_email: settings.from_email,
        from_name: settings.from_name,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync(formData);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Impostazioni Email Globali</h2>
          <p className="text-muted-foreground">Configurazione SMTP per tutte le aziende (Solo Superadmin)</p>
        </div>
      </div>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Queste impostazioni sono condivise tra tutte le aziende. Le credenziali SMTP sono memorizzate in modo sicuro
          e vengono utilizzate per l'invio di tutte le email del sistema.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione SMTP</CardTitle>
          <CardDescription>
            Configura il server SMTP per l'invio delle email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">Host SMTP</Label>
                <Input
                  id="smtp_host"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                  required
                  placeholder="mail.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">Porta SMTP</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                  required
                  placeholder="993"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_user">Utente SMTP</Label>
              <Input
                id="smtp_user"
                value={formData.smtp_user}
                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                required
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">Email Mittente</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  required
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_name">Nome Mittente</Label>
                <Input
                  id="from_name"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  required
                  placeholder="PayHub System"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp_secure"
                  checked={formData.smtp_secure}
                  onCheckedChange={(checked) => setFormData({ ...formData, smtp_secure: checked })}
                />
                <Label htmlFor="smtp_secure">Utilizza connessione sicura (SSL/TLS)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use_custom_smtp"
                  checked={formData.use_custom_smtp}
                  onCheckedChange={(checked) => setFormData({ ...formData, use_custom_smtp: checked })}
                />
                <Label htmlFor="use_custom_smtp">Utilizza SMTP personalizzato</Label>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Nota:</strong> La password SMTP è memorizzata in modo sicuro come secret di sistema
                e non viene visualizzata per motivi di sicurezza. Le credenziali attuali sono configurate per:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{formData.smtp_user}</code>
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
