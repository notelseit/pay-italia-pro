import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { useVersionHistory, type VersionEntityType } from "@/hooks/useVersionHistory";

interface VersionBadgeProps {
  entityType: VersionEntityType;
  entityId?: string;
  onClick?: () => void;
}

export function VersionBadge({ entityType, entityId, onClick }: VersionBadgeProps) {
  const { activeVersion, isLoading } = useVersionHistory(entityType, entityId);

  if (isLoading || !entityId) return null;

  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1.5 hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <History className="h-3 w-3" />
      {activeVersion
        ? `v${activeVersion.version_number} - attiva`
        : "Nessuna versione"}
    </Badge>
  );
}
