# ResumeForge 📄

**A lightweight, production-ready Resume Builder built for the Digital Heroes developer trial.**

> Built by **Aditya Kumar** | [adityakumar@example.com](mailto:adityakumar@example.com)
> ⚡ [Built for Digital Heroes](https://digitalheroesco.com)

---

## Features

| Feature | Details |
|---|---|
| **Personal Info** | Name, Email, Phone, Address, LinkedIn, GitHub, Portfolio |
| **Summary** | Write or auto-generate with local template engine |
| **Career Objective** | Optional field with auto-generation |
| **Education** | Multiple entries with degree, institution, CGPA, years |
| **Skills** | Dynamic add/remove tags, comma-separated batch entry |
| **Projects** | Name, description, technologies |
| **Experience** | Title, company, dates, description |
| **Certifications** | Name, issuer, year |
| **Achievements** | Title + description |
| **Languages** | Language + proficiency level |
| **3 Templates** | Classic (sidebar), Modern (accent), Minimal (clean) |
| **Live Preview** | Debounced real-time preview as you type |
| **PDF Export** | Browser print dialog – no libraries needed |
| **Persistence** | Auto-saves to localStorage |
| **Responsive** | Mobile-first, works on all screen sizes |

## Tech Stack

- **HTML5** – Semantic, accessible markup
- **CSS3** – CSS Variables, Grid, Flexbox, no frameworks
- **Vanilla JS** – Modular ES5-compatible, no build step

## Project Structure

```
resume-builder/
├── index.html          # App shell & semantic layout
├── vercel.json         # Deployment config + security headers
├── css/
│   └── styles.css      # Design system + all component styles
└── js/
    ├── data.js         # Central state store + localStorage
    ├── generator.js    # Local AI-free summary generator
    ├── templates.js    # 3 resume template renderers
    ├── preview.js      # Debounced live preview
    ├── export.js       # PDF via browser print
    └── app.js          # Main controller + DOM wiring
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and deploy in one click.

## Local Development

No build step needed. Just open `index.html` in your browser, or use a simple local server:

```bash
npx serve .
# or
python -m http.server 3000
```

---

*© 2024 Aditya Kumar – Digital Heroes Developer Trial*
