import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { cn } from "../../lib/utils";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export interface CalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabledBefore?: Date;
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  disabledBefore,
  className,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => startOfMonth(new Date()));
  const activeMonth = month ?? internalMonth;

  const changeMonth = (next: Date) => {
    if (month === undefined) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const minDate = startOfDay(disabledBefore ?? new Date());
  const gridStart = startOfWeek(startOfMonth(activeMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(activeMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => changeMonth(addMonths(activeMonth, -1))}
          aria-label="Bulan sebelumnya"
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div
          aria-live="polite"
          className="font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground"
        >
          {format(activeMonth, "MMMM yyyy", { locale: idLocale })}
        </div>
        <button
          type="button"
          onClick={() => changeMonth(addMonths(activeMonth, 1))}
          aria-label="Bulan berikutnya"
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 px-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1.5 text-center text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div role="grid" aria-label="Pilih tanggal booking" className="grid grid-cols-7 gap-1 px-1">
        {days.map((day) => {
          const isPast = day < minDate;
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, new Date());
          const outside = !isSameMonth(day, activeMonth);

          return (
            <button
              key={day.toISOString()}
              type="button"
              role="gridcell"
              aria-label={format(day, "EEEE, d MMMM yyyy", { locale: idLocale })}
              aria-selected={isSelected}
              disabled={isPast}
              onClick={() => onSelect(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                outside && "text-muted-foreground/35",
                !isSelected && !isPast && "hover:bg-accent hover:text-foreground",
                isPast && "cursor-not-allowed text-muted-foreground/25",
                isToday && !isSelected && "font-bold text-primary ring-1 ring-primary/40",
                isSelected &&
                  "bg-primary font-bold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(163,230,53,0.8)]",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
