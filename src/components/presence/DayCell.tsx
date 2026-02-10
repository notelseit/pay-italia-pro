import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type DayType = "working" | "vacation" | "sick" | "leave" | "holiday" | "non_working";

export interface DayData {
  date: Date;
  dayType: DayType;
  overtimeHours: number;
  nightHolidayHours: number;
  notes: string;
  holidayName?: string;
}

interface DayCellProps {
  day: DayData;
  onUpdate: (updated: DayData) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const DAY_TYPE_CONFIG: Record<DayType, { label: string; bg: string; text: string; short: string }> = {
  working:     { label: "Lavorativo",    bg: "bg-emerald-100 dark:bg-emerald-900/40",   text: "text-emerald-800 dark:text-emerald-200",   short: "L" },
  vacation:    { label: "Ferie",         bg: "bg-blue-100 dark:bg-blue-900/40",         text: "text-blue-800 dark:text-blue-200",         short: "F" },
  sick:        { label: "Malattia",      bg: "bg-red-100 dark:bg-red-900/40",           text: "text-red-800 dark:text-red-200",           short: "M" },
  leave:       { label: "Permesso",      bg: "bg-amber-100 dark:bg-amber-900/40",       text: "text-amber-800 dark:text-amber-200",       short: "P" },
  holiday:     { label: "Festivo",       bg: "bg-gray-200 dark:bg-gray-700",            text: "text-gray-600 dark:text-gray-300",         short: "Fe" },
  non_working: { label: "Non Lavorativo",bg: "bg-gray-100 dark:bg-gray-800",            text: "text-gray-400 dark:text-gray-500",         short: "NL" },
};

const DAY_TYPES: DayType[] = ["working", "vacation", "sick", "leave", "holiday", "non_working"];

export const DayCell = ({ day, onUpdate, isSelected, onSelect }: DayCellProps) => {
  const [open, setOpen] = useState(false);
  const config = DAY_TYPE_CONFIG[day.dayType];
  const dayNum = day.date.getDate();

  const handleTypeChange = (type: DayType) => {
    onUpdate({ ...day, dayType: type });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium transition-all border cursor-pointer hover:ring-2 hover:ring-primary/40",
            config.bg,
            config.text,
            isSelected && "ring-2 ring-primary"
          )}
          onClick={(e) => {
            if (e.shiftKey && onSelect) {
              e.preventDefault();
              onSelect();
              return;
            }
          }}
        >
          <span className="text-sm font-bold">{dayNum}</span>
          <span className="text-[10px] leading-tight">{config.short}</span>
          {day.overtimeHours > 0 && (
            <span className="text-[9px] font-semibold text-primary mt-0.5">+{day.overtimeHours}h</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-semibold">
            {dayNum}/{day.date.getMonth() + 1} - {config.label}
            {day.holidayName && (
              <p className="text-xs text-muted-foreground font-normal">{day.holidayName}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1">
            {DAY_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant={day.dayType === type ? "default" : "outline"}
                size="sm"
                className="text-[10px] px-1 h-7"
                onClick={() => handleTypeChange(type)}
              >
                {DAY_TYPE_CONFIG[type].short}
              </Button>
            ))}
          </div>

          {day.dayType === "working" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Ore straordinarie</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={day.overtimeHours}
                  onChange={(e) =>
                    onUpdate({ ...day, overtimeHours: parseFloat(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ore notturno/festivo</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={day.nightHolidayHours}
                  onChange={(e) =>
                    onUpdate({ ...day, nightHolidayHours: parseFloat(e.target.value) || 0 })
                  }
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { DAY_TYPE_CONFIG };
