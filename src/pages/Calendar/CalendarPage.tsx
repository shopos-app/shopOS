import { useState, useMemo } from 'react';
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  isSameMonth, isSameDay, isToday,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus,
  Pencil, Trash2, FileText, CreditCard, Pin,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  useCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../../hooks/useCalendar';
import { Button }   from '../../components/ui/Button';
import { Input }    from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal }    from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils/currency';
import { cn } from '../../utils/cn';
import type { CalendarEvent } from '../../db/types';

// ── Day-of-week header labels ────────────────────────────────────────────────
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Event add / edit modal ────────────────────────────────────────────────────
interface EventModalProps {
  open:     boolean;
  onClose:  () => void;
  initial?: CalendarEvent | null;
  defaultDate: Date;
}

function EventModal({ open, onClose, initial, defaultDate }: EventModalProps) {
  const { toast } = useToast();
  const isEdit = !!initial?.id;

  const [title,   setTitle]   = useState(initial?.title ?? '');
  const [date,    setDate]    = useState(
    format(initial ? new Date(initial.date) : defaultDate, 'yyyy-MM-dd')
  );
  const [notes,   setNotes]   = useState(initial?.notes ?? '');
  const [saving,  setSaving]  = useState(false);

  // Reset form when modal opens with new props
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setTitle(initial?.title ?? '');
    setDate(format(initial ? new Date(initial.date) : defaultDate, 'yyyy-MM-dd'));
    setNotes(initial?.notes ?? '');
    setLastOpen(true);
  }
  if (!open && lastOpen) setLastOpen(false);

  async function save() {
    if (!title.trim()) { toast('error', 'Title is required'); return; }
    if (!date)         { toast('error', 'Date is required');  return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        date:  new Date(`${date}T00:00:00`),
        notes: notes.trim(),
      };
      if (isEdit) {
        await updateCalendarEvent(initial!.id!, payload);
        toast('success', 'Event updated');
      } else {
        await addCalendarEvent(payload);
        toast('success', 'Event added');
      }
      onClose();
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Event' : 'New Event'}
    >
      <div className="space-y-4 mt-4">
        <Input
          label="Title"
          placeholder="e.g. Machine delivery, Team meeting"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <Textarea
          label="Notes (optional)"
          placeholder="Any additional details..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={save}>
            {isEdit ? 'Save Changes' : 'Add Event'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main CalendarPage ─────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay,  setSelectedDay]  = useState(() => new Date());
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editEvent,    setEditEvent]    = useState<CalendarEvent | null>(null);

  // Live data
  const invoices      = useLiveQuery(() => db.invoices.toArray(),      []) ?? [];
  const bills         = useLiveQuery(() => db.bills.toArray(),          []) ?? [];
  const calendarEvents = useCalendarEvents();

  // ── Calendar grid days ───────────────────────────────────────────────────────
  const calDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // ── Event map: date-key → { invoices, bills, events } ───────────────────────
  const eventMap = useMemo(() => {
    const map = new Map<string, {
      invoices: typeof invoices;
      bills:    typeof bills;
      events:   CalendarEvent[];
    }>();

    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { invoices: [], bills: [], events: [] });
      return map.get(key)!;
    };

    invoices.forEach(inv => {
      if (inv.status === 'paid') return;
      ensure(format(new Date(inv.dueDate), 'yyyy-MM-dd')).invoices.push(inv);
    });
    bills.forEach(bill => {
      if (bill.status === 'paid') return;
      ensure(format(new Date(bill.dueDate), 'yyyy-MM-dd')).bills.push(bill);
    });
    calendarEvents.forEach(ev => {
      ensure(format(new Date(ev.date), 'yyyy-MM-dd')).events.push(ev);
    });

    return map;
  }, [invoices, bills, calendarEvents]);

  // Selected day data
  const selectedKey  = format(selectedDay, 'yyyy-MM-dd');
  const selectedData = eventMap.get(selectedKey) ?? { invoices: [], bills: [], events: [] };
  const hasAnything  = selectedData.invoices.length > 0 || selectedData.bills.length > 0 || selectedData.events.length > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function openAddModal() {
    setEditEvent(null);
    setModalOpen(true);
  }
  function openEditModal(ev: CalendarEvent) {
    setEditEvent(ev);
    setModalOpen(true);
  }
  async function handleDelete(id: number) {
    if (!confirm('Delete this event?')) return;
    await deleteCalendarEvent(id);
    toast('success', 'Event deleted');
  }

  // ── Calendar cell ─────────────────────────────────────────────────────────────
  function DayCell({ day }: { day: Date }) {
    const key      = format(day, 'yyyy-MM-dd');
    const data     = eventMap.get(key);
    const inMonth  = isSameMonth(day, currentMonth);
    const selected = isSameDay(day, selectedDay);
    const today    = isToday(day);

    const dots: Array<{ color: string; title: string }> = [];
    if (data?.invoices.length) dots.push({ color: 'var(--danger)',  title: 'Invoice due' });
    if (data?.bills.length)    dots.push({ color: 'var(--warning)', title: 'Bill due' });
    if (data?.events.length)   dots.push({ color: 'var(--primary)', title: 'Event' });

    return (
      <button
        onClick={() => { setSelectedDay(day); if (!isSameMonth(day, currentMonth)) setCurrentMonth(day); }}
        className={cn(
          'flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors',
          'hover:bg-[var(--bg-elevated)]',
          selected && 'bg-[var(--bg-elevated)] ring-2 ring-[var(--primary)] ring-inset',
          !inMonth && 'opacity-30',
        )}
      >
        <span className={cn(
          'w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium',
          today && !selected && 'bg-[var(--primary)] text-white',
          today && selected  && 'bg-[var(--primary)] text-white',
          !today && 'text-[var(--text-primary)]',
        )}>
          {format(day, 'd')}
        </span>
        {/* Dots */}
        <div className="flex gap-0.5 h-1.5 items-center">
          {dots.map((dot, i) => (
            <span
              key={i}
              title={dot.title}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: dot.color }}
            />
          ))}
        </div>
      </button>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col md:flex-row gap-0 md:gap-5 h-full min-h-0">

        {/* ── Left: Calendar grid ── */}
        <div className="md:w-[52%] shrink-0 flex flex-col">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-[var(--text-primary)]">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              {!isSameDay(currentMonth, new Date()) && (
                <button
                  onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
                  className="text-xs text-[var(--primary)] font-medium hover:underline"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-[var(--text-muted)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calDays.map(day => (
              <DayCell key={day.toISOString()} day={day} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)] font-medium">Legend:</span>
            {[
              { color: 'var(--danger)',  label: 'Invoice due' },
              { color: 'var(--warning)', label: 'Bill due' },
              { color: 'var(--primary)', label: 'Event' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="hidden md:block w-px bg-[var(--border)] shrink-0" />
        <div className="md:hidden h-px bg-[var(--border)] my-4" />

        {/* ── Right: Day detail ── */}
        <div className="flex-1 min-h-0 flex flex-col md:overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {format(selectedDay, 'EEEE, d MMMM')}
              </p>
              {isToday(selectedDay) && (
                <p className="text-xs text-[var(--primary)] font-medium">Today</p>
              )}
            </div>
            <Button
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={openAddModal}
            >
              Add event
            </Button>
          </div>

          {/* Empty state */}
          {!hasAnything && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Pin className="w-8 h-8 text-[var(--text-muted)] opacity-40 mb-2" />
              <p className="text-sm text-[var(--text-muted)]">Nothing on this day</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Tap "Add event" to create one.</p>
            </div>
          )}

          {/* ── Invoice dues ── */}
          {selectedData.invoices.length > 0 && (
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--danger)' }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--danger)' }}>
                  Invoice Due · {selectedData.invoices.length}
                </p>
              </div>
              <div className="space-y-1.5">
                {selectedData.invoices.map(inv => {
                  const balance = inv.total - inv.paidAmount;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {inv.customerSnapshot.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{inv.invoiceNumber}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--danger)' }}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Bill dues ── */}
          {selectedData.bills.length > 0 && (
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--warning)' }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--warning)' }}>
                  Bill Due · {selectedData.bills.length}
                </p>
              </div>
              <div className="space-y-1.5">
                {selectedData.bills.map(bill => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {bill.vendorName}
                      </p>
                      {bill.description && (
                        <p className="text-xs text-[var(--text-muted)] truncate">{bill.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--warning)' }}>
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Manual events ── */}
          {selectedData.events.length > 0 && (
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Pin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  Events · {selectedData.events.length}
                </p>
              </div>
              <div className="space-y-1.5">
                {selectedData.events.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{ev.title}</p>
                      {ev.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{ev.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id!)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Event modal */}
      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEvent(null); }}
        initial={editEvent}
        defaultDate={selectedDay}
      />
    </>
  );
}
