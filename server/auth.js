import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db.js';
import { config } from './config.js';

const scrypt = promisify(crypto.scrypt);
const COOKIE = 'rl_session';
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, key] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !key) return false;
  const expected = Buffer.from(key, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

// A real hash to compare against when the email is unknown, so response time doesn't reveal which emails exist.
const dummyHash = hashPassword(crypto.randomBytes(16).toString('hex'));

export async function authenticate(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim());
  const ok = await verifyPassword(password, user ? user.password_hash : await dummyHash);
  return user && ok ? user : null;
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 10) return 'Password must be at least 10 characters.';
  if (password.length > 200) return 'Password is too long.';
  return null;
}

export async function createUser({ email, password, name = '' }) {
  const hash = await hashPassword(password);
  const result = db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)').run(email.trim(), name.trim(), hash);
  return Number(result.lastInsertRowid);
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + config.sessionDays * 86400000);
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(hashToken(token), userId, expires.toISOString());
  db.prepare("UPDATE users SET last_login_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?").run(userId);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    expires,
    path: '/',
  });
}

export function destroySession(req, res) {
  const token = readCookie(req, COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  res.clearCookie(COOKIE, { path: '/' });
}

export function destroyOtherSessions(userId, req) {
  const token = readCookie(req, COOKIE);
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(userId, token ? hashToken(token) : '');
}

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index > -1 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

export function loadUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const row = db
    .prepare(`SELECT u.id, u.email, u.name, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`)
    .get(hashToken(token));
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
    return null;
  }
  return { id: row.id, email: row.email, name: row.name };
}

export function requireAuth(req, res, next) {
  const user = loadUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in.' });
  req.user = user;
  next();
}

export function pruneSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
}

export async function bootstrapAdmin() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) return;
  if (!config.adminEmail || !config.adminPassword) {
    console.warn('[auth] No admin users exist. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run create-admin`.');
    return;
  }
  const problem = validatePassword(config.adminPassword);
  if (problem) {
    console.warn(`[auth] ADMIN_PASSWORD rejected: ${problem}`);
    return;
  }
  await createUser({ email: config.adminEmail, password: config.adminPassword, name: 'Admin' });
  console.log(`[auth] Created admin user ${config.adminEmail}`);
}
