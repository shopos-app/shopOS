import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Customer, CustomerWithStats } from '../db/types';

// ── All customers with computed stats ──────────────────────────────────────────
export function useCustomers(): CustomerWithStats[] {
  return useLiveQuery(async () => {
    const [customers, invoices, payments] = await Promise.all([
      db.customers.orderBy('name').toArray(),
      db.invoices.toArray(),
      db.payments.toArray(),
    ]);

    return customers.map(c => {
      const custInvoices = invoices.filter(inv => inv.customerId === c.id);
      const invoiceIds   = custInvoices.map(inv => inv.id!);
      const custPayments = payments.filter(p => invoiceIds.includes(p.invoiceId));

      const totalBilled = custInvoices.reduce((s, inv) => s + inv.total, 0);
      const totalPaid   = custPayments.reduce((s, p)   => s + p.amount, 0);
      const dates       = custInvoices.map(inv => new Date(inv.date));

      return {
        ...c,
        totalBilled,
        totalPaid,
        outstanding:     totalBilled - totalPaid,
        lastInvoiceDate: dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null,
      };
    });
  }, []) ?? [];
}

// ── Single customer with stats ─────────────────────────────────────────────────
export function useCustomer(id: number): CustomerWithStats | undefined {
  return useLiveQuery(async () => {
    const customer = await db.customers.get(id);
    if (!customer) return undefined;

    const invoices  = await db.invoices.where('customerId').equals(id).toArray();
    const invoiceIds = invoices.map(inv => inv.id!);
    const payments  = await db.payments.where('invoiceId').anyOf(invoiceIds).toArray();

    const totalBilled = invoices.reduce((s, inv) => s + inv.total,  0);
    const totalPaid   = payments.reduce((s, p)   => s + p.amount,   0);
    const dates       = invoices.map(inv => new Date(inv.date));

    return {
      ...customer,
      totalBilled,
      totalPaid,
      outstanding:     totalBilled - totalPaid,
      lastInvoiceDate: dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null,
    };
  }, [id]);
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function addCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  return db.customers.add({ ...data, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<void> {
  await db.customers.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteCustomer(id: number): Promise<void> {
  const invoiceCount = await db.invoices.where('customerId').equals(id).count();
  if (invoiceCount > 0) throw new Error('Customer has invoices — cannot delete');
  await db.customers.delete(id);
}

// ── Find or create by name (used during invoice creation) ─────────────────────
export async function findOrCreateCustomer(name: string, phone: string): Promise<number> {
  const existing = await db.customers.where('name').equalsIgnoreCase(name.trim()).first();
  if (existing?.id) return existing.id;
  return addCustomer({ name: name.trim(), phone, email: '', address: '', city: '', gstNumber: '', notes: '' });
}
