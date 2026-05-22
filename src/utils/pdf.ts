// Opens a clean print window containing just the invoice HTML, then
// triggers the browser's native print dialog.  The user can choose
// "Save as PDF" (Chrome/Edge) or any printer.  This avoids every
// html2canvas scaling / cropping / colour issue.
export function printInvoice(elementId: string, title: string): void {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) throw new Error('Popup blocked — please allow pop-ups for this site and try again.');

  popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Google Sans Flex', 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #0D1F13;
    }

    /* Make the invoice fill the page width on screen */
    body > div {
      width: 100% !important;
      max-width: 100% !important;
    }

    /* ── Print-specific rules ── */
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
      body > div {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  ${el.outerHTML}
</body>
</html>`);

  popup.document.close();

  // Fire print once everything (including base64 logo) is loaded
  popup.addEventListener('load', () => {
    popup.focus();
    popup.print();
  });

  // Fallback for browsers that don't fire 'load' on document.write
  setTimeout(() => {
    try { popup.focus(); popup.print(); } catch { /* already printed */ }
  }, 800);
}
