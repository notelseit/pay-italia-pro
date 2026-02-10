import { ScrollArea } from "@/components/ui/scroll-area";
import type { VersionRecord } from "@/hooks/useVersionHistory";

interface VersionDetailViewProps {
  version: VersionRecord;
}

// Formatta chiave JSON da snake_case a formato leggibile
function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">N/A</span>;
  }
  if (typeof value === "boolean") {
    return <span className={value ? "text-primary" : "text-muted-foreground"}>{value ? "Sì" : "No"}</span>;
  }
  if (typeof value === "number") {
    return <span className="font-mono">{value}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground italic">Vuoto</span>;
    return (
      <div className="ml-4 space-y-1">
        {value.map((item, i) => (
          <div key={i} className="border-l-2 border-border pl-3 py-1">
            {typeof item === "object" ? (
              <div className="space-y-0.5">
                {Object.entries(item).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[100px]">{formatKey(k)}:</span>
                    <span>{renderValue(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm">{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="ml-4 space-y-0.5">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-muted-foreground min-w-[100px]">{formatKey(k)}:</span>
            <span>{renderValue(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}

export function VersionDetailView({ version }: VersionDetailViewProps) {
  const data = version.data_json;

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {Object.entries(data)
          .filter(([key]) => !["id", "company_id", "created_at", "updated_at"].includes(key))
          .map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-foreground">{formatKey(key)}</p>
              <div className="text-sm">{renderValue(value)}</div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
}
