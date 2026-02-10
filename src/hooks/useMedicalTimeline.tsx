import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export type TimelineEventType =
  | "record_opened"
  | "record_closed"
  | "visit_scheduled"
  | "visit_completed"
  | "judgment"
  | "expiry"
  | "document";

export interface TimelineEvent {
  id: string;
  event_type: TimelineEventType;
  event_date: string;
  title: string;
  description: string;
  status: string;
  metadata: Record<string, unknown>;
  is_future: boolean;
}

export interface TimelineFilters {
  eventTypes?: TimelineEventType[];
  dateFrom?: string;
  dateTo?: string;
}

export function useMedicalTimeline(
  employeeId: string | undefined,
  companyId: string | undefined,
  filters?: TimelineFilters
) {
  const query = useQuery({
    queryKey: ["medical-timeline", employeeId, companyId],
    queryFn: async () => {
      if (!employeeId || !companyId) return [];

      const { data, error } = await supabase.rpc("get_medical_timeline", {
        p_employee_id: employeeId,
        p_company_id: companyId,
      });

      if (error) throw error;
      return (data as unknown as TimelineEvent[]) || [];
    },
    enabled: !!employeeId && !!companyId,
  });

  const filteredData = useMemo(() => {
    if (!query.data) return { events: [], futureEvents: [] };

    let filtered = query.data;

    if (filters?.eventTypes && filters.eventTypes.length > 0) {
      filtered = filtered.filter((e) => filters.eventTypes!.includes(e.event_type));
    }

    if (filters?.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter((e) => new Date(e.event_date) >= from);
    }

    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      filtered = filtered.filter((e) => new Date(e.event_date) <= to);
    }

    const futureEvents = filtered
      .filter((e) => e.is_future)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    const pastEvents = filtered
      .filter((e) => !e.is_future)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    return { events: pastEvents, futureEvents };
  }, [query.data, filters?.eventTypes, filters?.dateFrom, filters?.dateTo]);

  return {
    events: filteredData.events,
    futureEvents: filteredData.futureEvents,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
