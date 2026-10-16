# yashvardhan.tech

Portfolio of Yashvardhan Thanvi, founder of LLMSlim and AMEYOR. A single-mode, static site with an interactive ASCII field, Motion animations, and two small serverless functions. No framework and no build step.

## Run it

```bash
npm run dev      # http://localhost:3000, mirrors Vercel headers, redirects and /api/*
npm run check    # CSP hashes, broken local links, inline code, banned dashes
```

The dev server sets `CONTACT_DRY_RUN=1`, so the contact form logs instead of sending. Lighthouse reports from the last run are in `lighthouse/` (git-ignored).

## Layout

| Path | What it is |
|---|---|
| `index.html` | The whole page. Content lives here. |
| `assets/css/site.css` | Design tokens (dark and light), layout, components. |
| `assets/js/ascii.js` | Interactive ASCII field: simplex noise, cursor lens, click ripples. Pauses off-screen and respects reduced motion. |
| `assets/js/site.js` | Theme toggle, Ctrl/⌘ K command menu, video player, copy buttons, terminal typing, contact form, live stats, Motion reveals. |
| `assets/js/motion.min.js` | Motion 12 (the vanilla build of Framer Motion), loaded after the page is idle. |
| `api/contact.js` | Contact form: validation, same-origin check, honeypot, timing check, rate limit, delivery via Resend or Formspree. |
| `api/stats.js` | Live GitHub stars, merged PRs and the latest PyPI release, cached at the edge for an hour. |
| `vercel.json` | Security headers (strict CSP, HSTS, frame and permissions policies), caching, redirects for old URLs. |

## Editing

- After changing CSS or JS, bump the `?v=` query on its `<link>`/`<script>` tag in `index.html` and `404.html`. Assets are cached for a year.
- The small inline theme script in `<head>` is allowed by a SHA-256 hash in the CSP. If you edit it, `npm run check` prints the new hash to put in `vercel.json`.
- Inline `style=""` attributes and `onclick=""` handlers are blocked by the CSP. Use classes and `site.js`.
- House style: no em or en dashes. `npm run check` enforces it.
- Project images: 16:9 WebP at 640, 960 and 1280 px in `assets/img/work/`.

## Environment variables (Vercel)

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Recommended. Sends contact messages through Resend. |
| `CONTACT_FROM` | Sender on a Resend-verified domain, e.g. `Portfolio <contact@yashvardhan.tech>`. |
| `CONTACT_TO` | Inbox for messages. Defaults to `founder@llmslim.app`. |
| `FORMSPREE_FORM_ID` | Fallback when Resend is not set. Defaults to the existing form `meozqqoj`. |
| `GITHUB_TOKEN` | Optional read-only token to raise GitHub API limits for `/api/stats`. |

## Deploy

The live domain is currently served from the `yt-portfolio` Vercel project. To ship this version, either point the domain at a Vercel project built from this repository, or copy these files into that repository. Vercel needs no build settings: framework "Other", no build command, root directory as the output.
