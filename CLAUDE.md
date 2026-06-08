# Claude Code Briefing — Mark Hashimoto Portfolio Site

This file is read automatically by Claude Code at the start of every session.
Read it in full before taking any action. Confirm your understanding of the
architecture constraints before beginning any task.

---

## 1. Project context

This is a portfolio site for Mark Hashimoto, a creative technologist working
in generative visuals, LED systems, real-time graphics, and interactive
installation. The site replaces an existing WordPress site at markhashimoto.org
and presents professional commissions alongside personal generative practice.

- **Live URL:** markhashimotoportfolio.netlify.app
- **GitHub repo:** github.com/mkhash3d/portfolio
- **Local project folder:** `C:\Users\mkhas\Documents\Astro\portfolio`

### Stack

| Tool | Version | Role |
|------|---------|------|
| Astro | 6.3.1 | Static site generator |
| Tina CMS | 2.2.6 | Headless CMS, browser editor at /admin/index.html |
| Netlify | — | Static hosting, auto-deploys on GitHub push |
| Tina Cloud | — | Authenticates live /admin editor, indexes repo |
| Node | 22.x | Required by Astro 6. Managed via nvm-windows |
| OS | Windows 11 | PowerShell. Always run `nvm use 22` at session start |

### Starting the dev environment

The project root contains `dev.bat`. Running it starts both servers:

```
npx tinacms dev -c "astro dev"
```

Local URLs:
- `localhost:4321` — Astro site preview
- `localhost:4321/admin/index.html` — Tina CMS editor

---

## 2. Architecture decisions

### Netlify build command

The Netlify build command is `astro build` only — **not** `tinacms build && astro build`.

This is intentional. The `tinacms build` step was removed because it exceeds
Netlify's free tier memory limit (2GB JavaScript heap). Tina Cloud handles
content indexing separately. The pre-built Tina admin bundle in `public/admin/`
is committed directly to GitHub and served statically.

> **CRITICAL:** Never change the Netlify build command back to
> `tinacms build && astro build`. It will crash with a JavaScript heap out of
> memory error. If `tina/config.ts` changes, run `npx tinacms build` locally
> and commit the updated `public/admin/` folder manually.

### Content ownership

All content is stored as markdown files in the GitHub repo. Tina CMS is the
editor interface only — it writes to and reads from the markdown files. Content
is not stored in any external database or Tina Cloud storage.

### Three collections

Content is split into three Tina collections:

- **projects** — professional commissions, personal generative series,
  installations. URL pattern: `/work/[slug]`
- **writing** — technical articles and research notes. Separate from projects
  so technical writing does not visually dilute portfolio work. URL pattern:
  `/writing/[slug]`
- **visuals** — standalone generative renders and artworks that do not
  correspond to a project case study. Displayed at `/visuals` grouped by
  series. No individual pages — lightbox only.

### Schema sync requirement

Two separate config files both describe the content shape and must stay in sync:

- `tina/config.ts` — defines the Tina CMS editor fields
- `src/content/config.ts` — defines Astro's Zod schema for type-safe frontmatter

If a field exists in one but not the other, TypeScript throws build errors.

### Node version constraint

Astro 6 requires Node >= 22.12.0. Tina CMS 2.2.6 has peer dependency warnings
on Node 22. These warnings are cosmetic — the tool runs correctly. Do not
downgrade Node. Do not attempt to resolve the peer dependency warnings.

### Featured field

Homepage displays only projects where `featured: true`.
Work index (`/work`) displays all projects grouped by year.
Featured toggle is set in the Tina editor and stored in markdown frontmatter.
Keep featured projects to 4–6 maximum.

---

## 3. Content schema

### projects collection

| Field | Tina type | Notes |
|-------|-----------|-------|
| `title` | string | `isTitle: true`, `required: true` |
| `description` | string | `ui: { component: 'textarea' }` |
| `coverImage` | image | Grid thumbnail and project page hero |
| `tools` | string | `list: true` — array of specific tools |
| `medium` | string | options: installation, generative, interactive, video, performance, research |
| `type` | string | options: personal, commission, collaboration, research |
| `date` | datetime | Used for chronological sort and year grouping |
| `featured` | boolean | `default: false`. Controls homepage grid |
| `body` | rich-text | `isBody: true`. Main project content |

### writing collection

| Field | Tina type | Notes |
|-------|-----------|-------|
| `title` | string | `isTitle: true`, `required: true` |
| `description` | string | `ui: { component: 'textarea' }` |
| `date` | datetime | Publication date |
| `type` | string | options: research, tutorial, process, notes |
| `coverImage` | image | Optional |
| `body` | rich-text | `isBody: true` |

### visuals collection

Standalone generative renders and artworks. No individual pages — displayed
at `/visuals` in a grid grouped by series, with a lightbox for enlarged view.

| Field | Tina type | Notes |
|-------|-----------|-------|
| `title` | string | `isTitle: true`, `required: true` |
| `image` | image | Required. The artwork itself. |
| `series` | string | Group name e.g. Physarum, Trails, AlphaCarve. Drives page grouping. |
| `date` | datetime | Optional. Used for sorting within a series. |
| `tools` | string | `list: true`. Optional. |
| `notes` | string | `ui: { component: 'textarea' }`. Optional short description. |

---

## 4. File structure

```
portfolio/
├── public/
│   ├── admin/                ← Tina CMS admin bundle (pre-built, committed to git)
│   └── images/               ← Uploaded media
├── src/
│   ├── components/
│   │   ├── ProjectCard.astro  ← Single project thumbnail card
│   │   ├── ProjectGrid.astro  ← Grid of ProjectCard components
│   │   ├── Nav.astro
│   │   └── Footer.astro
│   ├── content/
│   │   ├── config.ts         ← Astro Zod schemas (must match tina/config.ts)
│   │   ├── projects/         ← One .md file per project (Tina managed)
│   │   ├── writing/          ← One .md file per article (Tina managed)
│   │   └── visuals/          ← One .md file per artwork (Tina managed)
│   ├── layouts/
│   │   ├── BaseLayout.astro  ← HTML head, meta tags, global CSS, nav, footer
│   │   └── ProjectLayout.astro ← Layout for individual project pages
│   ├── pages/
│   │   ├── index.astro       ← Homepage — featured projects grid
│   │   ├── work/
│   │   │   ├── index.astro   ← Full project index, grouped by year
│   │   │   └── [slug].astro  ← Dynamic project page
│   │   ├── visuals.astro     ← Visuals page, grouped by series, lightbox
│   │   ├── about.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
├── tina/
│   └── config.ts             ← Tina CMS schema (editor definition)
├── astro.config.ts
├── netlify.toml
├── .nvmrc                    ← Contains "22"
├── .env                      ← NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN
└── dev.bat                   ← Double-click to start dev environment
```

---

## 5. Section A — Schema and structure

Complete these four tasks in order. Do not proceed to Section B until all four
are done and confirmed working.

### A1 — Update tina/config.ts

Open `tina/config.ts`. Replace the entire `collections` array with the
following. Do not change anything else in the file — branch, clientId, token,
build, and media sections stay exactly as they are.

```typescript
collections: [
  {
    name: "projects",
    label: "Projects",
    path: "src/content/projects",
    format: "md",
    fields: [
      { type: "string", name: "title", label: "Title", isTitle: true, required: true },
      { type: "string", name: "description", label: "Description",
        ui: { component: "textarea" } },
      { type: "image", name: "coverImage", label: "Cover image" },
      { type: "string", name: "tools", label: "Tools used", list: true },
      { type: "string", name: "medium", label: "Medium",
        options: ["installation","generative","interactive",
                  "video","performance","research"] },
      { type: "string", name: "type", label: "Type",
        options: ["personal","commission","collaboration","research"] },
      { type: "datetime", name: "date", label: "Date" },
      { type: "boolean", name: "featured", label: "Featured on homepage" },
      { type: "rich-text", name: "body", label: "Body", isBody: true },
    ],
  },
  {
    name: "writing",
    label: "Writing",
    path: "src/content/writing",
    format: "md",
    fields: [
      { type: "string", name: "title", label: "Title", isTitle: true, required: true },
      { type: "string", name: "description", label: "Summary",
        ui: { component: "textarea" } },
      { type: "datetime", name: "date", label: "Date" },
      { type: "string", name: "type", label: "Type",
        options: ["research","tutorial","process","notes"] },
      { type: "image", name: "coverImage", label: "Cover image" },
      { type: "rich-text", name: "body", label: "Body", isBody: true },
    ],
  },
  {
    name: "visuals",
    label: "Visuals",
    path: "src/content/visuals",
    format: "md",
    fields: [
      { type: "string", name: "title", label: "Title", isTitle: true, required: true },
      { type: "image", name: "image", label: "Image", required: true },
      { type: "string", name: "series", label: "Series",
        description: "Group name e.g. Physarum, Trails, AlphaCarve" },
      { type: "datetime", name: "date", label: "Date" },
      { type: "string", name: "tools", label: "Tools", list: true },
      { type: "string", name: "notes", label: "Notes",
        ui: { component: "textarea" } },
    ],
  },
],
```

### A2 — Create src/content/config.ts

Create this file. Check first — if it already exists do not overwrite it,
update it instead.

```typescript
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    tools: z.array(z.string()).optional(),
    medium: z.string().optional(),
    type: z.string().optional(),
    date: z.coerce.date().optional(),
    featured: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    type: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

const visuals = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    image: z.string(),
    series: z.string().optional(),
    date: z.coerce.date().optional(),
    tools: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});

export const collections = { projects, writing, visuals };
```

> Note: `body` is not in the Zod schema. Astro handles the markdown body
> separately via `entry.render()` — it does not live in frontmatter.

### A3 — Create content directories

Create these directories if they do not exist. Astro throws a build error if a
collection path is missing.

```powershell
New-Item -ItemType Directory -Force -Path src\content\projects
New-Item -ItemType Directory -Force -Path src\content\writing
New-Item -ItemType Directory -Force -Path src\content\visuals
New-Item -ItemType File -Path src\content\projects\.gitkeep
New-Item -ItemType File -Path src\content\writing\.gitkeep
New-Item -ItemType File -Path src\content\visuals\.gitkeep
```

### A4 — Build Tina admin bundle and push

```powershell
npx tinacms build
git add .
git commit -m "update schema: projects and writing collections"
git push origin main
```

After the Netlify deploy completes, open the Tina editor at
`markhashimotoportfolio.netlify.app/admin/index.html` and confirm both
Projects and Writing collections appear in the left sidebar.

---

## 6. Section B — Page routing and layout files

Complete in order. Section A must be fully done first.

### B1 — Create src/components/ProjectCard.astro

```astro
---
const { project } = Astro.props;
---
<a href={`/work/${project.slug}`} class="project-card">
  {project.data.coverImage && (
    <img src={project.data.coverImage} alt={project.data.title} />
  )}
  <div class="card-body">
    <h3>{project.data.title}</h3>
    {project.data.description && <p>{project.data.description}</p>}
    {project.data.tools && (
      <ul class="tools">
        {project.data.tools.map(t => <li>{t}</li>)}
      </ul>
    )}
  </div>
</a>

<style>
  .project-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border: 0.5px solid var(--color-border, #333);
    border-radius: 8px;
    overflow: hidden;
    transition: opacity 0.15s;
  }
  .project-card:hover { opacity: 0.8; }
  .project-card img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
  .card-body { padding: 1rem; }
  .card-body h3 { margin: 0 0 0.5rem; font-size: 1rem; }
  .card-body p { margin: 0 0 0.75rem; font-size: 0.875rem; opacity: 0.7; }
  .tools { list-style: none; padding: 0; margin: 0; display: flex; gap: 6px; flex-wrap: wrap; }
  .tools li { font-size: 0.75rem; padding: 2px 8px; border: 0.5px solid currentColor;
    border-radius: 20px; opacity: 0.6; }
</style>
```

### B2 — Create src/components/ProjectGrid.astro

```astro
---
import ProjectCard from './ProjectCard.astro';
const { projects } = Astro.props;
---
<section class="project-grid">
  {projects.map(project => <ProjectCard project={project} />)}
</section>

<style>
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
</style>
```

### B3 — Create src/layouts/ProjectLayout.astro

Check if `BaseLayout.astro` exists in `src/layouts/`. If it does not exist,
create a minimal version first with `<html>`, `<head>`, `<body>`, and `<slot />`.

```astro
---
import BaseLayout from './BaseLayout.astro';
const { title, coverImage, date, tools, type } = Astro.props;
---
<BaseLayout title={title}>
  {coverImage && (
    <img class="cover" src={coverImage} alt={title} />
  )}
  <article class="project-article">
    <header class="project-header">
      <h1>{title}</h1>
      <div class="meta">
        {date && <time>{new Date(date).getFullYear()}</time>}
        {type && <span class="type">{type}</span>}
      </div>
      {tools && tools.length > 0 && (
        <ul class="tools">
          {tools.map(t => <li>{t}</li>)}
        </ul>
      )}
    </header>
    <div class="project-body">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .cover { width: 100%; max-height: 60vh; object-fit: cover; display: block; }
  .project-article { max-width: 860px; margin: 0 auto; padding: 2rem 1rem; }
  .project-header h1 { font-size: 2rem; margin: 0 0 0.75rem; }
  .meta { display: flex; gap: 1rem; font-size: 0.875rem; opacity: 0.6; margin-bottom: 1rem; }
  .tools { list-style: none; padding: 0; margin: 0 0 2rem; display: flex; gap: 8px; flex-wrap: wrap; }
  .tools li { font-size: 0.8rem; padding: 3px 10px; border: 0.5px solid currentColor;
    border-radius: 20px; opacity: 0.7; }
  .project-body { line-height: 1.7; }
  .project-body img { max-width: 100%; border-radius: 4px; margin: 1.5rem 0; }
</style>
```

### B4 — Create src/pages/work/[slug].astro

First create the `work/` directory inside `src/pages/` if it does not exist.

```astro
---
import { getCollection } from 'astro:content';
import ProjectLayout from '../../layouts/ProjectLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(project => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---

<ProjectLayout
  title={project.data.title}
  coverImage={project.data.coverImage}
  date={project.data.date}
  tools={project.data.tools}
  type={project.data.type}
>
  <Content />
</ProjectLayout>
```

### B5 — Create src/pages/work/index.astro

Projects are grouped by year descending. The year jump nav only renders when
content spans more than one year. Projects without a date are grouped under
"Undated" at the end.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const allProjects = await getCollection('projects');

const sorted = allProjects.sort(
  (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0)
);

const byYear = sorted.reduce((acc, project) => {
  const year = project.data.date
    ? new Date(project.data.date).getFullYear()
    : 'Undated';
  if (!acc[year]) acc[year] = [];
  acc[year].push(project);
  return acc;
}, {} as Record<string | number, typeof sorted>);

const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
---

<BaseLayout title="Work — Mark Hashimoto">
  <main class="work-index">
    <header class="work-header">
      <h1>Work</h1>
      <p class="work-subtitle">Commissions, collaborations, and personal practice.</p>
      {years.length > 1 && (
        <nav class="year-nav" aria-label="Jump to year">
          {years.map(year => (
            <a href={`#year-${year}`}>{year}</a>
          ))}
        </nav>
      )}
    </header>

    {years.map(year => (
      <section class="year-section" id={`year-${year}`}>
        <div class="year-label">
          <span>{year}</span>
        </div>
        <div class="project-grid">
          {byYear[year].map(project => (
            <ProjectCard project={project} />
          ))}
        </div>
      </section>
    ))}
  </main>
</BaseLayout>

<style>
  .work-index { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
  .work-header { margin-bottom: 4rem; }
  .work-header h1 { font-size: 2.5rem; font-weight: 600; margin: 0 0 0.5rem; }
  .work-subtitle { font-size: 1rem; opacity: 0.55; margin: 0 0 1.5rem; }
  .year-nav { display: flex; gap: 1rem; flex-wrap: wrap; }
  .year-nav a { font-size: 0.875rem; text-decoration: none; opacity: 0.5;
    border-bottom: 1px solid currentColor; padding-bottom: 1px; transition: opacity 0.15s; }
  .year-nav a:hover { opacity: 1; }
  .year-section { margin-bottom: 5rem; }
  .year-label { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
  .year-label span { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; opacity: 0.4; white-space: nowrap; }
  .year-label::after { content: ''; flex: 1; height: 0.5px;
    background: currentColor; opacity: 0.15; }
  .project-grid { display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  @media (max-width: 640px) {
    .work-index { padding: 2rem 1rem; }
    .work-header h1 { font-size: 1.75rem; }
    .project-grid { grid-template-columns: 1fr; }
    .year-section { margin-bottom: 3rem; }
  }
</style>
```

### B6 — Update src/pages/index.astro

Replace the current contents of the homepage file entirely.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectGrid from '../components/ProjectGrid.astro';

const allProjects = await getCollection('projects');
const featured = allProjects
  .filter(p => p.data.featured === true)
  .sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
---

<BaseLayout title="Mark Hashimoto — Creative Technologist">
  <main class="home">
    <section class="hero">
      <h1>Mark Hashimoto</h1>
      <p>Generative systems, real-time graphics, LED architecture</p>
    </section>
    <section class="featured">
      <ProjectGrid projects={featured} />
    </section>
  </main>
</BaseLayout>

<style>
  .home { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
  .hero { margin-bottom: 3rem; }
  .hero h1 { font-size: 2.5rem; margin: 0 0 0.5rem; }
  .hero p { font-size: 1rem; opacity: 0.6; margin: 0; }
</style>
```

### B7 — Create about.astro and contact.astro

These are placeholder pages. Content will be added via Tina later.

`src/pages/about.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About — Mark Hashimoto">
  <main style="max-width:860px;margin:0 auto;padding:2rem 1rem;">
    <h1>About</h1>
    <p>Content coming soon.</p>
  </main>
</BaseLayout>
```

`src/pages/contact.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Contact — Mark Hashimoto">
  <main style="max-width:860px;margin:0 auto;padding:2rem 1rem;">
    <h1>Contact</h1>
    <p>Content coming soon.</p>
  </main>
</BaseLayout>
```

---

## 7. Section C — Visuals page

Section C adds the visuals collection page. Complete after Section B is
validated and working.

### C1 — Create src/pages/visuals.astro

Artworks are grouped by series. Within each series they are sorted by date.
A series with no name falls under "Other". GLightbox handles the enlarged
image view client-side — no individual artwork pages are generated.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const allVisuals = await getCollection('visuals');

// Sort by date descending within each series
const sorted = allVisuals.sort(
  (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0)
);

// Group by series
const bySeries = sorted.reduce((acc, item) => {
  const series = item.data.series ?? 'Other';
  if (!acc[series]) acc[series] = [];
  acc[series].push(item);
  return acc;
}, {} as Record<string, typeof sorted>);

// Series names sorted alphabetically, Other always last
const seriesNames = Object.keys(bySeries).sort((a, b) => {
  if (a === 'Other') return 1;
  if (b === 'Other') return -1;
  return a.localeCompare(b);
});
---

<BaseLayout title="Visuals — Mark Hashimoto">
  <main class="visuals-index">
    <header class="visuals-header">
      <h1>Visuals</h1>
      <p class="visuals-subtitle">Generative renders and standalone artworks.</p>

      {seriesNames.length > 1 && (
        <nav class="series-nav" aria-label="Jump to series">
          {seriesNames.map(name => (
            <a href={`#series-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {name}
            </a>
          ))}
        </nav>
      )}
    </header>

    {seriesNames.map(name => (
      <section
        class="series-section"
        id={`series-${name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div class="series-label">
          <span>{name}</span>
        </div>
        <div class="visuals-grid">
          {bySeries[name].map(item => (
            <a
              href={item.data.image}
              class="glightbox visual-item"
              data-title={item.data.title}
              data-description={item.data.notes ?? ''}
            >
              <img src={item.data.image} alt={item.data.title} loading="lazy" />
            </a>
          ))}
        </div>
      </section>
    ))}
  </main>
</BaseLayout>

<!-- GLightbox — vanilla JS lightbox, no framework dependency -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
<script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js" is:inline></script>
<script is:inline>
  document.addEventListener('DOMContentLoaded', () => {
    GLightbox({ selector: '.glightbox' });
  });
</script>

<style>
  /* ── Page layout ── */
  .visuals-index {
    max-width: 1400px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }

  /* ── Header ── */
  .visuals-header {
    margin-bottom: 4rem;
  }

  .visuals-header h1 {
    font-size: 2.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .visuals-subtitle {
    font-size: 1rem;
    opacity: 0.55;
    margin: 0 0 1.5rem;
  }

  /* ── Series jump nav ── */
  .series-nav {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .series-nav a {
    font-size: 0.875rem;
    text-decoration: none;
    opacity: 0.5;
    border-bottom: 1px solid currentColor;
    padding-bottom: 1px;
    transition: opacity 0.15s;
  }

  .series-nav a:hover { opacity: 1; }

  /* ── Series section ── */
  .series-section {
    margin-bottom: 5rem;
  }

  .series-label {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .series-label span {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.4;
    white-space: nowrap;
  }

  .series-label::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: currentColor;
    opacity: 0.15;
  }

  /* ── Visuals grid ── */
  .visuals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
  }

  /* ── Individual visual item ── */
  .visual-item {
    display: block;
    overflow: hidden;
    border-radius: 4px;
    aspect-ratio: 1 / 1;
  }

  .visual-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease, opacity 0.2s;
  }

  .visual-item:hover img {
    transform: scale(1.03);
    opacity: 0.85;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .visuals-index { padding: 2rem 1rem; }
    .visuals-header h1 { font-size: 1.75rem; }
    .visuals-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
  }
</style>
```

> Note: GLightbox is loaded from CDN. It is vanilla JavaScript with no
> framework dependency and adds ~15KB to the page. It only activates on
> user interaction. No npm install required.

### C2 — Create src/content/visuals directory

```powershell
New-Item -ItemType Directory -Force -Path src\content\visuals
New-Item -ItemType File -Path src\content\visuals\.gitkeep
```

### C3 — Rebuild Tina admin bundle and push

```powershell
npx tinacms build
git add .
git commit -m "add visuals collection and page"
git push origin main
```

After deploy confirm:
- `localhost:4321/visuals` loads without error (empty grid is expected)
- Visuals collection appears in the Tina editor sidebar
- Creating a test visual entry with an image renders correctly on the page

---

## 8. Validation checklist

### Local — Sections A and B

- [ ] `localhost:4321` loads homepage without 404
- [ ] `localhost:4321/work` loads without error (empty grid is expected)
- [ ] `localhost:4321/about` and `/contact` load without error
- [ ] `localhost:4321/admin/index.html` loads Tina editor
- [ ] Projects, Writing, and Visuals collections appear in Tina sidebar
- [ ] Create a test project entry — confirm `.md` file appears in `src/content/projects/`
- [ ] `localhost:4321/work/[test-slug]` renders the test project page

### Local — Section C

- [ ] `localhost:4321/visuals` loads without error (empty grid is expected)
- [ ] Create a test visual entry with an image — confirm it appears on the page
- [ ] Clicking a visual opens the GLightbox overlay

### Deploy

- [ ] Push to GitHub and confirm Netlify build completes in under 30 seconds
- [ ] Live site at `markhashimotoportfolio.netlify.app` reflects changes
- [ ] Live `/admin/index.html` still loads and shows all three collections

---

## 9. Do not do any of the following

- Do not change the Netlify build command from `astro build`
- Do not attempt to resolve npm peer dependency warnings about React versions
- Do not downgrade Node from version 22
- Do not add schema fields beyond what is listed in Section 3
- Do not create a `/writing` index or `/writing/[slug]` page — not in this sprint
- Do not modify `tina/config.ts` outside of the `collections` array
- Do not overwrite `src/content/config.ts` if it already exists — update it
- Do not change Tina Cloud credentials or environment variable names
- Do not touch `src/pages/admin/index.astro` — this is the Tina editor interface,
  not a content page
- Do not generate individual pages for visuals entries — the lightbox handles
  enlarged view on the `/visuals` page, no `/visuals/[slug].astro` is needed

---

## 10. Current build status

Update this section as tasks are completed.

- [x] A1 — tina/config.ts updated with projects, writing, and visuals collections
- [x] A2 — src/content.config.ts created (Astro 6 glob loader format)
- [x] A3 — Content directories created (projects, writing, visuals)
- [x] A4 — Tina admin bundle rebuilt and pushed
- [x] B1 — ProjectCard.astro created
- [x] B2 — ProjectGrid.astro created
- [x] B3 — ProjectLayout.astro created
- [x] B4 — work/[slug].astro created
- [x] B5 — work/index.astro created (year-grouped version)
- [x] B6 — index.astro updated
- [x] B7 — about.astro and contact.astro created
- [x] C1 — visuals.astro created (series-grouped, GLightbox)
- [x] C2 — src/content/visuals directory created
- [x] C3 — Tina admin bundle rebuilt with visuals collection
