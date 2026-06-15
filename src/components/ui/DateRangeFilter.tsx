import { Calendar } from 'lucide-react';
import { parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, isWithinInterval } from 'date-fns';

export type PeriodKey =
  | 'all'
  | 'this-week'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'custom';

export interface DateRange {
  start: Date | null;
  end:   Date | null;
}

const PERIOD_OPTIONS: { label: string; value: PeriodKey }[] = [
  { label: 'All time',       value: 'all'           },
  { label: 'This week',      value: 'this-week'     },
  { label: 'This month',     value: 'this-month'    },
  { label: 'Last month',     value: 'last-month'    },
  { label: 'Last 3 months',  value: 'last-3-months' },
  { label: 'Last 6 months',  value: 'last-6-months' },
  { label: 'This year',      value: 'this-year'     },
  { label: 'Custom range',   value: 'custom'        },
];

export function getPeriodRange(
  period: PeriodKey,
  customStart?: string,
  customEnd?: string,
): DateRange {
  const now = new Date();
  switch (period) {
    case 'all':           return { start: null, end: null };
    case 'this-week':     return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'this-month':    return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last-month':    return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    case 'last-3-months': return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    case 'last-6-months': return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    case 'this-year':     return { start: startOfYear(now), end: now };
    case 'custom':        return {
      start: customStart ? parseISO(customStart) : null,
      end:   customEnd   ? parseISO(customEnd)   : null,
    };
    default:              return { start: null, end: null };
  }
}

export function isInDateRange(date: Date | string, range: DateRange): boolean {
  if (!range.start && !range.end) return true;
  const d = date instanceof Date ? date : new Date(date);
  if (range.start && range.end) return isWithinInterval(d, { start: range.start, end: range.end });
  if (range.start) return d >= range.start;
  if (range.end)   return d <= range.end;
  return true;
}

interface Props {
  period:               PeriodKey;
  onPeriodChange:       (p: PeriodKey) => void;
  customStart:          string;
  customEnd:            string;
  onCustomStartChange:  (v: string) => void;
  onCustomEndChange:    (v: string) => void;
}

export function DateRangeFilter({
  period, onPeriodChange,
  customStart, customEnd,
  onCustomStartChange, onCustomEndChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
        <select
          value={period}
          onChange={e => onPeriodChange(e.target.value as PeriodKey)}
          className="pl-8 pr-8 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent appearance-none cursor-pointer"
        >
          {PERIOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {period === 'custom' && (
        <>
          <input
            type="date"
            value={customStart}
            onChange={e => onCustomStartChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
          <span className="text-sm text-[var(--text-muted)]">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => onCustomEndChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </>
      )}
    </div>
  );
}
