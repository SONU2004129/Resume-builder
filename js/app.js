/**
 * app.js – ResumeForge
 * Main application controller.
 * Wires up all DOM interactions → ResumeData → preview updates.
 * Modular, no framework, no duplicate logic.
 */

/* ============================================================
   INITIALISE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Always start fresh — no localStorage restore
  populateForm();
  bindPersonalFields();
  bindTextareas();
  bindTemplateSwitcher();
  bindGeneratorButtons();
  bindSkills();
  bindDynamicSection('educationList',     'addEducationBtn',     buildEducationEntry,     'education');
  bindDynamicSection('projectsList',      'addProjectBtn',       buildProjectEntry,       'projects');
  bindDynamicSection('experienceList',    'addExperienceBtn',    buildExperienceEntry,    'experience');
  bindDynamicSection('certificationsList','addCertBtn',          buildCertEntry,          'certifications');
  bindDynamicSection('achievementsList',  'addAchievementBtn',   buildAchievementEntry,   'achievements');
  bindDynamicSection('languagesList',     'addLanguageBtn',      buildLanguageEntry,      'languages');
  bindActions();
  renderPreview();
});


/* ============================================================
   POPULATE FORM FROM SAVED DATA
   ============================================================ */
function populateForm() {
  // Personal fields
  const p = ResumeData.personal;
  setVal('fullName',  p.fullName);
  setVal('email',     p.email);
  setVal('phone',     p.phone);
  setVal('address',   p.address);
  setVal('linkedin',  p.linkedin);
  setVal('github',    p.github);
  setVal('portfolio', p.portfolio);
  setVal('summary',   ResumeData.summary);
  setVal('objective', ResumeData.objective);

  // Skills
  renderSkillTags();

  // Dynamic sections
  ResumeData.education.forEach((_, i)      => renderDynamicEntry('educationList',      buildEducationEntry,   i));
  ResumeData.projects.forEach((_, i)       => renderDynamicEntry('projectsList',       buildProjectEntry,     i));
  ResumeData.experience.forEach((_, i)     => renderDynamicEntry('experienceList',     buildExperienceEntry,  i));
  ResumeData.certifications.forEach((_, i) => renderDynamicEntry('certificationsList', buildCertEntry,        i));
  ResumeData.achievements.forEach((_, i)   => renderDynamicEntry('achievementsList',   buildAchievementEntry, i));
  ResumeData.languages.forEach((_, i)      => renderDynamicEntry('languagesList',      buildLanguageEntry,    i));

  // Template
  setActiveTemplate(ResumeData.template);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}


/* ============================================================
   PERSONAL FIELDS
   ============================================================ */
function bindPersonalFields() {
  const fields = ['fullName','email','phone','address','linkedin','github','portfolio'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      ResumeData.personal[id] = el.value.trim();
      schedulePreviewUpdate();
    });
  });
}


/* ============================================================
   TEXTAREAS (Summary / Objective)
   ============================================================ */
function bindTextareas() {
  bindTextarea('summary',   v => { ResumeData.summary   = v; });
  bindTextarea('objective', v => { ResumeData.objective = v; });
}

function bindTextarea(id, setter) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    setter(el.value);
    saveData();
    schedulePreviewUpdate();
  });
}


/* ============================================================
   TEMPLATE SWITCHER
   ============================================================ */
function bindTemplateSwitcher() {
  document.querySelectorAll('.tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tpl = btn.dataset.tpl;
      ResumeData.template = tpl;
      setActiveTemplate(tpl);
      schedulePreviewUpdate();
    });
  });
}

function setActiveTemplate(tpl) {
  document.querySelectorAll('.tpl-btn').forEach(btn => {
    const isActive = btn.dataset.tpl === tpl;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
}


/* ============================================================
   GENERATOR BUTTONS
   ============================================================ */
function bindGeneratorButtons() {
  document.getElementById('genSummaryBtn').addEventListener('click', () => {
    const text = generateSummary();
    const el = document.getElementById('summary');
    el.value = text;
    ResumeData.summary = text;
    schedulePreviewUpdate();
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 600);
  });

  document.getElementById('genObjectiveBtn').addEventListener('click', () => {
    const text = generateObjective();
    const el = document.getElementById('objective');
    el.value = text;
    ResumeData.objective = text;
    schedulePreviewUpdate();
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 600);
  });
}


/* ============================================================
   SKILLS
   ============================================================ */
function bindSkills() {
  const input = document.getElementById('skillInput');
  const addBtn = document.getElementById('addSkillBtn');

  const addSkill = () => {
    const raw = input.value.trim();
    if (!raw) return;
    // Support comma-separated batch entry
    raw.split(',').forEach(s => {
      const skill = s.trim();
      if (skill && !ResumeData.skills.includes(skill)) {
        ResumeData.skills.push(skill);
      }
    });
    input.value = '';
    renderSkillTags();
    schedulePreviewUpdate();
  };

  addBtn.addEventListener('click', addSkill);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  });
}

function renderSkillTags() {
  const container = document.getElementById('skillTagsContainer');
  container.innerHTML = ResumeData.skills.map((skill, i) => `
    <span class="skill-tag" role="listitem">
      ${escHtml(skill)}
      <button type="button" aria-label="Remove ${escHtml(skill)}" data-index="${i}">×</button>
    </span>
  `).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      ResumeData.skills.splice(idx, 1);
      renderSkillTags();
      schedulePreviewUpdate();
    });
  });
}

/** Minimal HTML escape for form-side display (preview uses esc() from templates.js) */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


/* ============================================================
   DYNAMIC SECTIONS (Education / Projects / Experience / etc.)
   ============================================================ */

/**
 * Bind an "Add" button to append a new empty entry and render it.
 * @param {string} listId       - container element ID
 * @param {string} addBtnId     - add button element ID
 * @param {Function} buildFn    - function(index) => { element, dataObject }
 * @param {string} dataKey      - key in ResumeData (e.g. 'education')
 */
function bindDynamicSection(listId, addBtnId, buildFn, dataKey) {
  const btn = document.getElementById(addBtnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const emptyObj = buildFn.emptyObject();
    ResumeData[dataKey].push(emptyObj);
    const index = ResumeData[dataKey].length - 1;
    renderDynamicEntry(listId, buildFn, index);
    schedulePreviewUpdate();
  });
}

/**
 * Render a single dynamic entry block into its list container.
 */
function renderDynamicEntry(listId, buildFn, index) {
  const list = document.getElementById(listId);
  if (!list) return;

  const { element } = buildFn(index);
  list.appendChild(element);
}

/**
 * Factory: Create a remove button that splices from the data array
 * and re-renders all entries in the section.
 */
function makeRemoveBtn(listId, buildFn, dataKey, index) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'remove-btn';
  btn.textContent = '✕ Remove';
  btn.setAttribute('aria-label', `Remove entry ${index + 1}`);
  btn.addEventListener('click', () => {
    ResumeData[dataKey].splice(index, 1);
    reRenderList(listId, buildFn, dataKey);
    schedulePreviewUpdate();
  });
  return btn;
}

/** Re-render all entries in a dynamic list (after removal) */
function reRenderList(listId, buildFn, dataKey) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  ResumeData[dataKey].forEach((_, i) => renderDynamicEntry(listId, buildFn, i));
}

/**
 * Generic helper: create a labelled form group input inside an entry block.
 * @param {string} label
 * @param {string} type - input type or 'textarea'
 * @param {string} placeholder
 * @param {*} currentValue
 * @param {Function} onChange
 */
function createField(label, type, placeholder, currentValue, onChange) {
  const group = document.createElement('div');
  group.className = 'form-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 2;
  } else {
    input = document.createElement('input');
    input.type = type;
  }
  input.placeholder = placeholder;
  input.value = currentValue || '';
  input.addEventListener('input', () => {
    onChange(input.value);
    saveData();
    schedulePreviewUpdate();
  });

  group.appendChild(lbl);
  group.appendChild(input);
  return group;
}


/* ---- EDUCATION ---- */
buildEducationEntry.emptyObject = () => ({ degree:'', institution:'', cgpa:'', startYear:'', endYear:'' });

function buildEducationEntry(index) {
  const data = ResumeData.education;
  const obj  = data[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  const row1 = document.createElement('div');
  row1.className = 'entry-row';
  row1.appendChild(createField('Degree', 'text', 'e.g. B.Tech Computer Science', obj.degree,      v => obj.degree      = v));
  row1.appendChild(createField('Institution', 'text', 'University / College name', obj.institution, v => obj.institution = v));

  const row2 = document.createElement('div');
  row2.className = 'entry-row-3';
  row2.appendChild(createField('CGPA / %', 'text', 'e.g. 8.5 / 85%', obj.cgpa,       v => obj.cgpa      = v));
  row2.appendChild(createField('Start Year', 'text', '2020',          obj.startYear,  v => obj.startYear = v));
  row2.appendChild(createField('End Year',   'text', '2024 / Present',obj.endYear,    v => obj.endYear   = v));

  block.appendChild(makeRemoveBtn('educationList', buildEducationEntry, 'education', index));
  block.appendChild(row1);
  block.appendChild(row2);

  return { element: block };
}


/* ---- PROJECTS ---- */
buildProjectEntry.emptyObject = () => ({ name:'', description:'', tech:'' });

function buildProjectEntry(index) {
  const obj = ResumeData.projects[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  const row1 = document.createElement('div');
  row1.className = 'entry-row';
  row1.appendChild(createField('Project Name', 'text', 'e.g. E-commerce Platform', obj.name, v => obj.name = v));
  row1.appendChild(createField('Technologies', 'text', 'e.g. React, Node.js, MongoDB', obj.tech, v => obj.tech = v));

  const descGroup = document.createElement('div');
  descGroup.className = 'form-group';
  const descField = createField('Description', 'textarea', 'Brief project description...', obj.description, v => obj.description = v);

  block.appendChild(makeRemoveBtn('projectsList', buildProjectEntry, 'projects', index));
  block.appendChild(row1);
  block.appendChild(descField);

  return { element: block };
}


/* ---- EXPERIENCE ---- */
buildExperienceEntry.emptyObject = () => ({ title:'', company:'', startDate:'', endDate:'', description:'' });

function buildExperienceEntry(index) {
  const obj = ResumeData.experience[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  const row1 = document.createElement('div');
  row1.className = 'entry-row';
  row1.appendChild(createField('Job Title',   'text', 'e.g. Software Engineer', obj.title,   v => obj.title   = v));
  row1.appendChild(createField('Company',     'text', 'Company name',           obj.company, v => obj.company = v));

  const row2 = document.createElement('div');
  row2.className = 'entry-row';
  row2.appendChild(createField('Start Date', 'text', 'Jan 2022', obj.startDate, v => obj.startDate = v));
  row2.appendChild(createField('End Date',   'text', 'Present',  obj.endDate,   v => obj.endDate   = v));

  const descField = createField('Responsibilities / Description', 'textarea',
    'Describe your key responsibilities and achievements...', obj.description, v => obj.description = v);

  block.appendChild(makeRemoveBtn('experienceList', buildExperienceEntry, 'experience', index));
  block.appendChild(row1);
  block.appendChild(row2);
  block.appendChild(descField);

  return { element: block };
}


/* ---- CERTIFICATIONS ---- */
buildCertEntry.emptyObject = () => ({ name:'', issuer:'', year:'' });

function buildCertEntry(index) {
  const obj = ResumeData.certifications[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  const row = document.createElement('div');
  row.className = 'entry-row-3';
  row.appendChild(createField('Certification Name', 'text', 'e.g. AWS Solutions Architect', obj.name,   v => obj.name   = v));
  row.appendChild(createField('Issuing Organization', 'text', 'e.g. Amazon Web Services',  obj.issuer, v => obj.issuer = v));
  row.appendChild(createField('Year', 'text', '2023',                                       obj.year,   v => obj.year   = v));

  block.appendChild(makeRemoveBtn('certificationsList', buildCertEntry, 'certifications', index));
  block.appendChild(row);

  return { element: block };
}


/* ---- ACHIEVEMENTS ---- */
buildAchievementEntry.emptyObject = () => ({ title:'', description:'' });

function buildAchievementEntry(index) {
  const obj = ResumeData.achievements[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  block.appendChild(makeRemoveBtn('achievementsList', buildAchievementEntry, 'achievements', index));
  block.appendChild(createField('Achievement Title', 'text', 'e.g. 1st Place – National Hackathon', obj.title, v => obj.title = v));
  block.appendChild(createField('Description (optional)', 'textarea', 'More details...', obj.description, v => obj.description = v));

  return { element: block };
}


/* ---- LANGUAGES ---- */
buildLanguageEntry.emptyObject = () => ({ name:'', proficiency:'' });

function buildLanguageEntry(index) {
  const obj = ResumeData.languages[index];

  const block = document.createElement('div');
  block.className = 'entry-block';

  const row = document.createElement('div');
  row.className = 'entry-row';
  row.appendChild(createField('Language', 'text', 'e.g. English',          obj.name,        v => obj.name        = v));
  row.appendChild(createField('Proficiency', 'text', 'e.g. Native / C1',   obj.proficiency, v => obj.proficiency = v));

  block.appendChild(makeRemoveBtn('languagesList', buildLanguageEntry, 'languages', index));
  block.appendChild(row);

  return { element: block };
}


/* ============================================================
   ACTION BUTTONS (Download PDF / Clear All)
   ============================================================ */
function bindActions() {
  document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);

  document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (!confirm('Clear all resume data? This cannot be undone.')) return;
    // Reset in-memory state
    clearData();
    // Reset form UI
    document.querySelectorAll('.entry-block').forEach(el => el.remove());
    document.querySelectorAll('input, textarea').forEach(el => (el.value = ''));
    document.getElementById('skillTagsContainer').innerHTML = '';
    setActiveTemplate('classic');
    renderPreview();
  });
}
