/**
 * data.js – ResumeForge
 * Central state store (plain object). All modules read/write this.
 * No frameworks, no libraries.
 */

const ResumeData = {
  personal: {
    fullName: '', email: '', phone: '',
    address: '', linkedin: '', github: '', portfolio: ''
  },
  summary: '',
  objective: '',
  education: [],     // [{ degree, institution, cgpa, startYear, endYear }]
  skills: [],        // ['JavaScript', 'React', ...]
  projects: [],      // [{ name, description, tech }]
  experience: [],    // [{ title, company, startDate, endDate, description }]
  certifications: [],// [{ name, issuer, year }]
  achievements: [],  // [{ title, description }]
  languages: [],     // [{ name, proficiency }]
  template: 'classic'
};

/** Persist state to localStorage */
function saveData() {
  try {
    localStorage.setItem('resumeforge_data', JSON.stringify(ResumeData));
  } catch (_) { /* ignore storage errors */ }
}

/** Restore state from localStorage */
function loadData() {
  try {
    const raw = localStorage.getItem('resumeforge_data');
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(ResumeData, saved);
  } catch (_) { /* ignore parse errors */ }
}

/** Deep-reset all data */
function clearData() {
  ResumeData.personal = { fullName:'', email:'', phone:'', address:'', linkedin:'', github:'', portfolio:'' };
  ResumeData.summary = '';
  ResumeData.objective = '';
  ResumeData.education = [];
  ResumeData.skills = [];
  ResumeData.projects = [];
  ResumeData.experience = [];
  ResumeData.certifications = [];
  ResumeData.achievements = [];
  ResumeData.languages = [];
  ResumeData.template = 'classic';
  saveData();
}
