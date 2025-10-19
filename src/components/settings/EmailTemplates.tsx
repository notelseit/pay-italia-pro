import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEmailTemplates, EmailTemplateType } from "@/hooks/useEmailTemplates";
import { Trash2, Edit, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EmailTemplatesProps {
  companyId: string;
}

const templateTypeLabels: Record<EmailTemplateType, string> = {
  reset_password: "Reset Password",
  payroll_delivery: "Invio Cedolini",
  general_communication: "Comunicazione Generale",
  welcome: "Benvenuto",
  notification: "Notifica"
};

export const EmailTemplates = ({ companyId }: EmailTemplatesProps) => {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates(companyId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    template_type: "" as EmailTemplateType,
    name: "",
    subject: "",
    html_body: "",
    text_body: "",
    sender_name: "PayHub",
    sender_email: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      template_type: "" as EmailTemplateType,
      name: "",
      subject: "",
      html_body: "",
      text_body: "",
      sender_name: "PayHub",
      sender_email: "",
      is_active: true,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (template: any) => {
    setFormData({
      template_type: template.template_type,
      name: template.name,
      subject: template.subject,
      html_body: template.html_body,
      text_body: template.text_body || "",
      sender_name: template.sender_name,
      sender_email: template.sender_email || "",
      is_active: template.is_active,
    });
    setEditingId(template.id);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateTemplate.mutateAsync({ id: editingId, ...formData });
    } else {
      await createTemplate.mutateAsync({ ...formData, company_id: companyId });
    }
    
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate.mutateAsync(id);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Email</h2>
          <p className="text-muted-foreground">Gestisci i template per le email automatiche</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingId !== null}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Template
        </Button>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Modifica Template" : "Nuovo Template"}</CardTitle>
            <CardDescription>
              {editingId ? "Modifica il template email" : "Crea un nuovo template email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template_type">Tipo Template</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value as EmailTemplateType })}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templateTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Oggetto Email</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Nome Mittente</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_email">Email Mittente (opzionale)</Label>
                  <Input
                    id="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="html_body">Corpo HTML</Label>
                <Textarea
                  id="html_body"
                  value={formData.html_body}
                  onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
                  rows={10}
                  required
                  placeholder="<html><body>Il tuo template HTML qui...</body></html>"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_body">Corpo Testo (opzionale)</Label>
                <Textarea
                  id="text_body"
                  value={formData.text_body}
                  onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
                  rows={5}
                  placeholder="Versione testuale dell'email..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Template Attivo</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Aggiorna" : "Crea"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    {templateTypeLabels[template.template_type]} • 
                    {template.is_active ? " Attivo" : " Inattivo"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler eliminare questo template? Questa azione non può essere annullata.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(template.id)}>
                          Elimina
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Oggetto:</strong> {template.subject}</p>
                <p><strong>Mittente:</strong> {template.sender_name} {template.sender_email && `<${template.sender_email}>`}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates?.length === 0 && !isCreating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nessun template email configurato</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crea il primo template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
