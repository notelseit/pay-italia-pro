import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Source {
  id: string;
  name: string;
  url: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const HRSourcesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    is_active: true,
  });

  // Fetch all sources
  const { data: sources, isLoading } = useQuery({
    queryKey: ['hr-news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_news_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Source[];
    },
  });

  // Create/Update source mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditMode && selectedSource) {
        const { error } = await supabase
          .from('hr_news_sources')
          .update(data)
          .eq('id', selectedSource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hr_news_sources')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Fonte aggiornata" : "Fonte aggiunta",
        description: isEditMode ? "La fonte è stata aggiornata con successo" : "La nuova fonte è stata aggiunta con successo",
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['hr-news-sources'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete source mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hr_news_sources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Fonte eliminata",
        description: "La fonte è stata eliminata con successo",
      });
      setIsDeleteDialogOpen(false);
      setSelectedSource(null);
      queryClient.invalidateQueries({ queryKey: ['hr-news-sources'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('hr_news_sources')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-news-sources'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      description: "",
      is_active: true,
    });
    setIsEditMode(false);
    setSelectedSource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEditClick = (source: Source) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      url: source.url,
      description: source.description || "",
      is_active: source.is_active,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (source: Source) => {
    setSelectedSource(source);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = (source: Source) => {
    toggleActiveMutation.mutate({ id: source.id, is_active: !source.is_active });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Fonti Informazioni HR
              </CardTitle>
              <CardDescription>
                Gestisci le fonti da cui il chatbot AI può ottenere informazioni aggiornate su HR e paghe
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={handleAddClick}>
                  <Plus className="h-4 w-4" />
                  Aggiungi Fonte
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Modifica Fonte" : "Aggiungi Nuova Fonte"}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Modifica i dettagli della fonte di informazioni" : "Aggiungi una nuova fonte di informazioni per il chatbot"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Fonte</Label>
                    <Input
                      id="name"
                      placeholder="es. Ministero del Lavoro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://www.lavoro.gov.it"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione (opzionale)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrivi brevemente il tipo di informazioni disponibili in questa fonte"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Fonte attiva</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? "Salvataggio..." : isEditMode ? "Aggiorna Fonte" : "Aggiungi Fonte"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : sources && sources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="text-center">Stato</TableHead>
                  <TableHead>Data Aggiunta</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.url.length > 40 ? source.url.substring(0, 40) + '...' : source.url}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {source.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={source.is_active}
                        onCheckedChange={() => handleToggleActive(source)}
                        disabled={toggleActiveMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(source.created_at).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(source)}
                          title="Modifica fonte"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(source)}
                          disabled={deleteMutation.isPending}
                          title="Elimina fonte"
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
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna fonte configurata</p>
              <p className="text-sm mt-2">Aggiungi la prima fonte per consentire al chatbot di accedere a informazioni esterne</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la fonte "{selectedSource?.name}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSource && deleteMutation.mutate(selectedSource.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
