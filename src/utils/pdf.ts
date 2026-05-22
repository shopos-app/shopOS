// Dynamically imports html2pdf.js and generates a PDF from a DOM element.
// Uses dynamic import so the heavy library is only loaded when needed.
export async function downloadInvoicePDF(elementId: string, filename: string): Promise<void> {
  // html2pdf.js has no TS types; use dynamic import with any cast
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import('html2pdf.js' as any)).default;

  const element = document.getElementById(elementId);
  if (!element) throw new Error('Print element not found');

  await html2pdf()
    .set({
      margin:     [8, 8, 8, 8],          // mm
      filename,
      image:      { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:    2,
        useCORS:  true,
        logging:  false,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit:        'mm',
        format:      'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    })
    .from(element)
    .save();
}
