// Dynamically imports html2pdf.js and generates a PDF from a DOM element.
// html2canvas can't capture position:fixed elements outside the viewport, so
// we briefly relocate the element to the top-left before capture then restore.
export async function downloadInvoicePDF(elementId: string, filename: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import('html2pdf.js' as any)).default;

  const el = document.getElementById(elementId);
  if (!el) throw new Error('Print element not found');

  // ── Temporarily bring element into capturable position ──────────────────────
  const savedPosition   = el.style.position;
  const savedLeft       = el.style.left;
  const savedTop        = el.style.top;
  const savedVisibility = el.style.visibility;
  const savedZIndex     = el.style.zIndex;

  el.style.position   = 'absolute';
  el.style.left       = '0px';
  el.style.top        = '0px';
  el.style.visibility = 'hidden';   // invisible to the user but in layout
  el.style.zIndex     = '-1';

  try {
    await html2pdf()
      .set({
        margin:      [8, 8, 8, 8],
        filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale:           2,
          useCORS:         true,
          logging:         false,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit:        'mm',
          format:      'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(el)
      .save();
  } finally {
    // ── Restore original hiding styles ─────────────────────────────────────
    el.style.position   = savedPosition;
    el.style.left       = savedLeft;
    el.style.top        = savedTop;
    el.style.visibility = savedVisibility;
    el.style.zIndex     = savedZIndex;
  }
}
