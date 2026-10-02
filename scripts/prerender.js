// Renders every route in src/routes.tsx to static HTML (with its own <head>),
// then writes sitemap.xml and robots.txt. Runs after `vite build` + the SSR build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

try {
  process.loadEnvFile();
} catch {
  // optional .env
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(root, 'dist', 'client');
const siteUrl = (process.env.SITE_URL || 'https://roselawnbuilders.si').replace(/\/+$/, '');

const { render, pages, notFoundPath } = await import(pathToFileURL(path.join(root, 'dist', 'server', 'entry-server.js')).href);
const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');

const writePage = (urlPath, file) => {
  const { html, head } = render(urlPath, siteUrl);
  const output = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
  const target = path.join(clientDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, output);
  console.log(`  ${urlPath.padEnd(40)} → ${file}`);
};

console.log(`Prerendering for ${siteUrl}`);
for (const page of pages) writePage(page.path, page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`);
writePage(notFoundPath, '404.html');

const today = new Date().toISOString().slice(0, 10);
const urls = pages
  .filter((page) => !page.noindex)
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.path === '/' ? '/' : page.path}</loc>
    <lastmod>${today}</lastmod>${page.changefreq ? `\n    <changefreq>${page.changefreq}</changefreq>` : ''}${page.priority != null ? `\n    <priority>${page.priority.toFixed(1)}</priority>` : ''}
  </url>`,
  );
fs.writeFileSync(path.join(clientDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(clientDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /thank-you\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Wrote sitemap.xml (${urls.length} URLs) and robots.txt`);
