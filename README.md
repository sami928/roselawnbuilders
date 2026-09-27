# Roselawn Builders — lead capture site

A lead-generation website for a construction contractor, built on **Node.js + React**:

- **Sales funnel homepage** (`/`): a long-form landing page with a multi-step estimate form in the hero and again at the bottom. It covers the pain points, your promises, services, the four-step process, FAQ and a final call to action.
- **SEO-friendly extra pages**: every page is prerendered to static HTML with its own `<title>`, meta description, canonical URL, Open Graph tags and JSON-LD (LocalBusiness, Service, FAQPage, BreadcrumbList). The build writes `sitemap.xml` and `robots.txt` for you.
- **Lead dashboard** (`/admin`): a sign-in-protected back office to search, filter, update and export leads, with a pipeline, notes and stats.

## Stack

| Layer | What |
| --- | --- |
| Frontend | React 18 + TypeScript, Vite, custom CSS (public site), Tailwind (dashboard), lucide-react icons |
| Rendering | Static prerendering at build time (`scripts/prerender.js`), hydrated in the browser |
| Backend | Express 5 on Node ≥ 22.13 |
| Database | SQLite through Node's built-in `node:sqlite`, so there are no native modules to compile |
| Auth | scrypt password hashes and server-side sessions in an httpOnly cookie |

## Getting started

```bash
npm install
cp .env.example .env        # set ADMIN_EMAIL and ADMIN_PASSWORD (10+ chars)
npm run dev                 # Vite on :5173 and the API on :3001 (proxied)
```

- Site: http://localhost:5173
- Dashboard: http://localhost:5173/admin

The first time the server starts with no users, it creates the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. To add more staff or reset a password:

```bash
npm run create-admin -- jane@roselawnbuilders.com 'a-long-password' Jane
```

## Production

```bash
SITE_URL=https://www.yourdomain.com npm run build   # client build, SSR build, prerender
npm start                                            # serves the site and API on $PORT
```

The one Node process serves the prerendered pages, the dashboard and the API. Leads are stored in `data/roselawn.db` (set `DATA_DIR` to put it on a persistent volume). Behind a proxy such as Render, Fly, Railway or Nginx, set `TRUST_PROXY=true` so rate limiting sees the real visitor IP. Back up the `data/` directory regularly.

## Adding pages

1. Create a component in `src/pages/`, e.g. `src/pages/DeckBuildingPage.tsx`.
2. Add an entry to `routes` in `src/routes.tsx`:

   ```tsx
   {
     path: '/deck-building-portland',
     title: 'Deck Building in Portland, OR | Roselawn Builders',
     description: 'Custom cedar and composite decks for Portland-area homes…',
     Component: DeckBuildingPage,
     priority: 0.8,
     breadcrumbs: [{ name: 'Deck building', path: '/deck-building-portland' }],
   }
   ```

3. Link to it with `<Link href="/deck-building-portland">` from `@/router`.

On the next `npm run build` it is prerendered and added to the sitemap. To add a whole service page, add an item to `src/content/services.ts`; its route, nav link, footer link and form option are all generated from that list. Use the `<LeadForm />` component to put the estimate form on any page.

## Editing content

- **Business details** (phone, email, license, service areas): `src/site.ts`
- **Services**: `src/content/services.ts`
- **Funnel copy** (pain points, promises, process, FAQ): `src/content/funnel.ts`
- **Testimonials**: add real client reviews to `site.testimonials` and the section appears on its own.

## Lead tracking

- UTM parameters, the external referrer and the landing page are saved with each lead and shown in the dashboard as its **source**.
- A successful submission goes to `/thank-you` (noindex). Use that URL as the conversion goal in Google Ads or Meta, or listen for the `generate_lead` event pushed to `dataLayer`/`gtag`.
- Set `LEAD_WEBHOOK_URL` to POST every new lead as JSON to Zapier, Make, a Slack workflow and so on, for instant email or text alerts.

## Dashboard features

- Stat tiles: total leads, new this week vs. the previous week, open pipeline value, win rate.
- A 30-day chart of leads per day and counts by pipeline stage (click a stage to filter).
- Search, filtering by stage or project type, sorting and pagination.
- Lead drawer: change the stage, call/text/email in one tap, edit details, set an estimated job value, add notes, and see an automatic activity history.
- Add phone-in or referral leads by hand, export to CSV (respects the current filters), change your password.

## Security notes

- Lead submissions are validated on the server, rate-limited to 5 per 10 minutes per IP, and filtered by a honeypot field.
- Sign-in is rate-limited, sessions are random tokens stored hashed, and cookies are httpOnly, SameSite=Lax, and Secure in production.
- API writes must be same-origin JSON, which blocks CSRF. The dashboard and API are `noindex` and `no-store`.
- CSV export guards against spreadsheet formula injection.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server plus the API with auto-reload |
| `npm run build` | Client build, SSR bundle, prerender, sitemap and robots |
| `npm start` | Production server |
| `npm run create-admin -- <email> <password> [name]` | Create a dashboard user or reset a password |
| `npm run typecheck` / `npm run lint` | Checks |
