import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, FileText } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCustomer, updateCustomer, deleteCustomer } from '../../hooks/useCustomers';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils/currency';
import { formatDate, isOverdue, getDaysOverdue } from '../../utils/dates';
import { cn } from '../../utils/cn';
import type { Invoice } from '../../db/types';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: 'warning' | 'success' }) {
  return (
    <Card>
      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">{label}</p>
      <p className={cn(
        'text-2xl font-bold tabular-nums',
        highlight === 'warning' ? 'text-[var(--warning)]' :
        highlight === 'success' ? 'text-[var(--success)]' :
        'text-[var(--text-primary)]'
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </Card>
  );
}

// ── Edit modal ─────────────────────────────────────────────────────────────────
function EditModal({ open, onClose, customer }: { open: boolean; onClose: () => void; customer: ReturnType<typeof useCustomer> }) {
  const { toast } = useToast();
  const [name,      setName]      = useState(customer?.name ?? '');
  const [phone,     setPhone]     = useState(customer?.phone ?? '');
  const [email,     setEmail]     = useState(customer?.email ?? '');
  const [city,      setCity]      = useState(customer?.city ?? '');
  const [address,   setAddress]   = useState(customer?.address ?? '');
  const [gstNumber, setGstNumber] = useState(customer?.gstNumber ?? '');
  const [saving,    setSaving]    = useState(false);

  const save = async () => {
    if (!name.trim() || !customer?.id) return;
    setSaving(true);
    try {
      await updateCustomer(customer.id, { name, phone, email, city, address, gstNumber });
      toast('success', 'Customer updated');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Customer">
      <div className="space-y-3">
        <Input label="Name"       value={name}      onChange={e => setName(e.target.value)}      autoFocus />
        <Input label="Phone"      value={phone}     onChange={e => setPhone(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email"    value={email}     onChange={e => setEmail(e.target.value)} />
          <Input label="City"     value={city}      onChange={e => setCity(e.target.value)} />
        </div>
        <Input label="Address"    value={address}   onChange={e => setAddress(e.target.value)} />
        <Input label="GST Number" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="Optional" />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={save}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Invoice row ────────────────────────────────────────────────────────────────
function InvoiceRow({ inv, last }: { inv: Invoice; last: boolean }) {
  const navigate = useNavigate();
  const overdue  = isOverdue(inv.dueDate, inv.status);
  const status   = overdue ? 'overdue' : inv.status;
  const days     = overdue ? getDaysOverdue(inv.dueDate) : 0;

  return (
    <div
      onClick={() => navigate(`/invoices/${inv.id}`)}
      className={cn(
        'grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer',
        'hover:bg-[var(--bg-elevated)] transition-colors',
        !last && 'border-b border-[var(--border)]',
        overdue && 'border-l-2 border-l-[var(--danger)]'
      )}
    >
      <div className="col-span-3">
        <p className="text-sm font-medium text-[var(--text-primary)]">{inv.invoiceNumber}</p>
        <p className="text-xs text-[var(--text-muted)]">{formatDate(inv.date)}</p>
      </div>
      <div className="col-span-3 text-xs text-[var(--text-muted)]">
        Due {formatDate(inv.dueDate)}
        {overdue && <span className="block text-[var(--danger)]">{days}d overdue</span>}
      </div>
      <div className="col-span-3 text-right tabular-nums">
        <p className="text-sm text-[var(--text-primary)]">{formatCurrency(inv.total)}</p>
        {inv.paidAmount > 0 && inv.paidAmount < inv.total && (
          <p className="text-xs text-[var(--text-muted)]">Paid {formatCurrency(inv.paidAmount)}</p>
        )}
      </div>
      <div className="col-span-3 flex justify-end">
        <Badge status={status} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerDetail() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const customerId    = Number(id);

  const customer = useCustomer(customerId);
  const invoices = useLiveQuery(
    () => db.invoices.where('customerId').equals(customerId).reverse().sortBy('date'),
    [customerId]
  ) ?? [];

  const [showEdit,   setShowEdit]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  if (customer === undefined) return <PageSpinner />;
  if (customer === null) return (
    <div className="p-6 text-[var(--text-muted)]">Customer not found.</div>
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast('success', `${customer.name} deleted`);
      navigate('/customers');
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Could not delete customer');
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> All Customers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{customer.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-secondary)]">
            <span>{customer.phone}</span>
            {customer.city && <><span className="text-[var(--border-strong)]">·</span><span>{customer.city}</span></>}
            {customer.gstNumber && <><span className="text-[var(--border-strong)]">·</span><span className="font-mono text-xs">{customer.gstNumber}</span></>}
          </div>
          {customer.address && <p className="text-xs text-[var(--text-muted)] mt-0.5">{customer.address}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="ghost"     size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setShowDelete(true)} className="text-[var(--danger)] hover:bg-[var(--danger-subtle)]">Delete</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Billed"
          value={formatCurrency(customer.totalBilled)}
          sub={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(customer.totalPaid)}
          highlight={customer.totalPaid >= customer.totalBilled && customer.totalBilled > 0 ? 'success' : undefined}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(customer.outstanding)}
          highlight={customer.outstanding > 0 ? 'warning' : undefined}
          sub={customer.outstanding === 0 && customer.totalBilled > 0 ? 'All paid up' : undefined}
        />
      </div>

      {/* Invoice history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Invoice History</h2>
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/invoices/new?customerId=${customerId}`)}
          >
            New Invoice
          </Button>
        </div>

        {invoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" strokeWidth={1.5} />}
            title="No invoices yet"
            description="Create the first invoice for this customer."
            action={{ label: 'New Invoice', onClick: () => navigate(`/invoices/new?customerId=${customerId}`) }}
          />
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <span className="col-span-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Invoice</span>
              <span className="col-span-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Due Date</span>
              <span className="col-span-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-right">Amount</span>
              <span className="col-span-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide text-right">Status</span>
            </div>
            {invoices.map((inv, i) => (
              <InvoiceRow key={inv.id} inv={inv} last={i === invoices.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditModal open={showEdit} onClose={() => setShowEdit(false)} customer={customer} />

      {/* Delete confirm */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Customer"
        description={invoices.length > 0
          ? `${customer.name} has ${invoices.length} invoice${invoices.length > 1 ? 's' : ''} and cannot be deleted.`
          : `Are you sure you want to delete ${customer.name}? This cannot be undone.`
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
          {invoices.length === 0 && (
            <Button variant="danger" loading={deleting} onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
