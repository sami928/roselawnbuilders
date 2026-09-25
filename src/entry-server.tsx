import { renderToString } from 'react-dom/server';
import App from '@/App';
import { findRoute, notFoundRoute, routes } from '@/routes';
import { renderHead } from '@/seo';

/** Used by scripts/prerender.js to turn every route into static HTML. */
export function render(path: string, siteUrl: string) {
  const route = findRoute(path);
  return { html: renderToString(<App url={path} />), head: renderHead(route, siteUrl) };
}

export const pages = routes.map(({ path, noindex, priority, changefreq }) => ({ path, noindex: !!noindex, priority, changefreq }));
export const notFoundPath = notFoundRoute.path;
