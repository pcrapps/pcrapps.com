# agents.md — PatrickCrapps.com (Next.js MDX Static Site)

> **Goal:** Ship a fast, low-maintenance personal site + blog (portfolio + writing) at **patrickcrapps.com**, hosted on AWS (S3 + CloudFront + Route 53), authored in **MDX**, built with **Next.js (App Router, TypeScript, Tailwind)** and exported statically. Keep costs near \$0, zero servers, great SEO, and a clean DX so content lives in Git.

---

## 0) Principles

* **Static-first**: pre-render everything and export to HTML/JS/CSS.
* **Content in Git**: MDX posts in `/content`. No DB.
* **Small, tasteful UI**: Tailwind + shadcn/ui components.
* **Privacy-aware**: Plausible/Umami analytics; no cookies by default.
* **Composability**: MDX lets us embed React components in posts.
* **Automated**: CI builds and deploys to S3 + CloudFront invalidation.
* **Findable**: sitemap, RSS, JSON‑LD, OG images.

---

## 1) Deliverables

* Static site repo with:

  * App Router Next.js + TS + Tailwind + shadcn/ui
  * MDX pipeline via **Contentlayer** (typed)
  * Pages: `/`, `/about`, `/writing`, `/writing/[slug]`, `/projects`, `/now`, `/uses`, `/contact`, `/resume`
  * Components: PostCard, Tag, Prose, Callout, Code, Gallery, ProjectCard
  * SEO: `<head>` metadata, `robots.txt`, `sitemap.xml`, `feed.xml` (RSS), per‑post OG image generator
  * Analytics (Plausible/Umami) wired behind env flag
  * **Giscus** comments (optional toggle)
  * **GitHub Actions** pipeline to deploy to S3 + CloudFront
  * AWS infra notes (S3 OAC, ACM cert, Route 53 records)

---

## 2) Tech Stack

* **Framework**: Next.js (App Router) + TypeScript
* **Styling**: Tailwind CSS + @tailwindcss/typography + shadcn/ui
* **Content**: MDX via Contentlayer (typed frontmatter)
* **Icons**: lucide-react
* **Analytics**: Plausible or Umami (one)
* **Comments**: Giscus (optional)
* **Hosting**: S3 (static) + CloudFront (OAC) + ACM + Route 53

---

## 3) Repository Layout

```
/app
  /(site)/layout.tsx
  /(site)/page.tsx               # Home
  /about/page.tsx
  /writing/page.tsx              # Index
  /writing/[slug]/page.tsx       # MDX post renderer
  /projects/page.tsx
  /now/page.tsx
  /uses/page.tsx
  /contact/page.tsx
  /resume/page.tsx
  /og/route.tsx                  # Dynamic OG image (optional)
/content
  /writing/hello-world.mdx
  /projects/tank-gauge.mdx
/components
  Prose.tsx
  PostCard.tsx
  Tag.tsx
  MDXComponents.tsx
  SiteHeader.tsx
  SiteFooter.tsx
/lib
  contentlayer.ts
  rss.ts
  seo.ts
  site.ts                        # site config (name, socials, analytics)
/public
  favicon.ico
  robots.txt
  site.webmanifest
/styles
  globals.css
next.config.ts
contentlayer.config.ts
postcss.config.js
prettier.config.js
sitemap.ts (optional)
tailwind.config.ts
```

---

## 4) Content Model (Frontmatter)

```md
---
title: "Building a farm data pipeline that doesn’t suck"
date: "2025-09-01"
updated: "2025-09-02"
summary: "Lessons wrangling sensors, WCF endpoints, and hog‑group pivots."
tags: ["dotnet", "sql", "data-eng"]
slug: "farm-data-pipeline"
canonical: "https://patrickcrapps.com/writing/farm-data-pipeline"
cover: "/images/pipeline.png"
status: "published" # or "draft"
---
```

**Contentlayer schema (concept):**

```ts
// contentlayer.config.ts (essentials)
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `writing/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    updated: { type: 'date', required: false },
    summary: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    slug: { type: 'string', required: false },
    canonical: { type: 'string', required: false },
    cover: { type: 'string', required: false },
    status: { type: 'string', required: false },
  },
  computedFields: {
    url: { type: 'string', resolve: (doc) => `/writing/${doc._raw.flattenedPath}` },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
```

---

## 5) Pages & UX Notes

* **Home**: short bio, latest 3 posts, 3 projects, CTA to About/Writing.
* **About**: values (craft, reliability, humane tech), quick timeline.
* **Writing**: tags, search filter, year groupings. Drafts excluded.
* **Post**: title, dates (published/updated), reading time, tags, OG image, related posts.
* **Projects**: cards w/ 90‑sec summaries + links to GitHub.
* **/now**: current focus; 1 paragraph, refreshed quarterly.
* **/uses**: hardware, editor, dotfiles, radio gear, 3D printing.
* **Contact**: mailto + socials; optional serverless form later.
* **Resume**: HTML page + downloadable PDF (static file in `/public`).

Accessibility: semantic headings, focus styles, skip links, `prefers-reduced-motion` support.

---

## 6) SEO & Social

* Global metadata via App Router `metadata` export.
* JSON‑LD: `Person` on Home; `BlogPosting` per post.
* `robots.txt`, `sitemap.xml`, `feed.xml` (RSS 2.0).
* Dynamic OG images using `@vercel/og` or a simple `/og` route.

JSON‑LD example (Home):

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Patrick Crapps",
  url: "https://patrickcrapps.com",
  sameAs: ["https://github.com/patrickcrapps"],
  jobTitle: "Software Engineer"
})}} />
```

---

## 7) Performance

* Export static (`output = 'export'`).
* Optimize images (static, pre-sized, modern formats where possible).
* Lazy-load heavy components inside MDX only when used.
* Keep JS lean on content pages (no hydration where not needed).

---

## 8) Security & Privacy

* No personally sensitive data.
* Analytics opt-out ready; only lightweight pageview.
* Strong CSP optional (later) via meta tags for static hosting.

---

## 9) Build & Export

**next.config.ts**

```ts
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
}
export default nextConfig
```

**Scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "start": "serve out"
  }
}
```

---

## 10) AWS Deploy (S3 + CloudFront + Route 53)

* **S3 bucket**: `patrickcrapps.com-site` (block public; use OAC).
* **CloudFront**: origin = S3; default root object `index.html`; gzip/brotli on; cache long TTL.
* **ACM** (us-east-1): cert for `patrickcrapps.com` (+ `www`).
* **Route 53**: A/AAAA alias → CloudFront distribution.
* **Error pages**: map 404 to `/404.html`.

**GitHub Actions** (OIDC to AWS, example):

```yaml
name: deploy
on: { push: { branches: [main] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build && npm run export
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/github-actions-deploy
          aws-region: us-east-1
      - name: Sync to S3
        run: aws s3 sync ./out s3://patrickcrapps.com-site --delete
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

---

## 11) Commands (Scaffold)

```bash
pnpm create next-app@latest patrickcrapps --ts --eslint --tailwind --app
cd patrickcrapps
pnpm add contentlayer next-contentlayer @tailwindcss/typography lucide-react
pnpm dlx shadcn-ui@latest init
# add: giscus, umami (optional)
```

`tailwind.config.ts` add `typography` plugin and `content` globs for `mdx`.

---

## 12) MDX Wiring

`/components/MDXComponents.tsx` registers custom components (Callout, Code, etc.)

Example callout:

```tsx
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4 text-sm">
      {children}
    </div>
  )
}
```

Use it in MDX:

```mdx
<Callout>Remember to enable OAC on CloudFront → S3.</Callout>
```

---

## 13) Analytics & Comments

* **Analytics**: Env flag `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible|umami|none`.
* **Giscus**: repository, category, mapping by pathname.

---

## 14) Quality Gates (QA)

**Pre-commit**

* TypeScript passes, no `any` leaks in public APIs.
* ESLint + Prettier.
* Broken link checker (simple build-time pass on internal routes).
* MDX lint: frontmatter has `title`, `date`, `summary` at minimum.
* Image alt text required.

**Pre-deploy**

* Build succeeds: `next build && next export`.
* Lighthouse check: perf ≥ 95 on `/`, `/writing/[slug]`.
* Valid `sitemap.xml` and `feed.xml` generated.

**Post-deploy**

* Verify HTTPS, HSTS, WWW redirect, 404 page.
* Analytics events flowing; no console errors.

---

## 15) Prompts (for Codex/Agents)

### 15.1 Planner Agent

**Instruction:**

> Read this agents.md. Produce an issue plan with milestones and labeled tickets. Group by: Foundation, Content, UX, SEO, Deployment. Include acceptance criteria for each ticket and link dependencies.

**Acceptance Criteria:**

* A GitHub Project with 5 columns and \~20–30 issues, each with DoD.

### 15.2 Scaffolder Agent

**Instruction:**

> Initialize a Next.js App Router project (TS + Tailwind), add Contentlayer and shadcn/ui, set `output: 'export'`, create repo layout exactly as in Section 3, commit with conventional commits.

**Check:**

* `pnpm build && pnpm export` generates `out/`.

### 15.3 Content Agent

**Instruction:**

> Create initial MDX posts and pages: one post, one project, About/Now/Uses, with authentic voice. Use frontmatter per Section 4. Add cover image placeholders in `/public/images`.

**Check:**

* `/writing` index lists the post; links resolve.

### 15.4 UI Agent

**Instruction:**

> Implement SiteHeader/SiteFooter, Prose, PostCard, Tag components; add responsive spacing, readable measure, dark mode, and accessible focus.

**Check:**

* Lighthouse Accessibility ≥ 100 on `/` and a post.

### 15.5 SEO Agent

**Instruction:**

> Implement metadata, JSON‑LD for Home and posts, sitemap, robots, and RSS feed per Sections 6 & 17.

**Check:**

* `sitemap.xml` lists all pages; `feed.xml` validates.

### 15.6 Analytics Agent

**Instruction:**

> Add optional Plausible/Umami snippet toggled by env; document how to enable/disable.

**Check:**

* Setting provider to `none` produces no analytics script.

### 15.7 AWS Deploy Agent

**Instruction:**

> Provision S3 (private), CloudFront (OAC), ACM cert (us‑east‑1), Route 53 DNS, and wire GitHub Actions per Section 10. Leave Terraform notes (optional later).

**Check:**

* Site reachable at `https://patrickcrapps.com/` with TLS, HTTP→HTTPS redirect via CloudFront behavior.

### 15.8 Reviewer Agent

**Instruction:**

> Run the QA in Section 14. Open issues for any violations with suggested fixes.

**Check:**

* All blockers resolved before merging to `main`.

---

## 16) Step-by-Step Plan (High Level)

1. **Scaffold** project (Next.js + TS + Tailwind + Contentlayer + shadcn/ui).
2. Implement **layout** (Header/Footer), typography, MDX components.
3. Add **Contentlayer schema**; render `/writing` index + post page.
4. Create base pages (`/about`, `/projects`, `/now`, `/uses`, `/contact`, `/resume`).
5. Add **SEO** (metadata, JSON‑LD), **RSS**, **sitemap**, **robots**.
6. Hook **analytics** (env‑toggled) + optional **Giscus**.
7. Export static and verify **Lighthouse**.
8. Configure **AWS** (S3, CloudFront OAC, ACM, Route 53).
9. Wire **GitHub Actions** for CI/CD (build/export/sync/invalidate).
10. Publish 2–3 posts + 2 projects; share.

---

## 17) RSS & Sitemap (Sketch)

`/lib/rss.ts`

```ts
export async function buildRss(posts) { /* generate feed.xml */ }
```

`sitemap.ts` (or use a simple static generator):

```ts
export async function buildSitemap(pages) { /* generate sitemap.xml */ }
```

---

## 18) Content Ideas (Initial)

* **WCF https‑only fix** (how to resolve MetadataExchange binding errors)
* **Pivot by week & hog group in T‑SQL** (no `STRING_AGG` required)
* **React Three.js tank gauge** (liquid level with physics-lite)
* **RTL‑SDR 2m scanner** on Mac/Pi (practical setup)

---

## 19) Definition of Done

* Build/export works; site deploys via CI to CloudFront.
* Core pages live; at least 2 posts published.
* Lighthouse: Perf ≥ 95, A11y 100, Best Practices ≥ 95, SEO ≥ 95.
* `sitemap.xml` + `feed.xml` valid.
* Analytics optional and disabled by default.

---

## 20) Future Enhancements

* OG image template generator per‑post.
* Search (client-side Fuse.js over a prebuilt JSON index).
* Serverless contact form (AWS SES + Lambda + API Gateway) — optional.
* Theme switch (system default with toggle).
* i18n later if needed.
* Dark mode by default (Tailwind `darkMode: 'media'`).