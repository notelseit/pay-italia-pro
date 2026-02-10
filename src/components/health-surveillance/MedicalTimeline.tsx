import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useMedicalTimeline, type TimelineEventType, type TimelineFilters } from "@/hooks/useMedicalTimeline";
import { TimelineEventItem } from "./TimelineEvent";

const EVENT_TYPE_OPTIONS: { value: TimelineEventType; label: string }[] = [
  { value: "record_opened", label: "Cartelle" },
  { value: "visit_scheduled", label: "Visite programmate" },
  { value: "visit_completed", label: "Visite completate" },
  { value: "judgment", label: "Giudizi" },
  { value: "document", label: "Documenti" },
  { value: "expiry", label: "Scadenze" },
];

interface MedicalTimelineProps {
  employeeId: string;
  companyId: string;
}

export function MedicalTimeline({ employeeId, companyId }: MedicalTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>({});
  const [selectedType, setSelectedType] = useState<string>("all");

  const activeFilters: TimelineFilters = {
    ...filters,
    eventTypes: selectedType !== "all" ? [selectedType as TimelineEventType] : undefined,
  };

  const { events, futureEvents, isLoading } = useMedicalTimeline(employeeId, companyId, activeFilters);

  const resetFilters = () => {
    setFilters({});
    setSelectedType("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Caricamento timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Tipo evento</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tutti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli eventi</SelectItem>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Da</Label>
          <Input
            type="date"
            className="w-[150px]"
            value={filters.dateFrom || ""}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">A</Label>
          <Input
            type="date"
            className="w-[150px]"
            value={filters.dateTo || ""}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Future events / deadlines */}
      {futureEvents.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              Scadenze Future ({futureEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {futureEvents.map((ev) => (
              <div key={`${ev.id}-${ev.event_type}`} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{ev.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(ev.event_date), "d MMM yyyy", { locale: it })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nessun evento trovato per i filtri selezionati
        </p>
      ) : (
        <div className="pl-1">
          {events.map((ev) => (
            <TimelineEventItem key={`${ev.id}-${ev.event_type}`} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}
