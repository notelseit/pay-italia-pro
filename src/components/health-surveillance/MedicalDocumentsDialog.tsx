import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

interface MedicalDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  companyId: string;
  medicalRecordId?: string;
  visitId?: string;
}

const documentTypes = [
  { value: "referto", label: "Referto Medico" },
  { value: "certificato", label: "Certificato" },
  { value: "esame_laboratorio", label: "Esame di Laboratorio" },
  { value: "esame_strumentale", label: "Esame Strumentale" },
  { value: "idoneita", label: "Giudizio Idoneità" },
  { value: "vaccinazione", label: "Certificato Vaccinazione" },
  { value: "altro", label: "Altro" },
];

export const MedicalDocumentsDialog = ({ 
  open, 
  onOpenChange, 
  employeeId, 
  companyId,
  medicalRecordId,
  visitId,
}: MedicalDocumentsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ["medical-documents", employeeId, medicalRecordId, visitId],
    queryFn: async () => {
      let query = supabase
        .from("medical_documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (medicalRecordId) {
        query = query.eq("medical_record_id", medicalRecordId);
      }
      if (visitId) {
        query = query.eq("visit_id", visitId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !documentType) {
        throw new Error("File e tipo documento sono obbligatori");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${companyId}/${employeeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("medical_documents")
        .insert({
          company_id: companyId,
          employee_id: employeeId,
          medical_record_id: medicalRecordId || null,
          visit_id: visitId || null,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          notes: notes || null,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Documento caricato con successo");
      queryClient.invalidateQueries({ queryKey: ["medical-documents"] });
      setFile(null);
      setDocumentType("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: any) => {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("medical_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Documento eliminato");
      queryClient.invalidateQueries({ queryKey: ["medical-documents"] });
    },
    onError: (error: any) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleDownload = async (doc: any) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(doc.file_path);

    if (error) {
      toast.error("Errore nel download");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Documenti Medici</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Carica Nuovo Documento</h3>
            
            <div className="space-y-2">
              <Label>Tipo Documento *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File *</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>

            <Button 
              onClick={() => uploadMutation.mutate()}
              disabled={!file || !documentType || uploadMutation.isPending}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? "Caricamento..." : "Carica Documento"}
            </Button>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Documenti Caricati</h3>
            {documents && documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{doc.file_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {documentTypes.find(t => t.value === doc.document_type)?.label} - {" "}
                        {format(new Date(doc.created_at), "dd/MM/yyyy")}
                      </div>
                      {doc.notes && (
                        <div className="text-sm text-muted-foreground mt-1">{doc.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(doc)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nessun documento caricato
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
