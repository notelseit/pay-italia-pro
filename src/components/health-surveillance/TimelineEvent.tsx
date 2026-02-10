import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  FileText,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { TimelineEvent as TEvent, TimelineEventType } from "@/hooks/useMedicalTimeline";

const EVENT_CONFIG: Record<
  TimelineEventType,
  { label: string; color: string; dotColor: string; icon: React.ElementType }
> = {
  record_opened: {
    label: "Cartella aperta",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    dotColor: "bg-green-500",
    icon: FolderOpen,
  },
  record_closed: {
    label: "Cartella chiusa",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    dotColor: "bg-gray-500",
    icon: FolderClosed,
  },
  visit_scheduled: {
    label: "Visita programmata",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    dotColor: "bg-blue-500",
    icon: Calendar,
  },
  visit_completed: {
    label: "Visita completata",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    dotColor: "bg-blue-500",
    icon: Calendar,
  },
  judgment: {
    label: "Giudizio",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    dotColor: "bg-purple-500",
    icon: ClipboardCheck,
  },
  expiry: {
    label: "Scadenza",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    dotColor: "bg-red-500",
    icon: AlertTriangle,
  },
  document: {
    label: "Documento",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    dotColor: "bg-orange-500",
    icon: FileText,
  },
};

interface TimelineEventProps {
  event: TEvent;
}

export function TimelineEventItem({ event }: TimelineEventProps) {
  const [open, setOpen] = useState(false);
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.document;
  const Icon = config.icon;

  const hasMetadata =
    event.metadata && Object.keys(event.metadata).some((k) => event.metadata[k] != null);

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0 ring-2 ring-background", config.dotColor)} />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 -mt-0.5">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="secondary" className={cn("text-xs font-medium", config.color)}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(event.event_date), "d MMMM yyyy", { locale: it })}
          </span>
        </div>

        <p className="text-sm font-medium text-foreground">{event.title}</p>

        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
        )}

        {hasMetadata && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
              {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {open ? "Nascondi dettagli" : "Mostra dettagli"}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-2 rounded bg-muted text-xs space-y-1">
                {Object.entries(event.metadata)
                  .filter(([, v]) => v != null && v !== "")
                  .map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="text-muted-foreground break-all">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
