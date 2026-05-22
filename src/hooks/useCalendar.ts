import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { CalendarEvent } from '../db/types';

export function useCalendarEvents(): CalendarEvent[] {
  return useLiveQuery(() => db.calendarEvents.orderBy('date').toArray(), []) ?? [];
}

export async function addCalendarEvent(
  data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  await db.calendarEvents.add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateCalendarEvent(
  id: number,
  data: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>
): Promise<void> {
  await db.calendarEvents.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  await db.calendarEvents.delete(id);
}
