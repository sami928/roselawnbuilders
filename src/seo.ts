import { site } from '@/site';
import type { PageRoute } from '@/routes';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON-LD lives inside <script>; stop "</script>" in content from closing it early.
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function businessSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${siteUrl}/#business`,
    name: site.name,
    url: `${siteUrl}/`,
    logo: `${siteUrl}${site.logo}`,
    image: `${siteUrl}${site.ogImage}`,
    telephone: site.phoneHref.replace('tel:', ''),
    email: site.email,
    identifier: site.license,
    address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.state, addressCountry: 'US' },
    areaServed: site.areas.map((name) => ({ '@type': 'City', name })),
    sameAs: [site.googleBusinessUrl],
  };
}

function breadcrumbSchema(route: PageRoute, siteUrl: string) {
  if (!route.breadcrumbs?.length) return null;
  const items = [{ name: 'Home', path: '/' }, ...route.breadcrumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${siteUrl}${item.path === '/' ? '/' : item.path}` })),
  };
}

/** The <head> tags for a page, injected into the static HTML at build time. */
export function renderHead(route: PageRoute, siteUrl: string) {
  const url = `${siteUrl}${route.path === '/' ? '/' : route.path}`;
  const image = `${siteUrl}${route.ogImage ?? site.ogImage}`;
  const schemas = [businessSchema(siteUrl), breadcrumbSchema(route, siteUrl), ...(route.schema?.(siteUrl) ?? [])].filter(Boolean);

  return [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
    route.noindex ? '<meta name="robots" content="noindex, follow" />' : `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...schemas.map((schema) => `<script type="application/ld+json">${safeJson(schema)}</script>`),
  ].join('\n    ');
}

/** Keeps title/description/canonical in sync during client-side navigation. */
export function applyHead(route: PageRoute) {
  document.title = route.title;
  const set = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value);
  set('meta[name="description"]', 'content', route.description);
  set('meta[property="og:title"]', 'content', route.title);
  set('meta[property="og:description"]', 'content', route.description);
  const url = `${window.location.origin}${route.path}`;
  set('meta[property="og:url"]', 'content', url);
  set('link[rel="canonical"]', 'href', url);
}
