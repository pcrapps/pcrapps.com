/*
Creates GitHub labels, milestones, and issues for this project.

Usage (requires a GitHub Fine-grained PAT or classic PAT with repo scope):

  GITHUB_TOKEN=ghp_xxx GITHUB_OWNER=<owner> GITHUB_REPO=<repo> \
  node tools/create-github-issues.mjs

Notes:
- Idempotent: re-runs won’t duplicate labels/milestones; issues are keyed by title and won’t be duplicated in the same run.
- After creating all issues, the script updates bodies to include resolved dependency issue numbers.
*/

const token = process.env.GITHUB_TOKEN
let owner = process.env.GITHUB_OWNER
let repo = process.env.GITHUB_REPO

// Allow auto-detection in GitHub Actions via GITHUB_REPOSITORY
if ((!owner || !repo) && process.env.GITHUB_REPOSITORY) {
  const [o, r] = process.env.GITHUB_REPOSITORY.split('/')
  owner = owner || o
  repo = repo || r
}

if (!token || !owner || !repo) {
  console.error('Missing env vars. Required: GITHUB_TOKEN and GITHUB_OWNER/GITHUB_REPO or GITHUB_REPOSITORY')
  process.exit(1)
}

const apiBase = `https://api.github.com`

async function gh(path, options = {}) {
  const url = path.startsWith('http') ? path : `${apiBase}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${options.method || 'GET'} ${url} -> ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const labels = [
  { name: 'foundation', color: '0366d6' },
  { name: 'setup', color: '6f42c1' },
  { name: 'styling', color: '0e8a16' },
  { name: 'content', color: 'bfd4f2' },
  { name: 'ui', color: 'c2e0c6' },
  { name: 'pages', color: '5319e7' },
  { name: 'build', color: 'fbca04' },
  { name: 'qa', color: 'b60205' },
  { name: 'seo', color: '1d76db' },
  { name: 'analytics', color: '0052cc' },
  { name: 'comments', color: 'fef2c0' },
  { name: 'aws', color: 'ff9900' },
  { name: 'dns', color: '5319e7' },
  { name: 'ci', color: 'ededed', description: 'Continuous Integration' },
  { name: 'deployment', color: '0b69a3' },
  { name: 'performance', color: 'a2eeef' },
  { name: 'privacy', color: 'b4f1b4' },
  { name: 'docs', color: 'd4c5f9' },
  { name: 'security', color: 'e99695' },
]

const milestones = [
  { title: 'Foundation', description: 'Scaffold, config, typing, build/export' },
  { title: 'Content', description: 'MDX pipeline, indexes, posts/projects' },
  { title: 'UX', description: 'Header/Footer, components, a11y, dark mode' },
  { title: 'SEO', description: 'Metadata, JSON-LD, sitemap, RSS, robots' },
  { title: 'Deployment', description: 'CI/CD, AWS infra, domain' },
]

const issues = [
  // Foundation
  {
    title: 'Setup: Next.js App Router scaffold',
    milestone: 'Foundation',
    labels: ['foundation', 'setup'],
    acceptance: [
      'Repo uses App Router in `app/` with TypeScript',
      'Tailwind configured and dev server runs',
    ],
    dependsOn: [],
  },
  {
    title: 'Configure Tailwind + Typography',
    milestone: 'Foundation',
    labels: ['foundation', 'styling'],
    acceptance: [
      '`tailwind.config.ts` includes `@tailwindcss/typography`',
      '`globals.css` loaded; base typography styles applied',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },
  {
    title: 'Add Contentlayer & schema',
    milestone: 'Foundation',
    labels: ['foundation', 'content'],
    acceptance: [
      '`contentlayer.config.ts` defines Post with typed fields',
      'Build generates Contentlayer types without errors',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },
  {
    title: 'Shadcn/ui init',
    milestone: 'Foundation',
    labels: ['foundation', 'ui'],
    acceptance: [
      'shadcn initialized and base components generated',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },
  {
    title: 'Static export config',
    milestone: 'Foundation',
    labels: ['foundation', 'build'],
    acceptance: [
      '`next.config.ts` has `output: "export"` and `images.unoptimized: true`',
      '`pnpm build && pnpm export` generates `out/`',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },
  {
    title: 'Linting & formatting',
    milestone: 'Foundation',
    labels: ['foundation', 'qa'],
    acceptance: [
      'ESLint + Prettier configured; scripts run clean in CI',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },

  // Content
  {
    title: 'MDX components registry',
    milestone: 'Content',
    labels: ['content', 'ui'],
    acceptance: [
      '`MDXComponents.tsx` exports custom components (Callout, Code, etc.)',
      'MDX can import and render components',
    ],
    dependsOn: ['Add Contentlayer & schema'],
  },
  {
    title: 'Prose component',
    milestone: 'Content',
    labels: ['content', 'ui'],
    acceptance: [
      '`Prose` applies readable measure and typographic defaults',
    ],
    dependsOn: ['Configure Tailwind + Typography'],
  },
  {
    title: 'Writing index page',
    milestone: 'Content',
    labels: ['content', 'pages'],
    acceptance: [
      '`/writing` lists published posts; drafts excluded',
      'Tags and summaries visible; links resolve',
    ],
    dependsOn: ['Add Contentlayer & schema'],
  },
  {
    title: 'Post page renderer',
    milestone: 'Content',
    labels: ['content', 'pages'],
    acceptance: [
      '`/writing/[slug]` renders MDX with title, dates, tags, reading time',
      'MDX components render within `Prose`',
    ],
    dependsOn: ['Writing index page', 'MDX components registry'],
  },
  {
    title: 'Seed initial content',
    milestone: 'Content',
    labels: ['content'],
    acceptance: [
      'At least one post and one project with valid frontmatter',
      'Cover images added to `/public/images`',
    ],
    dependsOn: ['Post page renderer'],
  },
  {
    title: 'Base pages',
    milestone: 'Content',
    labels: ['pages'],
    acceptance: [
      'Implement `/about`, `/projects`, `/now`, `/uses`, `/contact`, `/resume`',
    ],
    dependsOn: ['Setup: Next.js App Router scaffold'],
  },

  // UX
  {
    title: 'SiteHeader & SiteFooter',
    milestone: 'UX',
    labels: ['ui'],
    acceptance: [
      'Responsive nav with focus-visible states and skip link',
    ],
    dependsOn: ['Configure Tailwind + Typography'],
  },
  {
    title: 'PostCard & Tag components',
    milestone: 'UX',
    labels: ['ui'],
    acceptance: [
      'Cards show title/summary; Tags are accessible and keyboard focusable',
    ],
    dependsOn: ['Configure Tailwind + Typography'],
  },
  {
    title: 'Typography & spacing scale',
    milestone: 'UX',
    labels: ['ui'],
    acceptance: [
      'Readable measure (~65ch), consistent spacing on mobile/desktop',
    ],
    dependsOn: ['Prose component'],
  },
  {
    title: 'Dark mode support',
    milestone: 'UX',
    labels: ['ui', 'accessibility'],
    acceptance: [
      'Tailwind `darkMode: media` with adequate contrast (WCAG AA)',
    ],
    dependsOn: ['Configure Tailwind + Typography'],
  },
  {
    title: 'Accessibility pass',
    milestone: 'UX',
    labels: ['qa', 'accessibility'],
    acceptance: [
      'Lighthouse Accessibility = 100 on `/` and a post',
    ],
    dependsOn: ['SiteHeader & SiteFooter', 'Post page renderer'],
  },

  // SEO
  {
    title: 'Global metadata',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      'Default title/description via App Router metadata export',
    ],
    dependsOn: ['Foundation'],
  },
  {
    title: 'JSON-LD: Home (Person)',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      'Valid Person schema injected on Home',
    ],
    dependsOn: ['Global metadata'],
  },
  {
    title: 'JSON-LD: BlogPosting',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      'Post pages output valid BlogPosting schema',
    ],
    dependsOn: ['Post page renderer', 'Global metadata'],
  },
  {
    title: 'robots.txt',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      '`robots.txt` present and exports in `out/`',
    ],
    dependsOn: ['Foundation'],
  },
  {
    title: 'Sitemap.xml',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      'Sitemap lists all public routes; validator passes',
    ],
    dependsOn: ['Base pages', 'Writing index page'],
  },
  {
    title: 'RSS feed',
    milestone: 'SEO',
    labels: ['seo'],
    acceptance: [
      '`feed.xml` includes latest posts; validates',
    ],
    dependsOn: ['Writing index page'],
  },

  // Analytics (grouped under SEO milestone)
  {
    title: 'Env-toggled analytics',
    milestone: 'SEO',
    labels: ['analytics', 'privacy'],
    acceptance: [
      'Provider `plausible|umami|none`; `none` injects no script',
      'Docs specify required env vars',
    ],
    dependsOn: ['Global metadata'],
  },
  {
    title: 'Docs: enable/disable analytics',
    milestone: 'SEO',
    labels: ['docs', 'analytics'],
    acceptance: [
      'README has clear steps to toggle analytics',
    ],
    dependsOn: ['Env-toggled analytics'],
  },
  {
    title: 'Optional Giscus comments',
    milestone: 'SEO',
    labels: ['comments', 'privacy'],
    acceptance: [
      'Comments render on posts when enabled via env',
    ],
    dependsOn: ['Post page renderer'],
  },

  // Deployment
  {
    title: 'GitHub Actions CI',
    milestone: 'Deployment',
    labels: ['ci', 'deployment'],
    acceptance: [
      'Builds on main: `next build && next export`',
    ],
    dependsOn: ['Static export config'],
  },
  {
    title: 'AWS OIDC role',
    milestone: 'Deployment',
    labels: ['aws', 'security'],
    acceptance: [
      'OIDC role configured; workflow assumes role successfully',
    ],
    dependsOn: ['GitHub Actions CI'],
  },
  {
    title: 'S3 + CloudFront (OAC)',
    milestone: 'Deployment',
    labels: ['aws', 'deployment'],
    acceptance: [
      'Private S3 with OAC origin, default root object is index.html',
    ],
    dependsOn: ['AWS OIDC role'],
  },
  {
    title: 'Route 53 + ACM',
    milestone: 'Deployment',
    labels: ['aws', 'dns'],
    acceptance: [
      'Valid cert in us-east-1; A/AAAA alias to CloudFront',
    ],
    dependsOn: ['S3 + CloudFront (OAC)'],
  },
  {
    title: 'CloudFront invalidation step',
    milestone: 'Deployment',
    labels: ['aws', 'ci'],
    acceptance: [
      'Workflow invalidates /* post-deploy',
    ],
    dependsOn: ['GitHub Actions CI'],
  },
  {
    title: 'Error pages',
    milestone: 'Deployment',
    labels: ['pages', 'deployment'],
    acceptance: [
      'Custom 404 page exported; CloudFront maps 404 -> /404.html',
    ],
    dependsOn: ['Base pages'],
  },

  // QA
  {
    title: 'TypeScript/ESLint/Prettier clean',
    milestone: 'Deployment',
    labels: ['qa'],
    acceptance: [
      'CI job runs lint/format/typecheck with no errors',
    ],
    dependsOn: ['Linting & formatting'],
  },
  {
    title: 'Link check',
    milestone: 'Deployment',
    labels: ['qa'],
    acceptance: [
      'Internal route checker passes in CI',
    ],
    dependsOn: ['Base pages'],
  },
  {
    title: 'Lighthouse thresholds',
    milestone: 'Deployment',
    labels: ['qa', 'performance'],
    acceptance: [
      'Perf ≥ 95, A11y 100, Best Practices ≥ 95, SEO ≥ 95',
    ],
    dependsOn: ['Accessibility pass', 'SEO'],
  },
]

async function ensureLabels() {
  const existing = await gh(`/repos/${owner}/${repo}/labels`)
  const existingNames = new Set(existing.map((l) => l.name.toLowerCase()))
  for (const l of labels) {
    if (!existingNames.has(l.name.toLowerCase())) {
      await gh(`/repos/${owner}/${repo}/labels`, {
        method: 'POST',
        body: JSON.stringify(l),
      })
    }
  }
}

async function ensureMilestones() {
  const existing = await gh(`/repos/${owner}/${repo}/milestones?state=all&per_page=100`)
  const map = new Map(existing.map((m) => [m.title, m.number]))
  const out = new Map()
  for (const m of milestones) {
    if (map.has(m.title)) {
      out.set(m.title, map.get(m.title))
    } else {
      const created = await gh(`/repos/${owner}/${repo}/milestones`, {
        method: 'POST',
        body: JSON.stringify({ title: m.title, description: m.description }),
      })
      out.set(m.title, created.number)
    }
  }
  return out
}

function buildBody(issue) {
  const lines = []
  lines.push('### Acceptance Criteria')
  for (const item of issue.acceptance) lines.push(`- ${item}`)
  if (issue.dependsOn && issue.dependsOn.length) {
    lines.push('\n### Depends on (titles)')
    for (const d of issue.dependsOn) lines.push(`- ${d}`)
  }
  return lines.join('\n')
}

async function createIssues(milestoneMap) {
  const createdMap = new Map() // title -> { number, url }
  for (const issue of issues) {
    const body = buildBody(issue)
    const msNumber = milestoneMap.get(issue.milestone)
    const payload = {
      title: issue.title,
      body,
      labels: issue.labels,
      milestone: msNumber,
    }
    const created = await gh(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    createdMap.set(issue.title, { number: created.number, url: created.html_url })
  }
  return createdMap
}

async function updateDependencies(createdMap) {
  for (const issue of issues) {
    if (!issue.dependsOn?.length) continue
    const cur = createdMap.get(issue.title)
    const depNums = issue.dependsOn
      .map((t) => createdMap.get(t)?.number)
      .filter(Boolean)
    if (!depNums.length) continue
    const dependsSection = ['\n### Depends on', ...depNums.map((n) => `- #${n}`)].join('\n')
    // Fetch current body
    const current = await gh(`/repos/${owner}/${repo}/issues/${cur.number}`)
    const newBody = `${current.body}\n${dependsSection}`
    await gh(`/repos/${owner}/${repo}/issues/${cur.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ body: newBody }),
    })
  }
}

async function main() {
  console.log('Ensuring labels…')
  await ensureLabels()
  console.log('Ensuring milestones…')
  const milestoneMap = await ensureMilestones()
  console.log('Creating issues…')
  const createdMap = await createIssues(milestoneMap)
  console.log('Linking dependencies…')
  await updateDependencies(createdMap)
  console.log('Done. Created/linked issues:')
  for (const [title, info] of createdMap) {
    console.log(`#${info.number} ${title} -> ${info.url}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
