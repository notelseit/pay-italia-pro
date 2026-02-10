import { useMemo } from "react";
import { DayCell, DayData, DayType, DAY_TYPE_CONFIG } from "./DayCell";
import { isItalianHoliday, getHolidayName } from "@/lib/italianHolidays";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PresenceCalendarProps {
  month: number; // 1-12
  year: number;
  days: DayData[];
  onDaysChange: (days: DayData[]) => void;
  excludeWeekends: boolean;
}

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function initializeDays(month: number, year: number, excludeWeekends: boolean): DayData[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: DayData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = isItalianHoliday(date, year);
    const holidayName = getHolidayName(date, year) ?? undefined;

    let dayType: DayType = "working";
    if (isHoliday) {
      dayType = "holiday";
    } else if (isWeekend && excludeWeekends) {
      dayType = "non_working";
    }

    days.push({
      date,
      dayType,
      overtimeHours: 0,
      nightHolidayHours: 0,
      notes: "",
      holidayName,
    });
  }

  return days;
}

export const PresenceCalendar = ({
  month,
  year,
  days,
  onDaysChange,
  excludeWeekends,
}: PresenceCalendarProps) => {
  // Calculate the offset for the first day of the month (Monday=0)
  const firstDayOffset = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [month, year]);

  const handleDayUpdate = (index: number, updated: DayData) => {
    const newDays = [...days];
    newDays[index] = updated;
    onDaysChange(newDays);
  };

  const setAllWeekdaysType = (type: DayType) => {
    const newDays = days.map((d) => {
      const dow = d.date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isHoliday = d.holidayName != null;
      if (!isWeekend && !isHoliday) {
        return { ...d, dayType: type };
      }
      return d;
    });
    onDaysChange(newDays);
  };

  // Compute summary
  const summary = useMemo(() => {
    const counts: Record<DayType, number> = {
      working: 0, vacation: 0, sick: 0, leave: 0, holiday: 0, non_working: 0,
    };
    let totalOvertime = 0;
    let totalNightHoliday = 0;
    days.forEach((d) => {
      counts[d.dayType]++;
      totalOvertime += d.overtimeHours;
      totalNightHoliday += d.nightHolidayHours;
    });
    return { counts, totalOvertime, totalNightHoliday };
  }, [days]);

  // Build grid cells (empty + days)
  const emptyCells = Array.from({ length: firstDayOffset }, (_, i) => (
    <div key={`empty-${i}`} />
  ));

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Imposta tutti i feriali:</span>
        <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setAllWeekdaysType("working")}>Lavorativo</Button>
        <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setAllWeekdaysType("vacation")}>Ferie</Button>
        <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setAllWeekdaysType("sick")}>Malattia</Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {h}
          </div>
        ))}
        {emptyCells}
        {days.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            onUpdate={(updated) => handleDayUpdate(i, updated)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {(Object.keys(DAY_TYPE_CONFIG) as DayType[]).map((type) => (
          <Badge key={type} variant="outline" className="text-xs">
            {DAY_TYPE_CONFIG[type].label}: {summary.counts[type]}
          </Badge>
        ))}
        <Badge variant="outline" className="text-xs text-primary">
          Straordinari: {summary.totalOvertime}h
        </Badge>
        <Badge variant="outline" className="text-xs">
          Nott./Fest.: {summary.totalNightHoliday}h
        </Badge>
      </div>
    </div>
  );
};
