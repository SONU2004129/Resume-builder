/**
 * export.js – ResumeForge
 * PDF export using the browser's native print dialog.
 * No external libraries required.
 *
 * Strategy:
 *   1. Open a new window.
 *   2. Write the preview HTML + minimal print CSS into it.
 *   3. Trigger window.print().
 *   4. Close the window after printing.
 */

function downloadPDF() {
  const tpl = ResumeData.template || 'classic';
  const resumeHTML = renderTemplate(tpl);
  const name = ResumeData.personal.fullName || 'Resume';

  // Collect only the fonts and styles needed for the printed resume
  const printCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9pt;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a { color: inherit; text-decoration: none; }

    /* ---- Classic ---- */
    .tpl-classic .rv-header {
      background: linear-gradient(135deg, #1e2030 0%, #2d2f4e 100%) !important;
      color: #fff;
      padding: 1.6rem 2.2rem 1.3rem;
      border-bottom: 4px solid #6c63ff;
    }
    .tpl-classic .rv-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24pt; font-weight: 700; color: #fff; line-height: 1.1;
    }
    .tpl-classic .rv-contact-bar {
      margin-top: 0.4rem; display: flex; flex-wrap: wrap;
      gap: 0.3rem 1rem; font-size: 7pt; color: rgba(255,255,255,0.8);
    }
    .tpl-classic .rv-body {
      padding: 1.2rem 2.2rem;
      display: grid; grid-template-columns: 1fr 2.2fr; gap: 0 1.8rem;
    }
    .tpl-classic .rv-sidebar { border-right: 1px solid #e8e8e8; padding-right: 1.4rem; }
    .tpl-classic .rv-section-title {
      font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #6c63ff;
      margin-bottom: 0.4rem; padding-bottom: 0.2rem; border-bottom: 2px solid #6c63ff;
    }

    /* ---- Modern ---- */
    .tpl-modern .rv-header {
      display: grid; grid-template-columns: auto 1fr; align-items: center;
      gap: 0 1.2rem; padding: 1.5rem 2.2rem; border-left: 7px solid #00d4aa;
    }
    .tpl-modern .rv-name { font-size: 22pt; font-weight: 700; color: #1a1a2e; line-height: 1.15; }
    .tpl-modern .rv-contact-bar {
      margin-top: 0.3rem; display: flex; flex-wrap: wrap;
      gap: 0.3rem 0.8rem; font-size: 7pt; color: #555;
    }
    .tpl-modern .rv-body { padding: 0.8rem 2.2rem 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
    .tpl-modern .rv-section-title {
      font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: #00d4aa;
      margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;
    }
    .tpl-modern .rv-section-title::after { content:''; flex:1; height:1px; background:#e0e0e0; }

    /* ---- Minimal ---- */
    .tpl-minimal .rv-header {
      padding: 1.6rem 2.2rem 0.8rem; border-bottom: 2px solid #1a1a1a; text-align: center;
    }
    .tpl-minimal .rv-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26pt; font-weight: 700; color: #1a1a1a;
    }
    .tpl-minimal .rv-contact-bar {
      margin-top: 0.3rem; display: flex; flex-wrap: wrap; justify-content: center;
      gap: 0.3rem 0.8rem; font-size: 7pt; color: #555;
    }
    .tpl-minimal .rv-body { padding: 1rem 2.2rem 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
    .tpl-minimal .rv-section-title {
      font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #1a1a1a;
      margin-bottom: 0.35rem; padding-bottom: 0.2rem; border-bottom: 1px solid #ccc;
    }

    /* ---- Shared ---- */
    .rv-section { margin-bottom: 0.9rem; }
    .rv-entry { margin-bottom: 0.6rem; }
    .rv-entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
    .rv-entry-title { font-weight: 600; font-size: 9pt; color: #1a1a1a; }
    .rv-entry-sub { font-size: 8pt; color: #444; }
    .rv-entry-date { font-size: 7pt; color: #777; white-space: nowrap; }
    .rv-entry-body { font-size: 8pt; color: #555; margin-top: 0.15rem; }
    .rv-skill-list { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .rv-skill-chip {
      font-size: 7pt; padding: 0.12rem 0.5rem; border-radius: 99px;
      background: #f0f0f0; color: #333; border: 1px solid #ddd;
    }
    .tpl-classic .rv-skill-chip { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.3); color: #4b44cc; }
    .tpl-modern .rv-skill-chip { background: rgba(0,212,170,0.1); border-color: rgba(0,212,170,0.3); color: #00a88a; }
    .rv-ul { list-style: none; padding: 0; margin: 0; }
    .rv-ul li { padding-left: 1em; position: relative; font-size: 8pt; color: #555; margin-bottom: 0.12rem; }
    .rv-ul li::before { content: '▸'; position: absolute; left: 0; color: #aaa; font-size: 6.5pt; top: 0.1em; }
    p { font-size: 8pt; color: #555; line-height: 1.6; }

    /* Remove browser print margin headers (date/time/title/URL) by
       collapsing the margin zone. Content padding is applied via body. */
    @page {
      margin: 0;
      size: A4;
    }
    body { padding: 0.55in 0.5in; }

    /* Hide the tip banner when actually printing */
    @media print {
      .print-tip { display: none !important; }
    }
  `;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow pop-ups for this site to download your resume as PDF.');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <!-- Empty title = no name shown in browser print header -->
  <title> </title>
  <style>${printCSS}</style>
</head>
<body class="tpl-${tpl}">

  <!-- One-line tip shown on screen only, hidden during print -->
  <div class="print-tip" style="
    font-family:Inter,sans-serif; font-size:12px; color:#333;
    background:#fffbe6; border:1px solid #f0c040;
    padding:10px 16px; margin-bottom:12px; border-radius:6px;
    display:flex; align-items:center; justify-content:space-between; gap:12px;
  ">
    <span>⚙️ <strong>To remove the date &amp; page number:</strong>
      In the print dialog → click <em>More settings</em> → uncheck <strong>Headers and footers</strong>.
    </span>
    <button onclick="this.parentElement.remove()" style="
      background:none; border:1px solid #ccc; border-radius:4px;
      cursor:pointer; padding:2px 8px; font-size:12px;
    ">✕ Dismiss</button>
  </div>

  ${resumeHTML}
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
      // Fallback close after 3s if onafterprint not fired
      setTimeout(function() { window.close(); }, 3000);
    };
  <\/script>
</body>
</html>`);

  win.document.close();
}
