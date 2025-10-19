import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_CATEGORIES = [
  { value: "curriculum", label: "Curriculum" },
  { value: "modelli", label: "Modelli" },
  { value: "uniemens", label: "UniEmens" },
  { value: "f24", label: "Modello F24" },
  { value: "770", label: "Modello 770" },
  { value: "cu", label: "Certificazione Unica (CU)" },
  { value: "altri", label: "Altri documenti" },
];

export default function Documents() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .single();

      if (!profile?.company_id) return null;

      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      return company;
    },
  });

  const { data: documents, isLoading: isLoadingDocuments, refetch } = useQuery({
    queryKey: ["documents", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory || !company?.id) {
      toast({
        title: "Errore",
        description: "Seleziona una categoria e un file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      // Upload to storage
      const filePath = `${company.id}/${selectedCategory}/${Date.now()}-${selectedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          company_id: company.id,
          category: selectedCategory,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Successo",
        description: "File caricato con successo",
      });

      setSelectedFile(null);
      setSelectedCategory("");
      refetch();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento del file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documenti</h1>
          <p className="text-muted-foreground">
            Carica e gestisci i documenti aziendali
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Carica Documento
              </CardTitle>
              <CardDescription>
                Seleziona la categoria e carica un documento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedCategory || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Carica File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Documenti Caricati
              </CardTitle>
              <CardDescription>
                Elenco dei documenti presenti sul server
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const { data } = await supabase.storage
                            .from("documents")
                            .createSignedUrl(doc.file_path, 60);
                          
                          if (data?.signedUrl) {
                            window.open(data.signedUrl, "_blank");
                          }
                        }}
                      >
                        Scarica
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nessun documento caricato
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categorie Documenti</CardTitle>
            <CardDescription>
              Struttura delle cartelle disponibili per l'organizzazione dei documenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {DOCUMENT_CATEGORIES.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
