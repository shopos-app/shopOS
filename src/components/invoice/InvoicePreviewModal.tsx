import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { InvoicePrintView } from './InvoicePrintView';
import { Button } from '../ui/Button';
import type { Invoice, InvoiceItem, Payment, ColumnTemplate, Settings } from '../../db/types';

interface Props {
  open:    boolean;
  onClose: () => void;
  onPrint: () => void;
  invoice:  Invoice;
  items:    InvoiceItem[];
  payments: Payment[];
  columns:  ColumnTemplate[];
  settings: Settings;
}

export function InvoicePreviewModal({
  open, onClose, onPrint,
  invoice, items, payments, columns, settings,
}: Props) {
  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const printId = `invoice-print-${invoice.id}`;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />

      {/* Scroll container */}
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '0 16px 40px' }}>

        {/* Sticky toolbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(8px)',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '14px', margin: 0 }}>
            {invoice.invoiceNumber} — Preview
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button icon={<Printer className="w-4 h-4" />} onClick={onPrint}>
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94A3B8',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Invoice — rendered visibly so the DOM element can be read by printInvoice */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
            <InvoicePrintView
              id={printId}
              invoice={invoice}
              items={items}
              payments={payments}
              columns={columns}
              settings={settings}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
