/**
 * preview.js – ResumeForge
 * Manages live preview rendering. Debounced for performance.
 */

const previewEl = document.getElementById('resumePreview');

let _debounceTimer = null;

/**
 * Trigger a debounced preview refresh.
 * Updates at most once per 120ms to keep the UI snappy.
 */
function schedulePreviewUpdate() {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(renderPreview, 120);
}

/** Immediately render the current template into the preview pane. */
function renderPreview() {
  if (!previewEl) return;

  const tpl = ResumeData.template || 'classic';

  // Set template CSS class
  previewEl.className = `resume-preview tpl-${tpl}`;

  // Generate inner HTML from the active template
  const html = renderTemplate(tpl);
  previewEl.innerHTML = html;
}
