import { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Trash2, Plus, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EducationTabProps {
  form: UseFormReturn<any>;
  employeeId?: string;
  companyId: string;
}

interface EducationRecord {
  id?: string;
  name: string;
  type: string;
  grade: string;
  date: string;
  document_url?: string;
}

const EDUCATION_TYPES = [
  "Licenza Media",
  "Diploma",
  "Laurea Triennale",
  "Laurea Magistrale",
  "Master",
  "Dottorato",
  "Certificazione Professionale",
  "Corso di Formazione",
  "Altro",
];

export const EducationTab = ({ form, employeeId, companyId }: EducationTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const educationFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingEducationDoc, setIsUploadingEducationDoc] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationRecord | null>(null);
  const [educationForm, setEducationForm] = useState<EducationRecord>({
    name: "",
    type: "",
    grade: "",
    date: "",
    document_url: "",
  });

  // Query for education records
  const { data: educationRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["education-records", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from("education_records")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Mutation to add/update education record
  const educationMutation = useMutation({
    mutationFn: async (record: EducationRecord) => {
      if (!employeeId) throw new Error("Employee ID is required");

      if (record.id) {
        const { error } = await supabase
          .from("education_records")
          .update({
            name: record.name,
            type: record.type,
            grade: record.grade,
            date: record.date,
            document_url: record.document_url,
          })
          .eq("id", record.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("education_records")
          .insert({
            employee_id: employeeId,
            company_id: companyId,
            name: record.name,
            type: record.type,
            grade: record.grade,
            date: record.date,
            document_url: record.document_url,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education-records", employeeId] });
      toast({
        title: "Successo",
        description: "Titolo di studio salvato",
      });
      setShowEducationDialog(false);
      setEducationForm({ name: "", type: "", grade: "", date: "", document_url: "" });
      setEditingEducation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete education record
  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("education_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education-records", employeeId] });
      toast({
        title: "Successo",
        description: "Titolo di studio eliminato",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${companyId}/curriculum/${employeeId}-cv-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL or signed URL
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 31536000); // 1 year

      if (data?.signedUrl) {
        form.setValue("cv_url", data.signedUrl);
        
        // Also save to documents table
        await supabase.from("documents").insert({
          company_id: companyId,
          category: "curriculum",
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });

        toast({
          title: "Successo",
          description: "CV caricato con successo",
        });
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del CV",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadCV = async () => {
    const cvUrl = form.getValues("cv_url");
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    }
  };

  const handleAddEducation = () => {
    setEditingEducation(null);
    setEducationForm({ name: "", type: "", grade: "", date: "", document_url: "" });
    setShowEducationDialog(true);
  };

  const handleEditEducation = (record: any) => {
    setEditingEducation(record);
    setEducationForm({
      id: record.id,
      name: record.name,
      type: record.type,
      grade: record.grade || "",
      date: record.date || "",
      document_url: record.document_url || "",
    });
    setShowEducationDialog(true);
  };

  const handleEducationFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employeeId) return;

    setIsUploadingEducationDoc(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${companyId}/education/${employeeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 31536000); // 1 year

      if (data?.signedUrl) {
        setEducationForm({ ...educationForm, document_url: data.signedUrl });
        
        await supabase.from("documents").insert({
          company_id: companyId,
          category: "education",
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });

        toast({
          title: "Successo",
          description: "Documento caricato con successo",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del documento",
        variant: "destructive",
      });
    } finally {
      setIsUploadingEducationDoc(false);
      if (educationFileInputRef.current) {
        educationFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveEducation = () => {
    if (!educationForm.name || !educationForm.type) {
      toast({
        title: "Errore",
        description: "Nome e tipo sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    educationMutation.mutate(educationForm);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Curriculum Vitae</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="cv_url"
              render={({ field }) => {
                const fileName = field.value ? field.value.split('/').pop()?.split('-cv-')[0] + '.pdf' : null;
                return (
                  <FormItem>
                    <FormLabel>Carica CV</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value ? (
                          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-1 text-sm truncate">{fileName}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadCV}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Visualizza
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadCV}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nessun CV caricato</p>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading || !employeeId}
                          className="w-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Caricamento...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {field.value ? "Sostituisci CV" : "Carica CV"}
                            </>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            {!employeeId && (
              <p className="text-sm text-muted-foreground">
                Nota: Salva prima il dipendente per caricare il CV
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Titoli di Studio</CardTitle>
            <Button
              type="button"
              onClick={handleAddEducation}
              disabled={!employeeId}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!employeeId ? (
            <p className="text-sm text-muted-foreground">
              Salva prima il dipendente per gestire i titoli di studio
            </p>
          ) : isLoadingRecords ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : educationRecords && educationRecords.length > 0 ? (
            <div className="space-y-3">
              {educationRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">{record.name}</h4>
                      <p className="text-sm text-muted-foreground">{record.type}</p>
                      {record.grade && (
                        <p className="text-sm text-muted-foreground">
                          Voto: {record.grade}
                        </p>
                      )}
                      {record.date && (
                        <p className="text-sm text-muted-foreground">
                          Data: {new Date(record.date).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEducation(record)}
                    >
                      Modifica
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEducationMutation.mutate(record.id)}
                      disabled={deleteEducationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nessun titolo di studio registrato
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? "Modifica" : "Aggiungi"} Titolo di Studio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edu-name">Nome Titolo *</Label>
              <Input
                id="edu-name"
                value={educationForm.name}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, name: e.target.value })
                }
                placeholder="es. Diploma di Ragioneria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-type">Tipo *</Label>
              <Select
                value={educationForm.type}
                onValueChange={(value) =>
                  setEducationForm({ ...educationForm, type: value })
                }
              >
                <SelectTrigger id="edu-type">
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-grade">Votazione</Label>
              <Input
                id="edu-grade"
                value={educationForm.grade}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, grade: e.target.value })
                }
                placeholder="es. 110/110"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-date">Data Conseguimento</Label>
              <Input
                id="edu-date"
                type="date"
                value={educationForm.date}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-document">Documento</Label>
              {educationForm.document_url ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">Documento caricato</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(educationForm.document_url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nessun documento caricato</p>
              )}
              <input
                ref={educationFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleEducationFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => educationFileInputRef.current?.click()}
                disabled={isUploadingEducationDoc || !employeeId}
                className="w-full"
              >
                {isUploadingEducationDoc ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {educationForm.document_url ? "Sostituisci Documento" : "Carica Documento"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEducationDialog(false)}
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={handleSaveEducation}
              disabled={educationMutation.isPending}
            >
              {educationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
