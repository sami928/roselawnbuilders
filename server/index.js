import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import { bootstrapAdmin, pruneSessions } from './auth.js';
import { leadsRouter } from './routes/leads.js';
import { adminRouter, authRouter } from './routes/admin.js';

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  if (config.isProduction) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ---------- API ----------
const api = express.Router();
api.use(express.json({ limit: '32kb' }));

// Cross-site request protection: state-changing calls must be same-origin JSON.
api.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (!req.is('application/json')) return res.status(415).json({ error: 'Expected JSON.' });
  const origin = req.get('origin');
  if (origin && originHost(origin) !== req.get('host')) return res.status(403).json({ error: 'Cross-origin request blocked.' });
  next();
});

function originHost(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

api.get('/health', (req, res) => res.json({ ok: true }));
api.use('/leads', leadsRouter);
api.use('/auth', authRouter);
api.use('/admin', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, adminRouter);
api.use((req, res) => res.status(404).json({ error: 'Not found.' }));
api.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});
app.use('/api', api);

// ---------- Prerendered site + admin app ----------
const clientDir = config.clientDir;
if (fs.existsSync(clientDir)) {
  app.use('/assets', express.static(path.join(clientDir, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(clientDir, { index: false, extensions: false, redirect: false, maxAge: '1h' }));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    let pathname = decodeURIComponent(req.path);

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
      return res.sendFile(path.join(clientDir, 'admin', 'index.html'));
    }

    // One canonical URL per page: no trailing slash.
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const query = req.originalUrl.slice(req.path.length);
      return res.redirect(301, pathname.replace(/\/+$/, '') + query);
    }

    pathname = pathname === '/' ? '/index' : pathname;
    const file = path.join(clientDir, `${pathname}.html`);
    if (file.startsWith(clientDir + path.sep) && fs.existsSync(file)) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.sendFile(file);
    }
    res.status(404).sendFile(path.join(clientDir, '404.html'));
  });
} else {
  console.warn('[server] dist/client not found — run `npm run build`, or use `npm run dev` for the Vite dev server.');
}

await bootstrapAdmin();
pruneSessions();
setInterval(pruneSessions, 6 * 3600 * 1000).unref();

app.listen(config.port, () => console.log(`[server] Roselawn listening on http://localhost:${config.port}`));
