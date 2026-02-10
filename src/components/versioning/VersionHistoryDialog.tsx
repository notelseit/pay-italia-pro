import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, RotateCcw } from "lucide-react";
import { useVersionHistory, type VersionEntityType, type VersionRecord } from "@/hooks/useVersionHistory";
import { VersionDetailView } from "./VersionDetailView";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: VersionEntityType;
  entityId: string;
  entityLabel?: string;
  companyId: string;
  onRestore?: (dataJson: Record<string, any>) => void;
}

const ENTITY_LABELS: Record<VersionEntityType, string> = {
  ccnl: "CCNL",
  payroll_settings: "Parametri Cedolini",
  contract: "Contratto",
};

export function VersionHistoryDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityLabel,
  companyId,
  onRestore,
}: VersionHistoryDialogProps) {
  const { versions, isLoading, createVersion } = useVersionHistory(entityType, entityId);
  const [selectedVersion, setSelectedVersion] = useState<VersionRecord | null>(null);

  const label = entityLabel || ENTITY_LABELS[entityType];

  const handleRestore = (version: VersionRecord) => {
    if (onRestore) {
      onRestore(version.data_json);
    } else {
      createVersion.mutate({
        parentId: entityId,
        companyId,
        dataJson: version.data_json,
        changeSummary: `Ripristino dalla versione ${version.version_number}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cronologia Versioni - {label}</DialogTitle>
          <DialogDescription>
            {versions.length} versioni registrate. Le versioni sono immutabili.
          </DialogDescription>
        </DialogHeader>

        {selectedVersion ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Versione {selectedVersion.version_number}</h3>
                {selectedVersion.is_active && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Attiva</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedVersion(null)}>
                ← Torna alla lista
              </Button>
            </div>
            {selectedVersion.change_summary && (
              <p className="text-sm text-muted-foreground">{selectedVersion.change_summary}</p>
            )}
            <Separator />
            <VersionDetailView version={selectedVersion} />
          </div>
        ) : (
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Caricamento...</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nessuna versione registrata. La prima versione verrà creata al prossimo salvataggio.
              </p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">v{version.version_number}</span>
                      {version.is_active && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Attiva
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(version.created_at), "dd MMM yyyy, HH:mm", { locale: it })}
                    </p>
                    {version.change_summary && (
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {version.change_summary}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedVersion(version)}
                      title="Visualizza dettagli"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!version.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRestore(version)}
                        title="Ripristina come nuova versione"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
