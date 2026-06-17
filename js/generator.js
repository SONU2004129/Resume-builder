/**
 * generator.js – ResumeForge
 * Local template-based Professional Summary & Career Objective generator.
 * No external APIs. Produces varied, natural-sounding text from resume data.
 */

/* ---- Phrase banks ---- */
const SUMMARY_INTROS = [
  'Results-driven {role} with {exp} of hands-on experience in {skills}.',
  'Dedicated {role} who brings {exp} of professional experience working with {skills}.',
  'Motivated {role} with a strong foundation in {skills} and {exp} of practical experience.',
  'Innovative {role} specializing in {skills} with {exp} of industry experience.',
  'Detail-oriented {role} experienced in {skills}, with {exp} of demonstrated success.',
];

const SUMMARY_MIDDLES = [
  'Proven ability to deliver high-quality solutions and collaborate effectively with cross-functional teams.',
  'Track record of translating complex requirements into clean, maintainable, and scalable solutions.',
  'Strong problem-solving skills paired with a passion for continuous learning and professional growth.',
  'Consistently delivers projects on time while maintaining a focus on code quality and best practices.',
  'Recognized for analytical thinking, attention to detail, and an ability to work in fast-paced environments.',
];

const SUMMARY_ENDS = [
  'Eager to contribute technical expertise and drive meaningful impact in a forward-thinking organization.',
  'Seeking to leverage technical skills to create innovative solutions and contribute to team success.',
  'Committed to building efficient, user-centric solutions that align with business objectives.',
  'Looking to bring a growth mindset and solid technical background to challenging new roles.',
  'Passionate about technology and continuously expanding knowledge in emerging industry trends.',
];

const OBJECTIVE_TEMPLATES = [
  'To obtain a {role} position at a dynamic organization where I can apply my expertise in {skills} and {edu} background to contribute meaningfully to team goals and grow professionally.',
  'Seeking a challenging {role} role that allows me to leverage my {edu} education and hands-on experience in {skills} to deliver impactful results.',
  'To secure a {role} position that utilizes my {edu} degree and proficiency in {skills}, while offering opportunities for career advancement and continuous learning.',
  'Aspiring to join a progressive team as a {role}, where my knowledge of {skills} and {edu} foundation can drive innovation and add measurable value.',
];

/* ---- Helper utilities ---- */

/** Randomly pick one item from an array */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Infer a role/title from experience or education data */
function inferRole() {
  const exp = ResumeData.experience;
  if (exp.length > 0 && exp[0].title) return exp[0].title;

  const edu = ResumeData.education;
  if (edu.length > 0 && edu[0].degree) {
    const deg = edu[0].degree.toLowerCase();
    if (deg.includes('computer') || deg.includes('software') || deg.includes('cs')) return 'Software Engineer';
    if (deg.includes('data') || deg.includes('analytics')) return 'Data Analyst';
    if (deg.includes('business') || deg.includes('mba')) return 'Business Professional';
    if (deg.includes('electrical') || deg.includes('ece')) return 'Electrical Engineer';
    if (deg.includes('mechanical')) return 'Mechanical Engineer';
    if (deg.includes('design')) return 'Designer';
  }

  return 'Professional';
}

/** Get top N skills as a readable string */
function topSkills(n = 4) {
  const s = ResumeData.skills.slice(0, n);
  if (s.length === 0) return 'various technologies';
  if (s.length === 1) return s[0];
  return s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1];
}

/** Estimate years of experience from experience entries */
function yearsOfExp() {
  const exp = ResumeData.experience;
  if (exp.length === 0) return null;

  let totalMonths = 0;
  exp.forEach(e => {
    const start = parseYearMonth(e.startDate);
    const end = e.endDate && e.endDate.toLowerCase() !== 'present' ? parseYearMonth(e.endDate) : new Date();
    if (start && end) totalMonths += monthDiff(start, end);
  });

  const years = Math.round(totalMonths / 12);
  if (years <= 0) return 'under 1 year';
  if (years === 1) return '1 year';
  return `${years}+ years`;
}

/** Parse a "YYYY-MM" or "YYYY" string into a Date */
function parseYearMonth(str) {
  if (!str) return null;
  const parts = str.split('-');
  return new Date(parseInt(parts[0]), parts[1] ? parseInt(parts[1]) - 1 : 0);
}

function monthDiff(a, b) {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

/** Short education label */
function eduLabel() {
  const edu = ResumeData.education;
  if (edu.length === 0) return 'academic';
  const first = edu[0];
  if (first.degree) {
    const d = first.degree;
    // Abbreviate common degrees
    if (/b\.?tech|bachelor.*tech/i.test(d)) return 'B.Tech';
    if (/m\.?tech|master.*tech/i.test(d)) return 'M.Tech';
    if (/b\.?e\.?|bachelor.*eng/i.test(d)) return 'B.E.';
    if (/b\.?sc/i.test(d)) return 'B.Sc.';
    if (/m\.?sc/i.test(d)) return 'M.Sc.';
    if (/mba/i.test(d)) return 'MBA';
    if (/phd|ph\.d/i.test(d)) return 'Ph.D.';
    return d.split(' ').slice(0, 3).join(' ');
  }
  return 'academic';
}

/** Fill template placeholders */
function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] || '');
}

/* ---- Public API ---- */

/**
 * generateSummary() – Build a 3-sentence professional summary
 * entirely from resume data, no API required.
 */
function generateSummary() {
  const role = inferRole();
  const exp = yearsOfExp();
  const skills = topSkills(4);

  const expStr = exp || 'several years';

  const intro = fillTemplate(pick(SUMMARY_INTROS), { role, exp: expStr, skills });
  const middle = pick(SUMMARY_MIDDLES);
  const end = pick(SUMMARY_ENDS);

  // Add project flavoring if available
  let bonus = '';
  if (ResumeData.projects.length > 0) {
    const proj = ResumeData.projects[0];
    const tech = proj.tech ? ` using ${proj.tech}` : '';
    bonus = ` Notable work includes "${proj.name}"${tech}.`;
  }

  return `${intro} ${middle}${bonus} ${end}`;
}

/**
 * generateObjective() – Build a concise career objective sentence.
 */
function generateObjective() {
  const role = inferRole();
  const skills = topSkills(3);
  const edu = eduLabel();

  return fillTemplate(pick(OBJECTIVE_TEMPLATES), { role, skills, edu });
}
