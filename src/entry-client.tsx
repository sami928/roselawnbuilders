import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from '@/App';
import { findRoute } from '@/routes';
import { applyHead } from '@/seo';
import { captureAttribution } from '@/lib/tracking';
import './index.css';

captureAttribution();

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App url={window.location.pathname} />
  </StrictMode>
);

// Production pages are prerendered, so hydrate them; the dev server serves an empty shell.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  applyHead(findRoute(window.location.pathname));
  createRoot(container).render(app);
}
