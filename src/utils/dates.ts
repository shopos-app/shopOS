import { format, addDays, differenceInDays, isAfter, startOfMonth, endOfMonth } from 'date-fns';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'd MMM yyyy');
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yy');
}

export function calcDueDate(invoiceDate: Date, termsDays: number): Date {
  return addDays(new Date(invoiceDate), termsDays);
}

export function getDaysOverdue(dueDate: Date | string): number {
  const days = differenceInDays(new Date(), new Date(dueDate));
  return Math.max(0, days);
}

export function isOverdue(dueDate: Date | string, status: string): boolean {
  return (status === 'unpaid' || status === 'partial') && isAfter(new Date(), new Date(dueDate));
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function formatMonth(date: Date): string {
  return format(date, 'MMM yyyy');
}
