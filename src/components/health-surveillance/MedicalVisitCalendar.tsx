import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MedicalVisitCalendarProps {
  companyId: string;
  onVisitClick?: (visit: any) => void;
}

export const MedicalVisitCalendar = ({ companyId, onVisitClick }: MedicalVisitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: visits } = useQuery({
    queryKey: ["medical-visits-calendar", companyId, currentMonth],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from("medical_visits")
        .select("id, scheduled_date, visit_type, status, employees(full_name)")
        .eq("company_id", companyId)
        .gte("scheduled_date", format(start, "yyyy-MM-dd"))
        .lte("scheduled_date", format(end, "yyyy-MM-dd"))
        .order("scheduled_date");

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getVisitsForDay = (day: Date) => {
    return visits?.filter((visit) => isSameDay(new Date(visit.scheduled_date), day)) || [];
  };

  const getPriorityColor = (scheduledDate: string, status: string) => {
    if (status !== 'scheduled') return 'bg-muted text-muted-foreground';
    
    const daysUntil = differenceInDays(new Date(scheduledDate), new Date());
    
    if (daysUntil < 0) return 'bg-destructive text-destructive-foreground'; // Scaduta
    if (daysUntil <= 7) return 'bg-destructive/80 text-destructive-foreground'; // Entro 7 giorni
    if (daysUntil <= 15) return 'bg-warning text-warning-foreground'; // Entro 15 giorni
    if (daysUntil <= 30) return 'bg-primary/60 text-primary-foreground'; // Entro 30 giorni
    return 'bg-primary text-primary-foreground'; // Oltre 30 giorni
  };

  const getVisitTypeLabel = (visitType: string) => {
    const labels: Record<string, string> = {
      'preventiva': 'Preventiva',
      'periodica': 'Periodica',
      'cambio_mansione': 'Cambio Mansione',
      'richiesta_lavoratore': 'Su Richiesta',
      'fine_rapporto': 'Fine Rapporto'
    };
    return labels[visitType] || visitType;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario Visite Mediche
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span>Scaduta/Urgente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning" />
            <span>15 giorni</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/60" />
            <span>30 giorni</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Oltre 30 giorni</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {days.map((day, idx) => {
            const dayVisits = getVisitsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[80px] p-2 border rounded-lg",
                  !isSameMonth(day, currentMonth) && "bg-muted/50 text-muted-foreground",
                  isToday && "border-primary border-2"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1",
                  isToday && "text-primary"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayVisits.map((visit: any) => (
                    <Badge
                      key={visit.id}
                      className={cn(
                        "w-full text-[10px] cursor-pointer truncate justify-start px-1 py-0.5",
                        getPriorityColor(visit.scheduled_date, visit.status)
                      )}
                      onClick={() => onVisitClick?.(visit)}
                    >
                      {visit.employees?.full_name?.split(' ')[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};