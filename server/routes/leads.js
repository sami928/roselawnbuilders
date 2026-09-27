import { Router } from 'express';
import { db } from '../db.js';
import { config } from '../config.js';
import { rateLimit } from '../rateLimit.js';
import { parseLead, parseTracking } from '../validate.js';

export const leadsRouter = Router();

const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many requests. Please call us instead.',
});

leadsRouter.post('/', leadLimiter, (req, res) => {
  // Honeypot: real visitors never see this field. Pretend success so bots move on.
  if (req.body?.company_website) return res.status(201).json({ ok: true });

  const { lead, errors } = parseLead(req.body);
  if (errors) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: errors });

  const tracking = parseTracking(req.body);
  const source = tracking.utm_source || (tracking.referrer ? hostOf(tracking.referrer) : '') || 'website';

  const result = db
    .prepare(
      `INSERT INTO leads (name, email, phone, zip, service, timeline, budget, message, source,
        landing_page, referrer, utm_source, utm_medium, utm_campaign, ip, user_agent)
       VALUES (:name, :email, :phone, :zip, :service, :timeline, :budget, :message, :source,
        :landing_page, :referrer, :utm_source, :utm_medium, :utm_campaign, :ip, :user_agent)`,
    )
    .run({ ...lead, ...tracking, source, ip: req.ip || '', user_agent: String(req.get('user-agent') || '').slice(0, 300) });

  const id = Number(result.lastInsertRowid);
  notify({ id, ...lead, source });
  res.status(201).json({ ok: true, id });
});

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function notify(lead) {
  if (!config.leadWebhookUrl) return;
  fetch(config.leadWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'lead.created', lead }),
    signal: AbortSignal.timeout(5000),
  }).catch((error) => console.error('[leads] webhook failed:', error.message));
}
