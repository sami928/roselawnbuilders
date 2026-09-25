import { Router } from 'express';
import { db, LEAD_STATUSES, transaction } from '../db.js';
import { rateLimit } from '../rateLimit.js';
import { parseLead } from '../validate.js';
import {
  authenticate,
  createSession,
  destroyOtherSessions,
  destroySession,
  loadUser,
  requireAuth,
  validatePassword,
  verifyPassword,
  hashPassword,
} from '../auth.js';

export const authRouter = Router();
export const adminRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again in a few minutes.' });

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required.' });
  const user = await authenticate(email, password);
  if (!user) return res.status(401).json({ error: 'That email and password don’t match.' });
  createSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post('/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  const user = loadUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ user });
});

authRouter.post('/password', requireAuth, async (req, res) => {
  const { current, next } = req.body ?? {};
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!row || typeof current !== 'string' || !(await verifyPassword(current, row.password_hash))) {
    return res.status(400).json({ error: 'Your current password is incorrect.' });
  }
  const problem = validatePassword(next);
  if (problem) return res.status(422).json({ error: problem });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(next), req.user.id);
  destroyOtherSessions(req.user.id, req);
  res.json({ ok: true });
});

adminRouter.use(requireAuth);

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  estimate_scheduled: 'Estimate scheduled',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

const SORTS = {
  newest: 'created_at DESC',
  oldest: 'created_at ASC',
  updated: 'updated_at DESC',
  value: 'COALESCE(estimated_value, 0) DESC, created_at DESC',
  name: 'name COLLATE NOCASE ASC',
};

function buildFilter(query) {
  const where = [];
  const params = {};
  if (query.status && LEAD_STATUSES.includes(query.status)) {
    where.push('status = :status');
    params.status = query.status;
  }
  if (query.service) {
    where.push('service = :service');
    params.service = String(query.service);
  }
  if (query.q) {
    where.push('(name LIKE :q OR email LIKE :q OR phone LIKE :q OR zip LIKE :q OR message LIKE :q)');
    params.q = `%${String(query.q).trim().replace(/[%_]/g, '')}%`;
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

adminRouter.get('/leads', (req, res) => {
  const { sql, params } = buildFilter(req.query);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 25, 1), 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const order = SORTS[req.query.sort] || SORTS.newest;
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM leads ${sql}`).get(params);
  const leads = db
    .prepare(
      `SELECT id, name, email, phone, zip, service, timeline, budget, status, estimated_value, source, created_at, updated_at
       FROM leads ${sql} ORDER BY ${order} LIMIT :limit OFFSET :offset`,
    )
    .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });
  res.json({ leads, total, page, pageSize });
});

adminRouter.get('/leads.csv', (req, res) => {
  const { sql, params } = buildFilter(req.query);
  const rows = db.prepare(`SELECT * FROM leads ${sql} ORDER BY created_at DESC`).all(params);
  const columns = ['id', 'created_at', 'status', 'name', 'email', 'phone', 'zip', 'service', 'timeline', 'budget', 'estimated_value', 'message', 'source', 'utm_source', 'utm_medium', 'utm_campaign', 'landing_page', 'referrer'];
  const escape = (value) => {
    let text = value == null ? '' : String(value);
    // Neutralise spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))].join('\r\n');
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="roselawn-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`﻿${csv}`);
});

function getLead(id) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return null;
  lead.notes = db
    .prepare(
      `SELECT n.id, n.kind, n.body, n.created_at, u.name AS author_name, u.email AS author_email
       FROM lead_notes n LEFT JOIN users u ON u.id = n.user_id WHERE n.lead_id = ? ORDER BY n.created_at DESC, n.id DESC`,
    )
    .all(id);
  return lead;
}

adminRouter.get('/leads/:id', (req, res) => {
  const lead = getLead(Number(req.params.id));
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json({ lead });
});

adminRouter.post('/leads', (req, res) => {
  const { lead, errors } = parseLead(req.body, { strict: false });
  if (errors) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: errors });
  const source = typeof req.body.source === 'string' && req.body.source.trim() ? req.body.source.trim().slice(0, 60) : 'manual';
  const id = transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO leads (name, email, phone, zip, service, timeline, budget, message, source)
         VALUES (:name, :email, :phone, :zip, :service, :timeline, :budget, :message, :source)`,
      )
      .run({ ...lead, source });
    const leadId = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO lead_notes (lead_id, user_id, kind, body) VALUES (?, ?, 'event', ?)").run(leadId, req.user.id, 'Lead added manually');
    return leadId;
  });
  res.status(201).json({ lead: getLead(id) });
});

adminRouter.patch('/leads/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  const body = req.body ?? {};
  const updates = {};
  const events = [];

  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status)) return res.status(422).json({ error: 'Unknown status.' });
    if (body.status !== existing.status) {
      updates.status = body.status;
      events.push(`Status changed from ${STATUS_LABELS[existing.status] ?? existing.status} to ${STATUS_LABELS[body.status]}`);
    }
  }

  if (body.estimated_value !== undefined) {
    const value = body.estimated_value === null || body.estimated_value === '' ? null : Math.round(Number(body.estimated_value));
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100_000_000)) return res.status(422).json({ error: 'Estimated value must be a positive number.' });
    if (value !== existing.estimated_value) {
      updates.estimated_value = value;
      events.push(value === null ? 'Estimated value cleared' : `Estimated value set to $${value.toLocaleString('en-US')}`);
    }
  }

  const contactFields = ['name', 'email', 'phone', 'zip', 'service', 'timeline', 'budget', 'message'];
  if (contactFields.some((field) => body[field] !== undefined)) {
    const merged = Object.fromEntries(contactFields.map((field) => [field, body[field] !== undefined ? body[field] : existing[field]]));
    const { lead, errors } = parseLead(merged, { strict: false });
    if (errors) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: errors });
    const changed = contactFields.filter((field) => lead[field] !== existing[field]);
    for (const field of changed) updates[field] = lead[field];
    if (changed.length) events.push(`Updated ${changed.join(', ')}`);
  }

  if (Object.keys(updates).length) {
    transaction(() => {
      const assignments = Object.keys(updates).map((field) => `${field} = :${field}`);
      db.prepare(`UPDATE leads SET ${assignments.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = :id`).run({ ...updates, id });
      const insert = db.prepare("INSERT INTO lead_notes (lead_id, user_id, kind, body) VALUES (?, ?, 'event', ?)");
      for (const event of events) insert.run(id, req.user.id, event);
    });
  }
  res.json({ lead: getLead(id) });
});

adminRouter.delete('/leads/:id', (req, res) => {
  const result = db.prepare('DELETE FROM leads WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Lead not found.' });
  res.json({ ok: true });
});

adminRouter.post('/leads/:id/notes', (req, res) => {
  const id = Number(req.params.id);
  const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 4000) : '';
  if (!body) return res.status(422).json({ error: 'Write a note first.' });
  if (!db.prepare('SELECT id FROM leads WHERE id = ?').get(id)) return res.status(404).json({ error: 'Lead not found.' });
  transaction(() => {
    db.prepare("INSERT INTO lead_notes (lead_id, user_id, kind, body) VALUES (?, ?, 'note', ?)").run(id, req.user.id, body);
    db.prepare("UPDATE leads SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(id);
  });
  res.status(201).json({ lead: getLead(id) });
});

adminRouter.delete('/leads/:id/notes/:noteId', (req, res) => {
  const result = db.prepare("DELETE FROM lead_notes WHERE id = ? AND lead_id = ? AND kind = 'note'").run(Number(req.params.noteId), Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Note not found.' });
  res.json({ lead: getLead(Number(req.params.id)) });
});

adminRouter.get('/stats', (req, res) => {
  const days = 30;
  const since = new Date(Date.now() - (days - 1) * 86400000);
  since.setUTCHours(0, 0, 0, 0);

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0]));
  for (const row of db.prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status').all()) byStatus[row.status] = row.count;

  const totals = db
    .prepare(
      `SELECT COUNT(*) AS total,
        SUM(CASE WHEN created_at >= :week THEN 1 ELSE 0 END) AS last7,
        SUM(CASE WHEN created_at >= :prevWeek AND created_at < :week THEN 1 ELSE 0 END) AS prev7,
        SUM(CASE WHEN status NOT IN ('won', 'lost') THEN COALESCE(estimated_value, 0) ELSE 0 END) AS pipeline,
        SUM(CASE WHEN status = 'won' THEN COALESCE(estimated_value, 0) ELSE 0 END) AS wonValue
       FROM leads`,
    )
    .get({ week: new Date(Date.now() - 7 * 86400000).toISOString(), prevWeek: new Date(Date.now() - 14 * 86400000).toISOString() });

  const dailyRows = db
    .prepare('SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM leads WHERE created_at >= ? GROUP BY day')
    .all(since.toISOString());
  const dailyMap = new Map(dailyRows.map((row) => [row.day, row.count]));
  const daily = Array.from({ length: days }, (_, index) => {
    const day = new Date(since.getTime() + index * 86400000).toISOString().slice(0, 10);
    return { day, count: dailyMap.get(day) ?? 0 };
  });

  const byService = db.prepare("SELECT COALESCE(NULLIF(service, ''), 'Unspecified') AS label, COUNT(*) AS count FROM leads GROUP BY label ORDER BY count DESC LIMIT 8").all();
  const bySource = db.prepare('SELECT source AS label, COUNT(*) AS count FROM leads GROUP BY source ORDER BY count DESC LIMIT 8').all();
  const services = db.prepare("SELECT DISTINCT service FROM leads WHERE service != '' ORDER BY service").all().map((row) => row.service);

  const closed = byStatus.won + byStatus.lost;
  res.json({
    total: totals.total ?? 0,
    last7: totals.last7 ?? 0,
    prev7: totals.prev7 ?? 0,
    pipelineValue: totals.pipeline ?? 0,
    wonValue: totals.wonValue ?? 0,
    winRate: closed ? byStatus.won / closed : null,
    byStatus,
    daily,
    byService,
    bySource,
    services,
  });
});
