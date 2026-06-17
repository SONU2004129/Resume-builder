/**
 * templates.js – ResumeForge
 * Contains HTML-rendering functions for each resume template.
 * Each template receives the same ResumeData and returns HTML string.
 */

/* ============================================================
   SHARED HELPERS
   ============================================================ */

/** Escape user input to prevent XSS in preview */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format URL for display (strip https:// protocol) */
function displayUrl(url) {
  return esc(url).replace(/^https?:\/\/(www\.)?/, '');
}

/** Wrap a URL as a link (safe) */
function linkUrl(url, label) {
  if (!url) return '';
  const safe = esc(url);
  const text = label || displayUrl(url);
  return `<a href="${safe}" target="_blank" rel="noopener">${text}</a>`;
}

/** Build the contact bar items array */
function buildContactItems(p) {
  const items = [];
  if (p.email)     items.push(`✉ ${esc(p.email)}`);
  if (p.phone)     items.push(`📞 ${esc(p.phone)}`);
  if (p.address)   items.push(`📍 ${esc(p.address)}`);
  if (p.linkedin)  items.push(`in ${linkUrl(p.linkedin, displayUrl(p.linkedin))}`);
  if (p.github)    items.push(`⌥ ${linkUrl(p.github, displayUrl(p.github))}`);
  if (p.portfolio) items.push(`🌐 ${linkUrl(p.portfolio, displayUrl(p.portfolio))}`);
  return items;
}

/** Render a contact bar as a flex row */
function renderContactBar(p) {
  const items = buildContactItems(p);
  if (items.length === 0) return '';
  return `<div class="rv-contact-bar">${items.map(i => `<span>${i}</span>`).join('')}</div>`;
}

/** Render a section title */
function sectionTitle(label) {
  return `<div class="rv-section-title">${esc(label)}</div>`;
}

/** Render skill chips */
function renderSkills() {
  if (!ResumeData.skills.length) return '';
  const chips = ResumeData.skills.map(s => `<span class="rv-skill-chip">${esc(s)}</span>`).join('');
  return `<div class="rv-skill-list">${chips}</div>`;
}

/** Render education entries */
function renderEducation() {
  if (!ResumeData.education.length) return '';
  return ResumeData.education.map(e => `
    <div class="rv-entry">
      <div class="rv-entry-header">
        <div>
          <div class="rv-entry-title">${esc(e.degree)}</div>
          <div class="rv-entry-sub">${esc(e.institution)}</div>
        </div>
        <div class="rv-entry-date">${esc(e.startYear)}${e.endYear ? ' – ' + esc(e.endYear) : ''}</div>
      </div>
      ${e.cgpa ? `<div class="rv-entry-body">CGPA / Score: <strong>${esc(e.cgpa)}</strong></div>` : ''}
    </div>
  `).join('');
}

/** Render project entries */
function renderProjects() {
  if (!ResumeData.projects.length) return '';
  return ResumeData.projects.map(p => `
    <div class="rv-entry">
      <div class="rv-entry-title">${esc(p.name)}</div>
      ${p.tech ? `<div class="rv-entry-sub">Tech: ${esc(p.tech)}</div>` : ''}
      ${p.description ? `<div class="rv-entry-body">${esc(p.description)}</div>` : ''}
    </div>
  `).join('');
}

/** Render experience entries */
function renderExperience() {
  if (!ResumeData.experience.length) return '';
  return ResumeData.experience.map(e => `
    <div class="rv-entry">
      <div class="rv-entry-header">
        <div>
          <div class="rv-entry-title">${esc(e.title)}</div>
          <div class="rv-entry-sub">${esc(e.company)}</div>
        </div>
        <div class="rv-entry-date">${esc(e.startDate)}${e.endDate ? ' – ' + esc(e.endDate) : ''}</div>
      </div>
      ${e.description ? `<div class="rv-entry-body">${esc(e.description)}</div>` : ''}
    </div>
  `).join('');
}

/** Render certifications */
function renderCertifications() {
  if (!ResumeData.certifications.length) return '';
  return `<ul class="rv-ul">${ResumeData.certifications.map(c =>
    `<li><strong>${esc(c.name)}</strong>${c.issuer ? ' – ' + esc(c.issuer) : ''}${c.year ? ' (' + esc(c.year) + ')' : ''}</li>`
  ).join('')}</ul>`;
}

/** Render achievements */
function renderAchievements() {
  if (!ResumeData.achievements.length) return '';
  return `<ul class="rv-ul">${ResumeData.achievements.map(a =>
    `<li><strong>${esc(a.title)}</strong>${a.description ? ': ' + esc(a.description) : ''}</li>`
  ).join('')}</ul>`;
}

/** Render languages */
function renderLanguages() {
  if (!ResumeData.languages.length) return '';
  return `<ul class="rv-ul">${ResumeData.languages.map(l =>
    `<li>${esc(l.name)}${l.proficiency ? ' – ' + esc(l.proficiency) : ''}</li>`
  ).join('')}</ul>`;
}

/** Render a text block (summary / objective) */
function textBlock(text) {
  if (!text) return '';
  return `<p style="font-size:8.5pt;color:#555;line-height:1.6;">${esc(text)}</p>`;
}

/** Helper to conditionally wrap a section */
function section(title, content) {
  if (!content || content.trim() === '') return '';
  return `<div class="rv-section">${sectionTitle(title)}${content}</div>`;
}


/* ============================================================
   TEMPLATE: CLASSIC (sidebar layout)
   ============================================================ */
function renderClassic() {
  const p = ResumeData.personal;
  const name = p.fullName || 'Your Name';

  // Sidebar: Skills, Education, Languages, Certifications
  const sidebar = `
    <div class="rv-sidebar">
      ${section('Skills', renderSkills())}
      ${section('Education', renderEducation())}
      ${section('Languages', renderLanguages())}
      ${section('Certifications', renderCertifications())}
    </div>
  `;

  // Main: Summary, Objective, Experience, Projects, Achievements
  const mainContent = `
    <div class="rv-main">
      ${section('Professional Summary', textBlock(ResumeData.summary))}
      ${section('Career Objective', textBlock(ResumeData.objective))}
      ${section('Experience', renderExperience())}
      ${section('Projects', renderProjects())}
      ${section('Achievements', renderAchievements())}
    </div>
  `;

  return `
    <div class="rv-header">
      <div class="rv-name">${esc(name)}</div>
      ${renderContactBar(p)}
    </div>
    <div class="rv-body">
      ${sidebar}
      ${mainContent}
    </div>
  `;
}


/* ============================================================
   TEMPLATE: MODERN (full-width, accent line)
   ============================================================ */
function renderModern() {
  const p = ResumeData.personal;
  const name = p.fullName || 'Your Name';

  return `
    <div class="rv-header">
      <div>
        <div class="rv-name">${esc(name)}</div>
        ${renderContactBar(p)}
      </div>
    </div>
    <div class="rv-body">
      ${section('Professional Summary', textBlock(ResumeData.summary))}
      ${section('Career Objective', textBlock(ResumeData.objective))}
      ${section('Skills', renderSkills())}
      ${section('Experience', renderExperience())}
      ${section('Projects', renderProjects())}
      ${section('Education', renderEducation())}
      ${section('Certifications', renderCertifications())}
      ${section('Achievements', renderAchievements())}
      ${section('Languages', renderLanguages())}
    </div>
  `;
}


/* ============================================================
   TEMPLATE: MINIMAL (clean centered header)
   ============================================================ */
function renderMinimal() {
  const p = ResumeData.personal;
  const name = p.fullName || 'Your Name';

  return `
    <div class="rv-header">
      <div class="rv-name">${esc(name)}</div>
      ${renderContactBar(p)}
    </div>
    <div class="rv-body">
      ${section('Summary', textBlock(ResumeData.summary))}
      ${section('Objective', textBlock(ResumeData.objective))}
      ${section('Experience', renderExperience())}
      ${section('Education', renderEducation())}
      ${section('Skills', renderSkills())}
      ${section('Projects', renderProjects())}
      ${section('Certifications', renderCertifications())}
      ${section('Achievements', renderAchievements())}
      ${section('Languages', renderLanguages())}
    </div>
  `;
}


/* ============================================================
   DISPATCH – call the right renderer by template name
   ============================================================ */
function renderTemplate(templateName) {
  switch (templateName) {
    case 'modern':  return renderModern();
    case 'minimal': return renderMinimal();
    default:        return renderClassic();
  }
}
